#!/usr/bin/env python3
"""
Generates, extends, and edits videos using the Gemini Omni 1.1 Flash model via the google-genai Interactions API.
Can automatically upload local media references using the Files API.
Supports first frame and first+last frame transitions, video extensions (up to 40s),
video references (<VIDEO_REF_0>, etc.), image references, and parallel batch execution.
Uses the official google-genai SDK.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import uuid
from google import genai
from google.genai import types, errors

# Ensure stdout is unbuffered/line-buffered for real-time progress logs
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

# Load local upload helper logic inline to prevent dependency issues
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from upload_file import upload_file, wait_for_active

DEFAULT_MODEL = "gemini-omni-1.1-flash"

def get_api_key():
    """Retrieves API key strictly from GEMINI_API_KEY environment variable."""
    return os.environ.get("GEMINI_API_KEY")

def strip_query_params(url):
    """Strips query parameters from URL for clean logging and security."""
    if not url:
        return ""
    parsed = urllib.parse.urlparse(url)
    return urllib.parse.urlunparse(parsed._replace(query=""))

def sanitize_error(err):
    """Sanitizes error messages by redacting API keys, tokens, query parameters, internal provider URLs, and raw response bodies."""
    if not err:
        return ""

    # If it is an SDK APIError, prefer clean code + status + message over raw dictionary dump
    if isinstance(err, errors.APIError):
        parts = []
        if getattr(err, "code", None):
            parts.append(str(err.code))
        if getattr(err, "status", None):
            parts.append(f"({err.status})")
        if getattr(err, "message", None):
            parts.append(f": {err.message}")
        elif getattr(err, "details", None):
            parts.append(f": {err.details}")
        err_str = " ".join(parts) if parts else str(err)
    else:
        err_str = str(err)

    # 1. Directly redact the active API key value if present
    key = get_api_key()
    if key and len(key) >= 8:
        err_str = err_str.replace(key, "[REDACTED_KEY]")

    # 2. Redact known Google API key & OAuth token patterns:
    # Classic Google API key: AIza... (30-45 chars)
    err_str = re.sub(r'AIza[0-9A-Za-z_\-]{30,}', '[REDACTED_KEY]', err_str)
    # Newer Google Cloud / Gemini API key: AQ....
    err_str = re.sub(r'AQ\.[0-9A-Za-z_\-]{20,}', '[REDACTED_KEY]', err_str)
    # Google OAuth access token: ya29....
    err_str = re.sub(r'ya29\.[0-9A-Za-z_\-]+', '[REDACTED_TOKEN]', err_str)
    # Bearer tokens
    err_str = re.sub(r'Bearer\s+[A-Za-z0-9_\-\.]+', 'Bearer [REDACTED_TOKEN]', err_str, flags=re.IGNORECASE)

    # 3. Strip sensitive query parameters from any URLs (key, token, secret, signature)
    err_str = re.sub(r'([?&](?:key|api_key|apiKey|access_token|auth|signature)=)[^&\s"\'<>()]+', r'\1[REDACTED]', err_str)

    # 4. Strip internal Google / provider infrastructure URLs & hosts
    err_str = re.sub(r'https?://[a-zA-Z0-9.\-_]*\.corp\.goog[^\s"\'<>)]*', '[INTERNAL_HOST]', err_str)
    err_str = re.sub(r'https?://[a-zA-Z0-9.\-_]*\.sandbox\.googleapis\.com[^\s"\'<>)]*', '[SANDBOX_ENDPOINT]', err_str)
    err_str = re.sub(r'https?://(?:generativelanguage|aiplatform)\.googleapis\.com/v[0-9a-z_]+/', '[API_ENDPOINT]/', err_str)

    # 5. Redact raw response bodies (once a body= marker is found, redact the remainder)
    err_str = re.sub(r'\bbody\s*=.*\Z', 'body=[REDACTED_BODY]', err_str, flags=re.IGNORECASE | re.DOTALL)

    # 6. Strip HTML error pages / raw HTML response bodies
    if "<html" in err_str.lower() or "<!doctype" in err_str.lower() or "<body" in err_str.lower():
        title_match = re.search(r'<title>(.*?)</title>', err_str, re.IGNORECASE)
        if title_match:
            err_str = f"HTTP Error Response: {title_match.group(1).strip()}"
        else:
            err_str = re.sub(r'<[^>]+>', ' ', err_str)

    # 7. Collapse excessive whitespace and cap oversized error dumps
    err_str = re.sub(r'\s+', ' ', err_str).strip()
    if len(err_str) > 500:
        err_str = err_str[:497] + "..."

    return err_str

def is_file_uri(uri):
    """Returns True if the string is a standard Gemini File URI."""
    if not uri:
        return False
    return "files/" in uri and ("generativelanguage.googleapis.com" in uri or uri.startswith("files/"))

def normalize_file_uri(uri):
    """Normalizes any File API URI/reference to the standard format with query parameters stripped."""
    if not uri:
        return None
    match = re.search(r'files/([a-zA-Z0-9]+)', uri)
    if match:
        file_id = match.group(1)
        return f"https://generativelanguage.googleapis.com/files/{file_id}"
    return strip_query_params(uri)

def slugify(text):
    """Converts a text prompt into a safe, descriptive filename slug."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')[:50]

