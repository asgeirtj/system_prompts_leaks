#!/usr/bin/env python3
"""
Uploads a file to the Gemini Files API and waits for it to become ACTIVE.
Uses the official google-genai SDK.
"""

import argparse
import json
import mimetypes
import os
import re
import sys
import time
import urllib.parse
from google import genai
from google.genai import types, errors

def get_api_key():
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

def detect_mime_type(file_path):
    """Determines MIME type based on file extension, falling back to standard mimetypes module."""
    ext = os.path.splitext(file_path)[1].lower()
    mime_map = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".pdf": "application/pdf",
        ".txt": "text/plain",
    }

    if ext in mime_map:
        return mime_map[ext]

    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type:
        return mime_type

    return "application/octet-stream"

def upload_file(file_path, display_name=None):
    """Performs an upload using google-genai SDK, with automatic pre-processing for large videos."""
    if not get_api_key():
        raise RuntimeError("Error: GEMINI_API_KEY environment variable is not set.")

    file_size = os.path.getsize(file_path)
    mime_type = detect_mime_type(file_path)

    # Large video file size check (>25MB)
    is_video = mime_type.startswith("video/")
    if is_video and file_size > 25 * 1024 * 1024:
        size_mb = file_size / (1024 * 1024)
        print(f"\nWARNING: Video file '{file_path}' is very large ({size_mb:.2f} MB)!")
        print("Note: Gemini Omni Flash is optimized for 10s videos at 720p and 24fps. Uploading very large or")
        print("high-resolution videos will significantly increase upload times and may cause Out-Of-Memory (OOM) errors.")

        # Determine if terminal is interactive
        if sys.stdin.isatty():
            print("\nWould you like to automatically pre-process this video first using prep_video.py?")
            print("This will trim, scale, and optimize the video to ensure a fast, OOM-safe upload.")
            try:
                choice = input("Pre-process video? [Y/n]: ").strip().lower()
                if choice in ("", "y", "yes"):
                    prepped_output_path = os.path.join("media", f"prepped_{os.path.basename(file_path)}")
                    os.makedirs("media", exist_ok=True)

                    # Resolve prep_video.py script path
                    import subprocess
                    prep_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "video", "prep_video.py")
                    if not os.path.exists(prep_script):
                        prep_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prep_video.py")

                    cmd = [sys.executable, prep_script, file_path, "--output", prepped_output_path]
                    print(f"Running: {' '.join(cmd)}")

                    try:
                        result = subprocess.run(cmd)
                        if result.returncode == 0 and os.path.exists(prepped_output_path):
                            file_path = prepped_output_path
                            file_size = os.path.getsize(file_path)
                            print(f"\nPre-processing completed successfully! Proceeding with upload of prepped video ({file_size / (1024*1024):.2f} MB)...")
                        else:
                            raise RuntimeError("Error: Video pre-processing failed. Proceeding with original file upload is not recommended.")
                    except Exception as e:
                        raise RuntimeError(f"Error executing prep_video.py: {sanitize_error(e)}")
                else:
                    proceed_choice = input("Do you want to proceed with uploading the original large video anyway? [y/N]: ").strip().lower()
                    if proceed_choice not in ("y", "yes"):
                        raise RuntimeError("Upload cancelled by user. Please pre-process the video manually first.")
            except (KeyboardInterrupt, EOFError):
                raise RuntimeError("\nNo input received. Upload cancelled to prevent OOM.")
        else:
            # Non-interactive mode
            if file_size > 100 * 1024 * 1024: # Block files larger than 100MB in non-interactive mode
                err_msg = (
                    f"Error: Video file is extremely large ({size_mb:.2f} MB) and script is running in non-interactive mode.\n"
                    "To prevent Out-Of-Memory (OOM) errors, upload has been blocked.\n"
                    "Please pre-process the video first using prep_video.py."
                )
                raise RuntimeError(err_msg)
            else:
                print("Proceeding with upload in non-interactive mode...", file=sys.stderr)

    if not display_name:
        display_name = os.path.basename(file_path)

    print(f"Preparing upload of '{file_path}' ({file_size} bytes, type: {mime_type})...")

    # Step 1: Initialize Client with explicit request timeout bounds (300s = 300,000ms)
    client = genai.Client(http_options=types.HttpOptions(timeout=300 * 1000))

    # Step 2: Upload file using SDK
    print("Uploading file bytes using google-genai SDK...")
    try:
        config = types.UploadFileConfig(
            display_name=display_name,
            mime_type=mime_type,
        )
        file_obj = client.files.upload(file=file_path, config=config)
        # Convert Pydantic File model to dictionary with both camelCase and snake_case keys for compatibility
        file_dict = json.loads(file_obj.model_dump_json())
        # Ensure URI is stripped of any sensitive query parameters
        if "uri" in file_dict and file_dict["uri"]:
            file_dict["uri"] = strip_query_params(file_dict["uri"])
        # Add camelCase field for mimeType
        if "mime_type" in file_dict:
            file_dict["mimeType"] = file_dict["mime_type"]
        return file_dict
    except errors.APIError as e:
        raise RuntimeError(f"API Error uploading file via SDK: {sanitize_error(e)}")
    except Exception as e:
        raise RuntimeError(f"Error uploading file via SDK: {sanitize_error(e)}")

