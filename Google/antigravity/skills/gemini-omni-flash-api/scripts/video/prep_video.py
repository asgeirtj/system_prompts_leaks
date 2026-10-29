#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys
from inspect_video import inspect_video, format_size

def parse_timecode(time_str, total_duration=None):
    """Parses a time string (seconds, MM:SS, HH:MM:SS, or 'last') into float seconds."""
    if not time_str:
        return 0.0
    time_str = time_str.strip().lower()
    
    if time_str == "last":
        if total_duration is None:
            raise ValueError("Total duration is required to calculate 'last' starting point.")
        target_dur = 10.0
        if total_duration <= target_dur:
            return 0.0
        return total_duration - target_dur
        
    if ":" in time_str:
        parts = time_str.split(":")
        if len(parts) == 2:  # MM:SS
            m, s = map(float, parts)
            return m * 60.0 + s
        elif len(parts) == 3:  # HH:MM:SS
            h, m, s = map(float, parts)
            return h * 3600.0 + m * 60.0 + s
        else:
            raise ValueError(f"Invalid timecode format: '{time_str}'. Use HH:MM:SS or MM:SS.")
    
    try:
        return float(time_str)
    except ValueError:
        raise ValueError(f"Invalid timecode: '{time_str}'. Must be float seconds, HH:MM:SS, or 'last'.")