def parse_and_validate_duration(value):
    """Parses and formats a duration integer between 3 and 10 with optional 's' suffix."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        val = float(value)
    else:
        clean_value = str(value).strip().lower()
        if clean_value in ('none', ''):
            return None
        if clean_value.endswith('s'):
            clean_value = clean_value[:-1]
        try:
            val = float(clean_value)
        except ValueError:
            raise ValueError(f"Invalid duration value: '{value}'. Must be an integer (e.g., 5, 10).")
            
    if not val.is_integer():
        raise ValueError(f"Duration must be an integer, not a float (e.g., got {value}).")
        
    val_int = int(val)
    if val_int < 3 or val_int > 10:
        raise ValueError(f"Duration must be between 3 (inclusive) and 10 (inclusive) seconds. Got {val_int}.")
        
    return f"{val_int}s"

def argparse_duration_type(value):
    """argparse type converter for validating duration."""
    if value is None or str(value).strip().lower() in ('none', ''):
        return None
    try:
        return parse_and_validate_duration(value)
    except ValueError as e:
        raise argparse.ArgumentTypeError(str(e))

def parse_and_validate_resolution(value):
    """Validates and normalizes video output resolution to '360p', '720p', '1080p', or '4k'."""
    if value is None:
        return None
    val = str(value).strip().lower()
    if val in ('none', ''):
        return None
    valid_resolutions = {"360p", "720p", "1080p", "4k"}
    if val in valid_resolutions:
        return val
    raise ValueError(
        f"Invalid resolution '{value}'. Supported resolutions for Gemini Omni Flash are: 360p, 720p, 1080p, 4k."
    )

def argparse_resolution_type(value):
    """argparse type converter for validating video resolution."""
    if value is None or str(value).strip().lower() in ('none', ''):
        return None
    try:
        return parse_and_validate_resolution(value)
    except ValueError as e:
        raise argparse.ArgumentTypeError(str(e))

def resolve_or_upload_asset(asset_path, mime_type, strip_audio=False):
    """
    If asset_path is a File API URI, returns it directly (normalized).
    If it is a local file path, uploads it and returns its File API URI (normalized).
    """
    if not asset_path:
        return None, None

    if not get_api_key():
        raise RuntimeError("Error: GEMINI_API_KEY environment variable is not set.")

    if is_file_uri(asset_path):
        if strip_audio:
            raise ValueError(
                "Error: --strip-audio cannot be applied to an existing remote File API URI. "
                "Please provide a local video file so audio can be stripped before upload."
            )
        normalized = normalize_file_uri(asset_path)
        print(f"Using existing File URI: {strip_query_params(normalized)}")
        return normalized, mime_type

    if os.path.exists(asset_path):
        upload_path = asset_path
        temp_stripped_path = None

        try:
            if strip_audio:
                print(f"Detected local asset path '{asset_path}'. Stripping audio before upload...")
                
                # Check if ffmpeg is available
                try:
                    subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                except (subprocess.SubprocessError, FileNotFoundError):
                    raise RuntimeError(
                        "Error: ffmpeg is not installed or not found in system PATH. "
                        "ffmpeg is required to strip audio from local videos when --strip-audio is specified."
                    )

                os.makedirs("media", exist_ok=True)
                base_name = os.path.basename(asset_path)
                name, ext = os.path.splitext(base_name)
                temp_stripped_path = os.path.join("media", f"temp_stripped_{name}_{uuid.uuid4().hex}{ext}")

                # Fast stream-copy audio stripping
                cmd = ["ffmpeg", "-y", "-i", asset_path, "-c:v", "copy", "-an", temp_stripped_path]
                proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                if proc.returncode != 0:
                    err_msg = sanitize_error(proc.stderr.strip()) if proc.stderr else "Unknown ffmpeg error"
                    raise RuntimeError(f"ffmpeg failed to strip audio from '{asset_path}': {err_msg}")

                print(f"Successfully stripped audio. Temporary video file created at: {temp_stripped_path}")
                upload_path = temp_stripped_path

            print(f"Uploading asset '{upload_path}'...")
            file_meta = upload_file(upload_path)
            file_name = file_meta.get("name")
            # Wait for file to become active
            file_meta = wait_for_active(file_name)
            normalized = normalize_file_uri(file_meta.get("uri"))

            # Handle both mimeType and mime_type key formats returned from upload_file
            returned_mime = file_meta.get("mimeType") or file_meta.get("mime_type")
            return normalized, returned_mime
        finally:
            # Clean up temporary stripped file if we created one, guaranteed in finally block
            if temp_stripped_path and os.path.exists(temp_stripped_path):
                try:
                    os.remove(temp_stripped_path)
                    print(f"Cleaned up temporary video file: {temp_stripped_path}")
                except Exception as e:
                    print(f"Warning: Failed to remove temporary file {temp_stripped_path}: {sanitize_error(e)}", file=sys.stderr)
    else:
        raise FileNotFoundError(f"Asset path '{asset_path}' is neither a valid File API URI nor a local file path.")

def download_video_file(file_or_uri, output_path, client=None):
    """Downloads generated video file using the official google-genai SDK files.download method."""
    if not file_or_uri:
        raise ValueError("Download error: file reference or URI is required.")

    if not get_api_key():
        raise RuntimeError("Error: GEMINI_API_KEY environment variable is not set.")

    if client is None:
        client = genai.Client()

    display_uri = getattr(file_or_uri, "uri", str(file_or_uri))
    print(f"Downloading video from {strip_query_params(display_uri)} to {output_path} via SDK...")
    try:
        download_target = getattr(file_or_uri, "uri", file_or_uri)
        video_bytes = client.files.download(file=download_target)
        parent_dir = os.path.dirname(output_path)
        if parent_dir:
            os.makedirs(parent_dir, exist_ok=True)

        with open(output_path, "wb") as f:
            f.write(video_bytes)
        print(f"Video successfully saved to: {output_path}")
    except Exception as e:
        raise RuntimeError(f"Error downloading video file via SDK: {sanitize_error(e)}")

def generate_video(
    prompt,
    model=DEFAULT_MODEL,
    aspect_ratio="16:9",
    duration=None,
    resolution=None,
    first_frame=None,
    last_frame=None,
    image_path=None,
    image_reference=None,
    video_path=None,
    extend_video=None,
    video_reference=None,
    task=None,
    output_path="output.mp4",
    strip_audio=False,
    previous_interaction_id=None,
    timeout=600
):
    """Creates an interaction with the video model and downloads the resulting video using the official google-genai SDK."""
    if not get_api_key():
        raise RuntimeError("Error: GEMINI_API_KEY environment variable is not set.")

    # Validation: last_frame requires first_frame
    if last_frame and not first_frame:
        raise ValueError("--last-frame must be used with --first-frame (the model requires a starting frame when specifying a final frame).")

    duration = parse_and_validate_duration(duration)
    input_parts = []

    # Collect reference images (supporting image_path and image_reference aliases)
    ref_images = []
    if image_path:
        if isinstance(image_path, list):
            ref_images.extend(image_path)
        else:
            ref_images.append(image_path)
    if image_reference:
        if isinstance(image_reference, list):
            ref_images.extend(image_reference)
        else:
            ref_images.append(image_reference)

    # Collect reference videos
    ref_videos = []
    if video_reference:
        if isinstance(video_reference, list):
            ref_videos.extend(video_reference)
        else:
            ref_videos.append(video_reference)

    if len(ref_videos) > 3:
        print(f"Note: {len(ref_videos)} reference videos provided. The ideal number of reference videos is up to 3 (though more are supported).")

    # 1. Resolve and add first frame image
    f1_uri = None
    f1_mime = None
    if first_frame:
        f1_uri, f1_mime = resolve_or_upload_asset(first_frame, "image/png")
        input_parts.append({
            "type": "image",
            "uri": f1_uri,
            "mime_type": f1_mime
        })

    # 2. Resolve and add last frame image (must follow first frame)
    if last_frame:
        if last_frame == first_frame and f1_uri:
            # Re-use already uploaded asset for looping video
            input_parts.append({
                "type": "image",
                "uri": f1_uri,
                "mime_type": f1_mime
            })
        else:
            f2_uri, f2_mime = resolve_or_upload_asset(last_frame, "image/png")
            input_parts.append({
                "type": "image",
                "uri": f2_uri,
                "mime_type": f2_mime
            })

    # 3. Resolve and add general reference image inputs (<IMAGE_REF_0>, ...)
    for img in ref_images:
        img_uri, img_mime = resolve_or_upload_asset(img, "image/png")
        input_parts.append({
            "type": "image",
            "uri": img_uri,
            "mime_type": img_mime
        })

    # 4. Resolve and add source video for extension or editing
    if extend_video:
        ext_uri, ext_mime = resolve_or_upload_asset(extend_video, "video/mp4", strip_audio=strip_audio)
        input_parts.append({
            "type": "video",
            "uri": ext_uri,
            "mime_type": ext_mime
        })

    if video_path:
        if isinstance(video_path, list):
            for path in video_path:
                vid_uri, vid_mime = resolve_or_upload_asset(path, "video/mp4", strip_audio=strip_audio)
                input_parts.append({
                    "type": "video",
                    "uri": vid_uri,
                    "mime_type": vid_mime
                })
        else:
            vid_uri, vid_mime = resolve_or_upload_asset(video_path, "video/mp4", strip_audio=strip_audio)
            input_parts.append({
                "type": "video",
                "uri": vid_uri,
                "mime_type": vid_mime
            })

    # 5. Resolve and add reference videos (<VIDEO_REF_0>, <VIDEO_REF_1>, ...)
    for ref_vid in ref_videos:
        rv_uri, rv_mime = resolve_or_upload_asset(ref_vid, "video/mp4", strip_audio=strip_audio)
        input_parts.append({
            "type": "video",
            "uri": rv_uri,
            "mime_type": rv_mime
        })

    # 6. Format and add text prompt with appropriate role tags if not explicitly declared
    prompt_text = prompt

    if "[# Sources" not in prompt and "[# References" not in prompt:
        if extend_video:
            sources_part = "[# Sources <VIDEO_0>@Video1]"
            ref_parts = []
            img_start_num = (2 if last_frame and last_frame != first_frame else 1) if first_frame else 0
            for idx, _ in enumerate(ref_images):
                ref_parts.append(f"<IMAGE_REF_{idx}>@Image{img_start_num + idx + 1}")
            vid_start_num = 1
            if video_path:
                if isinstance(video_path, list):
                    vid_start_num += len(video_path)
                else:
                    vid_start_num += 1
            for idx, _ in enumerate(ref_videos):
                ref_parts.append(f"<VIDEO_REF_{idx}>@Video{vid_start_num + idx + 1}")
            
            if ref_parts:
                prompt_text = f"{sources_part} [# References {' '.join(ref_parts)}] {prompt_text}"
            else:
                prompt_text = f"{sources_part} {prompt_text}"
        elif first_frame and last_frame:
            if "<FIRST_FRAME>" not in prompt and "<LAST_FRAME>" not in prompt:
                prompt_text = f"<FIRST_FRAME> <LAST_FRAME> {prompt_text}"
        elif first_frame:
            if "<FIRST_FRAME>" not in prompt:
                prompt_text = f"<FIRST_FRAME> {prompt_text}"

    input_parts.append({
        "type": "text",
        "text": prompt_text
    })

    # Construct response_format video configuration
    video_config = {
        "type": "video",
        "delivery": "uri"
    }

    # Only omit aspect_ratio if task is explicitly 'extend'
    if task != "extend":
        video_config["aspect_ratio"] = aspect_ratio

    if duration:
        video_config["duration"] = duration

    if resolution:
        video_config["resolution"] = parse_and_validate_resolution(resolution)

    # Construct generation_config if task is explicitly specified and no previous_interaction_id is used
    generation_config = None
    if task and not previous_interaction_id:
        generation_config = {
            "video_config": {
                "task": task
            }
        }

    res_display = video_config.get("resolution", "default (720p)")
    print(f"\nSending generation request using official google-genai SDK and model '{model}'...")
    print(f"Prompt: '{prompt_text}' | Aspect Ratio: {video_config.get('aspect_ratio', 'inherited')} | Resolution: {res_display} | Duration: {duration or 'default'}")
    if res_display == "4k":
        print("Note: 4K video generation selected. Processing high-resolution video may take longer to complete.")
    if task:
        print(f"Task Mode: {task}")
    
    # Initialize the client with explicit per-request timeout bounds in milliseconds
    timeout_s = int(timeout) if timeout else 600
    if timeout_s <= 0:
        raise ValueError(f"Timeout must be greater than 0 (got {timeout}).")
    client = genai.Client(http_options=types.HttpOptions(timeout=timeout_s * 1000))
    create_kwargs = {
        "model": model,
        "input": input_parts,
        "response_format": video_config,
    }
    if generation_config:
        create_kwargs["generation_config"] = generation_config
    if previous_interaction_id:
        create_kwargs["previous_interaction_id"] = previous_interaction_id

    try:
        interaction = client.interactions.create(**create_kwargs)
    except errors.APIError as e:
        raise RuntimeError(f"API Error generating video via SDK: {sanitize_error(e)}")
    except Exception as e:
        raise RuntimeError(f"Error generating video via SDK: {sanitize_error(e)}")

    print(f"Generation complete for '{prompt}'! Processing response...")
    
    interaction_id = interaction.id
    if interaction_id:
        print(f"Interaction ID: {interaction_id}")
    
    output_video = interaction.output_video
    if not output_video or not output_video.uri:
        err_msg = f"No video content found in response for '{prompt}'."
        if video_path or extend_video or ref_videos:
            err_msg += (
                "\nWARNING: IMPORTANT REGIONAL RESTRICTION: Uploading videos to use for video edits, extensions, or references is "
                "not available in the EEA, Switzerland, United Kingdom, and some US states."
            )
        raise RuntimeError(err_msg)

    video_uri = output_video.uri
    print(f"Generated video URI for '{prompt}': {strip_query_params(video_uri)}")
    
    # Download the final video using the official google-genai SDK
    download_video_file(output_video or video_uri, output_path, client=client)

def run_job(job):
    """Runs a single generation job inside a thread pool, catching exceptions."""
    prompt = job.get("prompt")
    if not prompt:
        print("Warning: Skipping job with empty prompt.", file=sys.stderr)
        return {"job": job, "status": "SKIPPED", "error": "Empty prompt"}

    first_frame = job.get("first_frame")
    last_frame = job.get("last_frame")
    if last_frame and not first_frame:
        err = "last_frame must be used with first_frame (the model requires a starting frame when specifying a final frame)."
        print(f"[Parallel] Failed: '{prompt}' - Error: {err}", file=sys.stderr)
        return {"job": job, "status": "FAILED", "error": err}

    aspect_ratio = job.get("aspect_ratio", "16:9")
    duration = job.get("duration")
    resolution = job.get("resolution")
    image_path = job.get("image") or job.get("image_reference") or job.get("ref_image")
    video_path = job.get("video")
    extend_video = job.get("extend") or job.get("extend_video")
    video_reference = job.get("video_reference") or job.get("ref_video") or job.get("video_ref")
    task = job.get("task")
    output_path = job.get("output")
    model = job.get("model", DEFAULT_MODEL)
    strip_audio = job.get("strip_audio", False)
    previous_interaction_id = job.get("previous_interaction_id")
    timeout = job.get("timeout", 600)

    if not output_path:
        output_path = f"media/output_{slugify(prompt)}.mp4"

    print(f"[Parallel] Dispatching: '{prompt}' (Output: {output_path})")
    
    try:
        generate_video(
            prompt=prompt,
            model=model,
            aspect_ratio=aspect_ratio,
            duration=duration,
            resolution=resolution,
            first_frame=first_frame,
            last_frame=last_frame,
            image_path=image_path,
            video_path=video_path,
            extend_video=extend_video,
            video_reference=video_reference,
            task=task,
            output_path=output_path,
            strip_audio=strip_audio,
            previous_interaction_id=previous_interaction_id,
            timeout=timeout
        )
        return {"job": job, "status": "SUCCESS", "output_path": output_path}
    except Exception as e:
        cleaned_err = sanitize_error(e)
        print(f"[Parallel] Failed: '{prompt}' - Error: {cleaned_err}", file=sys.stderr)
        return {"job": job, "status": "FAILED", "error": cleaned_err}

class SanitizedArgumentParser(argparse.ArgumentParser):
    """Custom ArgumentParser that ensures any error output is sanitized to prevent secret leaks."""
    def error(self, message):
        sanitized_msg = sanitize_error(message)
        self.print_usage(sys.stderr)
        self.exit(2, f"{self.prog}: error: {sanitized_msg}\n")

def main():
    parser = SanitizedArgumentParser(description="Generate, extend, and edit videos using Gemini Omni 1.1 Flash model via google-genai SDK (supports parallel batch execution).")
    parser.add_argument("prompt", nargs="?", help="Text prompt / instruction for a single video generation")
    parser.add_argument("--first-frame", "-f", help="Local image path or File API URI for starting frame (<FIRST_FRAME>)")
    parser.add_argument("--last-frame", "-l", help="Local image path or File API URI for final transition frame (<LAST_FRAME>). Must be used with --first-frame.")
    parser.add_argument("--image", "--image-reference", "--ref-image", "-i", action="append", dest="image", help="Optional local image path or File API URI for referencing / image-to-video (can be specified multiple times)")
    parser.add_argument("--video", "-v", action="append", help="Optional local video path or File API URI for editing / source video (can be specified multiple times)")
    parser.add_argument("--extend", "-e", help="Optional local video path or File API URI to extend (by up to 10s per turn, up to 40s total)")
    parser.add_argument("--video-reference", "--ref-video", "-vr", action="append", dest="video_reference", help="Optional local video path or File API URI for reference video(s) (<VIDEO_REF_0>, <VIDEO_REF_1>, ...). Ideal duration is ~3s (up to 3 recommended). Can be specified multiple times.")
    parser.add_argument("--task", choices=["text_to_video", "image_to_video", "reference_to_video", "edit", "extend"], default=None, help="Explicit video task mode. Note: omitting task allows combining extensions with reference images and videos.")
    parser.add_argument("--aspect-ratio", default="16:9", choices=["16:9", "9:16"], help="Aspect ratio (default: 16:9, omitted automatically if explicit task='extend' is set)")
    parser.add_argument("--duration", type=argparse_duration_type, default=None, help="Video duration as an integer between 3 and 10 seconds (e.g., 5, 10). Default: None (API/Model decides, typically 10s or matches source)")
    parser.add_argument("--resolution", "-res", type=argparse_resolution_type, default=None, help="Video output resolution: 360p, 720p, 1080p, or 4k (default: 720p). Note: 4k requests take longer to generate.")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Gemini Omni Flash video model ID (default: {DEFAULT_MODEL})")
    parser.add_argument("--output", "-o", help="Local output file path for single generation (default: media/output.mp4)")
    parser.add_argument("--strip-audio", "-a", action="store_true", help="Completely strip/disable audio stream from the input video(s) before uploading so Gemini Omni Flash can regenerate new audio from scratch")
    parser.add_argument("--previous-interaction-id", help="Optional Interaction ID of a previous generation for turn-by-turn editing or extending")
    parser.add_argument("--timeout", type=int, default=600, help="Per-request HTTP timeout in seconds (default: 600). Recommend 900+ for multi-turn 4K extensions up to 40s.")
    
    # Parallel batch configuration options
    parser.add_argument("--batch", help="Path to a JSON file containing an array of generation jobs")
    parser.add_argument("--prompts-file", help="Path to a text file containing one prompt per line to run in parallel")
    parser.add_argument("--concurrency", type=int, default=3, help="Maximum number of concurrent executions (default: 3)")

    args = parser.parse_args()

    if args.last_frame and not args.first_frame:
        parser.error("--last-frame must be used with --first-frame (the model requires a starting frame when specifying a final frame).")

    if not get_api_key():
        print("Error: GEMINI_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    # 1. Handle Batch JSON execution
    if args.batch:
        if not os.path.exists(args.batch):
            print(f"Error: Batch JSON file '{args.batch}' not found.", file=sys.stderr)
            sys.exit(1)
        try:
            with open(args.batch, "r", encoding="utf-8") as f:
                jobs = json.load(f)
            if not isinstance(jobs, list):
                print("Error: Batch JSON file must contain a list/array of job objects.", file=sys.stderr)
                sys.exit(1)
        except Exception as e:
            print(f"Error parsing Batch JSON: {sanitize_error(e)}", file=sys.stderr)
            sys.exit(1)

        print(f"Loaded {len(jobs)} jobs from batch JSON. Running with concurrency={args.concurrency}...")

    # 2. Handle Prompts File execution
    elif args.prompts_file:
        if not os.path.exists(args.prompts_file):
            print(f"Error: Prompts file '{args.prompts_file}' not found.", file=sys.stderr)
            sys.exit(1)
        
        jobs = []
        with open(args.prompts_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    jobs.append({
                        "prompt": line,
                        "aspect_ratio": args.aspect_ratio,
                        "duration": args.duration,
                        "resolution": args.resolution,
                        "first_frame": args.first_frame,
                        "last_frame": args.last_frame,
                        "image": args.image,
                        "video": args.video,
                        "extend": args.extend,
                        "video_reference": args.video_reference,
                        "task": args.task,
                        "model": args.model,
                        "strip_audio": args.strip_audio,
                        "previous_interaction_id": args.previous_interaction_id,
                        "timeout": args.timeout
                    })
        print(f"Loaded {len(jobs)} prompts from text file. Running with concurrency={args.concurrency}...")

    # 3. Handle standard single prompt execution
    else:
        if not args.prompt:
            parser.print_help()
            sys.exit(1)
            
        output_path = args.output if args.output else "media/output.mp4"
        try:
            generate_video(
                prompt=args.prompt,
                model=args.model,
                aspect_ratio=args.aspect_ratio,
                duration=args.duration,
                resolution=args.resolution,
                first_frame=args.first_frame,
                last_frame=args.last_frame,
                image_path=args.image,
                video_path=args.video,
                extend_video=args.extend,
                video_reference=args.video_reference,
                task=args.task,
                output_path=output_path,
                strip_audio=args.strip_audio,
                previous_interaction_id=args.previous_interaction_id,
                timeout=args.timeout
            )
            sys.exit(0)
        except Exception as e:
            print(f"Error: Generation failed: {sanitize_error(e)}", file=sys.stderr)
            sys.exit(1)

    # Parallel Execution Loop
    if not jobs:
        print("Warning: No valid jobs found to execute.")
        sys.exit(0)

    results = []
    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = {executor.submit(run_job, job): job for job in jobs}
        for future in as_completed(futures):
            results.append(future.result())

    # Print Batch Results Summary
    print("\n" + "="*50)
    print("BATCH PARALLEL EXECUTION SUMMARY")
    print("="*50)
    success_count = sum(1 for r in results if r["status"] == "SUCCESS")
    failed_count = sum(1 for r in results if r["status"] == "FAILED")
    skipped_count = sum(1 for r in results if r["status"] == "SKIPPED")
    
    print(f"Total: {len(results)} | Success: {success_count} | Failed: {failed_count} | Skipped: {skipped_count}\n")
    for r in results:
        status_str = r["status"]
        prompt = r["job"].get("prompt")
        if r["status"] == "SUCCESS":
            print(f"  [{status_str}] '{prompt}' -> {r['output_path']}")
        else:
            print(f"  [{status_str}] '{prompt}' -> Error: {r.get('error')}")
    print("="*50)

    if failed_count > 0:
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    main()