def wait_for_active(file_name, poll_interval=3, max_attempts=60, backoff_factor=1.2, max_interval=15, max_timeout=600):
    """Polls the file status until state is ACTIVE or FAILED using exponential backoff with finite request bounds."""
    if not get_api_key():
        raise RuntimeError("Error: GEMINI_API_KEY environment variable is not set.")

    print(f"Waiting for file {file_name} to finish processing...")

    client = genai.Client(http_options=types.HttpOptions(timeout=30 * 1000))
    attempt = 0
    current_interval = poll_interval
    consecutive_errors = 0
    max_consecutive_errors = 5
    start_time = time.time()

    while attempt < max_attempts:
        if time.time() - start_time > max_timeout:
            raise TimeoutError(f"Error: Maximum timeout ({max_timeout}s) reached waiting for file {file_name} to become ACTIVE.")

        try:
            file_obj = client.files.get(name=file_name)
        except errors.APIError as e:
            consecutive_errors += 1
            if consecutive_errors >= max_consecutive_errors:
                raise RuntimeError(f"Error: Too many consecutive API errors checking status ({sanitize_error(e)}). Exiting.")

            print(f"Warning: API error checking status ({sanitize_error(e)}). Retrying in {current_interval:.1f}s...")
            time.sleep(current_interval)
            current_interval = min(current_interval * backoff_factor, max_interval)
            attempt += 1
            continue
        except Exception as e:
            consecutive_errors += 1
            if consecutive_errors >= max_consecutive_errors:
                raise RuntimeError(f"Error: Too many consecutive errors checking status ({sanitize_error(e)}). Exiting.")

            print(f"Warning: Error checking status ({sanitize_error(e)}). Retrying in {current_interval:.1f}s...")
            time.sleep(current_interval)
            current_interval = min(current_interval * backoff_factor, max_interval)
            attempt += 1
            continue

        # Reset consecutive errors on successful API response
        consecutive_errors = 0
        state = file_obj.state
        state_str = state.name if hasattr(state, "name") else str(state)

        if state == types.FileState.ACTIVE or state_str == "ACTIVE":
            print("File is ACTIVE and ready for generations!")
            file_dict = json.loads(file_obj.model_dump_json())
            if "uri" in file_dict and file_dict["uri"]:
                file_dict["uri"] = strip_query_params(file_dict["uri"])
            if "mime_type" in file_dict:
                file_dict["mimeType"] = file_dict["mime_type"]
            return file_dict
        elif state == types.FileState.FAILED or state_str == "FAILED":
            # Terminal FAILED state: abort immediately without retrying
            err_details = getattr(file_obj, "error", None)
            err_msg = f"Error: File processing failed on backend for '{file_name}' (State: FAILED)"
            if err_details:
                err_msg += f": {sanitize_error(err_details)}"
            raise RuntimeError(err_msg)

        print(f"Current state: {state_str}. Retrying in {current_interval:.1f}s...")
        time.sleep(current_interval)

        # Increase interval for the next poll (backoff)
        current_interval = min(current_interval * backoff_factor, max_interval)
        attempt += 1

    raise RuntimeError(f"Error: Maximum polling attempts ({max_attempts}) reached. File is still not ACTIVE.")

class SanitizedArgumentParser(argparse.ArgumentParser):
    """Custom ArgumentParser that ensures any error output is sanitized to prevent secret leaks."""
    def error(self, message):
        sanitized_msg = sanitize_error(message)
        self.print_usage(sys.stderr)
        self.exit(2, f"{self.prog}: error: {sanitized_msg}\n")

def main():
    parser = SanitizedArgumentParser(description="Upload files to Gemini Files API using google-genai SDK.")
    parser.add_argument("file", help="Path to the file to upload")
    parser.add_argument("--name", help="Custom display name for the file")
    parser.add_argument("--no-wait", action="store_true", help="Don't wait for ACTIVE status")

    args = parser.parse_args()

    api_key = get_api_key()
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(args.file):
        print(f"Error: File '{args.file}' not found.", file=sys.stderr)
        sys.exit(1)

    try:
        file_meta = upload_file(args.file, args.name)
        file_name = file_meta.get("name")

        print(f"File metadata created:")
        print(f"  Name: {file_name}")
        print(f"  URI:  {strip_query_params(file_meta.get('uri'))}")
        print(f"  Type: {file_meta.get('mimeType')}")

        if not args.no_wait:
            file_meta = wait_for_active(file_name)

        print("\nFile upload successfully completed! JSON Output:")
        print(json.dumps(file_meta, indent=2))
        sys.exit(0)
    except Exception as e:
        print(f"Error: {sanitize_error(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