def prep_video(input_path, output_path, start_time_str=None, duration=10, fps=None, resolution=None, strip_audio=False):
    """Preps a video file by trimming, optionally re-encoding to target fps and resolution."""
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    # Check if ffmpeg is available
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except (subprocess.SubprocessError, FileNotFoundError):
        raise RuntimeError("ffmpeg is not installed or not found in system PATH.")

    # Inspect input video first
    print(f"Analyzing source video: {os.path.basename(input_path)}...")
    source_info = inspect_video(input_path)
    total_duration = source_info.get("duration_seconds", 0.0)

    # Resolve start time
    if start_time_str is None:
        if total_duration and total_duration > 10.0 and sys.stdin.isatty():
            print(f"\nThe input video is longer than 10s ({total_duration:.2f}s).")
            print("Please choose a 10s segment to trim:")
            print("  1) First 10 seconds [default]")
            print("  2) Last 10 seconds")
            print("  3) Custom starting timecode (e.g., MM:SS, HH:MM:SS, or seconds)")
            try:
                choice = input("Your choice [1/2/3, default 1]: ").strip()
                if choice == "2":
                    start_time_str = "last"
                elif choice == "3":
                    custom_start = input("Enter starting timecode (e.g., 00:03 or 15): ").strip()
                    start_time_str = custom_start if custom_start else "0"
                else:
                    start_time_str = "0"
            except (KeyboardInterrupt, EOFError):
                print("\nNo input received. Defaulting to first 10 seconds.")
                start_time_str = "0"
        else:
            start_time_str = "0"

    try:
        start_seconds = parse_timecode(start_time_str, total_duration)
    except Exception as e:
        raise ValueError(f"Timecode parsing failed: {e}")


    if start_seconds < 0 or (total_duration and start_seconds >= total_duration):
        raise ValueError(f"Start time {start_seconds}s is out of bounds for video of length {total_duration}s.")

    # Construct output path if not specified
    if not output_path:
        os.makedirs("media", exist_ok=True)
        base_name = os.path.basename(input_path)
        name, ext = os.path.splitext(base_name)
        output_path = os.path.join("media", f"prepped_{name}.mp4")

    # Check if the source video file is large (>25MB)
    size_bytes_str = source_info.get("size_bytes")
    is_large = False
    try:
        if size_bytes_str and int(size_bytes_str) > 25 * 1024 * 1024:
            is_large = True
    except (ValueError, TypeError):
        pass

    # Target resolution parsing
    scale_filter = None
    orig_width = None
    orig_height = None
    if "video" in source_info:
        try:
            orig_width = int(source_info["video"].get("width"))
            orig_height = int(source_info["video"].get("height"))
        except (ValueError, TypeError):
            pass

    if resolution:
        try:
            target_w, target_h = map(int, resolution.lower().split("x"))
            if orig_width and orig_height:
                # Scale to fit target_w and target_h while preserving aspect ratio
                scale_factor = min(target_w / orig_width, target_h / orig_height)
                width = int(orig_width * scale_factor)
                height = int(orig_height * scale_factor)
            else:
                width, height = target_w, target_h
            # Ensure divisible by 2 for standard decoders/encoders
            width = (width // 2) * 2
            height = (height // 2) * 2
            scale_filter = f"scale={width}:{height}"
            resolution = f"{width}x{height}"
        except ValueError:
            raise ValueError(f"Invalid resolution: '{resolution}'. Format must be WIDTHxHEIGHT (e.g. 1280x720).")
    elif is_large:
        if orig_width and orig_height:
            # Scale down large videos proportionally (max 1280x720 for landscape, 720x1280 for portrait)
            if orig_width >= orig_height:
                max_w, max_h = 1280, 720
            else:
                max_w, max_h = 720, 1280
            scale_factor = min(max_w / orig_width, max_h / orig_height)
            if scale_factor < 1.0:
                width = int(orig_width * scale_factor)
                height = int(orig_height * scale_factor)
            else:
                width, height = orig_width, orig_height
        else:
            width, height = 1280, 720
        
        # Ensure divisible by 2
        width = (width // 2) * 2
        height = (height // 2) * 2
        resolution = f"{width}x{height}"
        print(f"\nRecommendation: Source video is very large ({source_info.get('file_size')}).")
        print("   Automatically scaling to optimize upload times for Gemini Omni Flash.")
        scale_filter = f"scale={width}:{height}"

    fps_spec = f"{fps} fps" if fps else "Original frame rate"
    print(f"\nPreparing Video Processing:")
    print(f"  * Source Duration: {total_duration:.2f}s")
    print(f"  * Trim Range     : Start at {start_seconds:.2f}s | Length {duration:.2f}s")
    if resolution:
        print(f"  * Encoding Specs : {width}x{height} @ {fps_spec}")
    else:
        print(f"  * Encoding Specs : Original Resolution @ {fps_spec}")
    print(f"  * Target Path    : {output_path}")
    print("=" * 50)

    # ffmpeg command construction
    cmd = [
        "ffmpeg",
        "-y",               # Overwrite output
        "-ss", str(start_seconds), # Seek start
        "-i", input_path,   # Input file
        "-t", str(duration), # Duration to copy
    ]
    if scale_filter:
        cmd.extend(["-vf", scale_filter])
        
    cmd.extend([
        "-c:v", "libx264",  # Standard H264 video codec
        "-pix_fmt", "yuv420p", # Standard pixel format for web/Gemini compatibility
    ])

    if fps:
        cmd.extend(["-r", str(fps)]) # Output frame rate if requested

    if strip_audio or not source_info.get("has_audio", False):
        if not source_info.get("has_audio", False) and not strip_audio:
            print("No audio stream detected in source video. Disabling audio output.")
        else:
            print("Stripping audio stream from video as requested.")
        cmd.append("-an")   # Disable audio streams completely
    else:
        cmd.extend([
            "-c:a", "aac",      # Convert audio to standard AAC
            "-b:a", "128k",     # Standard audio bitrate
            "-ac", "2",         # Convert to stereo
        ])

    cmd.append(output_path)

    print("Running ffmpeg encoding...")
    process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if process.returncode != 0:
        print("Error: ffmpeg failed. Stderr output follows:", file=sys.stderr)
        print(process.stderr, file=sys.stderr)
        raise RuntimeError("ffmpeg execution failed.")

    print("Video preparation completed successfully!")
    print("=" * 50)

    # Call inspection tool on output to print clean specs
    output_info = inspect_video(output_path)
    return output_info

def main():
    parser = argparse.ArgumentParser(description="Prep videos for editing (trimming, re-encoding to target fps and resolution).")
    parser.add_argument("file", help="Path to the source video file to prep")
    parser.add_argument("--start", "-s", default=None, help="Start timecode (seconds, MM:SS, HH:MM:SS, or 'last' for last 10s). Default: 0 (or prompted if > 10s)")
    parser.add_argument("--duration", "-d", type=int, default=10, help="Duration of trimmed segment in seconds. Default: 10")
    parser.add_argument("--fps", "-r", type=int, default=None, help="Target frame rate. Default: None (keep original frame rate)")
    parser.add_argument("--resolution", "-g", default=None, help="Target resolution (e.g., 1280x720). Default: None (keep original resolution)")
    parser.add_argument("--output", "-o", help="Custom output path. Defaults to media/prepped_<original_name>.mp4")
    parser.add_argument("--strip-audio", "-a", action="store_true", help="Completely strip/disable audio stream so the model can generate new audio")

    args = parser.parse_args()

    try:
        info = prep_video(
            input_path=args.file,
            output_path=args.output,
            start_time_str=args.start,
            duration=args.duration,
            fps=args.fps,
            resolution=args.resolution,
            strip_audio=args.strip_audio
        )
        
        # Display final output report
        print(f"\nPrepped Video Specifications: {info['file_name']}")
        print("=" * 50)
        print(f"File Size   : {info['file_size']}")
        print(f"Duration    : {info['duration']}")
        print(f"Bitrate     : {info['bitrate']}")
        print(f"Resolution  : {info['video']['resolution']}")
        print(f"Frame Rate  : {info['video']['fps']}")
        print(f"Video Codec : {info['video']['codec']}")
        if info["has_audio"]:
            print(f"Audio Spec  : {info['audio']['codec']} | {info['audio']['channels']} ch | {info['audio']['sample_rate']}")
        print()

    except Exception as e:
        print(f"Error prepping video: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
