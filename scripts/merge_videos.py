#!/usr/bin/env python3
"""
HEXARCH Video Merger & Normalizer
Automates editing, trimming, audio/video normalization, and merging of all 6 team demo clips into a single <5:00 presentation.
Standardizes canvas to 1920x1080 @ 30fps (pillarbox/letterbox preserved), stereo 48kHz audio with EBU R128 loudnorm.

Usage:
  python3 scripts/merge_videos.py
"""
import os
import sys
import subprocess
import argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
VIDEOS_DIR = os.path.join(PROJECT_DIR, "videos")
DOCS_DIR = os.path.join(PROJECT_DIR, "docs")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Master Scene definitions per docs/VIDEO_SCRIPT.md and docs/VIDEO.md
SCENE_SPECS = [
    {
        "scene": 1,
        "speaker": "Mitul Bhatia",
        "title": "Scene 1: Introduction & Team Overview",
        "filenames": ["mitul_scene1.mp4", "mitul_intro.mp4", "scene1.mp4"],
        "trim_start": 0.0,
        "trim_end": 49.1,
    },
    {
        "scene": 2,
        "speaker": "Akshat Chauhan",
        "title": "Scene 2: Instruction Path & Program Counter",
        "filenames": ["akshat.mp4", "scene2.mp4"],
        "trim_start": 0.0,
        "trim_end": 33.1,
    },
    {
        "scene": 3,
        "speaker": "Ajeesh Amreet",
        "title": "Scene 3: Data Path & Demo Program",
        "filenames": ["ajeesh.mp4", "scene3.mp4"],
        "trim_start": 0.6,
        "trim_end": 44.3,
    },
    {
        "scene": 4,
        "speaker": "Vaibhav",
        "title": "Scene 4: Shared Memory & Controller Stall",
        "filenames": ["vaibhav.mp4", "scene4.mp4"],
        "trim_start": 1.0,
        "trim_end": 39.8, # Cut before Loom screen appears at 40.0s
    },
    {
        "scene": 5, # Scenes 5 & 6 by Hardik
        "speaker": "Hardik Maheshwari",
        "title": "Scenes 5 & 6: Simulation, Waveforms & Testbench",
        "filenames": ["hardik.mp4", "scene5.mp4", "scenes_5_6.mp4"],
        "trim_start": 0.8,
        "trim_end": 64.2,
    },
    {
        "scene": 7,
        "speaker": "Mitul Bhatia",
        "title": "Scene 7: Results Analysis, Report & Repository",
        "filenames": ["mitul_end.mp4", "mitul_scene7.mp4", "scene7.mp4"],
        "trim_start": 0.0,
        "trim_end": 65.5,
    },
]

def find_clip_file(candidates):
    for fname in candidates:
        full_path = os.path.join(VIDEOS_DIR, fname)
        if os.path.exists(full_path):
            return full_path
    return None

def merge_videos(output_name="HEXARCH_demo_final.mp4"):
    resolved_scenes = []
    for spec in SCENE_SPECS:
        fpath = find_clip_file(spec["filenames"])
        if fpath:
            dur = (spec["trim_end"] or 0) - (spec["trim_start"] or 0)
            resolved_scenes.append({
                "type": "video",
                "spec": spec,
                "path": fpath,
                "dur": dur,
            })
        else:
            print(f"[!] ERROR: Required clip for {spec['title']} ({spec['filenames'][0]}) not found in {VIDEOS_DIR}")
            sys.exit(1)

    print(f"\n[+] Preparing to merge {len(resolved_scenes)} scenes into '{output_name}':")
    curr_time = 0.0
    for s in resolved_scenes:
        spec = s["spec"]
        start_ts = f"{int(curr_time // 60)}:{int(curr_time % 60):02d}"
        end_ts = f"{int((curr_time + s['dur']) // 60)}:{int((curr_time + s['dur']) % 60):02d}"
        print(f"    • {spec['title']} [{spec['speaker']}]: {os.path.basename(s['path'])} -> {start_ts} to {end_ts} ({s['dur']:.1f}s)")
        curr_time += s["dur"]

    total_min = int(curr_time // 60)
    total_sec = curr_time % 60
    print(f"\n[+] Estimated total duration: {total_min}:{total_sec:04.1f} ({curr_time:.1f}s) [Limit: 5:00 / 300.0s]")
    if curr_time > 300.0:
        print("[!] Warning: Total duration exceeds 5:00 limit! Please adjust trims.")
        sys.exit(1)

    input_args = []
    filter_complex = []
    concat_inputs = []

    for i, s in enumerate(resolved_scenes):
        spec = s["spec"]
        input_args.extend(["-i", s["path"]])
        t_start = spec["trim_start"]
        t_end = spec["trim_end"]

        trim_v = f"trim=start={t_start}:end={t_end},setpts=PTS-STARTPTS," if t_end is not None else (f"trim=start={t_start},setpts=PTS-STARTPTS," if t_start else "setpts=PTS-STARTPTS,")
        trim_a = f"atrim=start={t_start}:end={t_end},asetpts=PTS-STARTPTS," if t_end is not None else (f"atrim=start={t_start},asetpts=PTS-STARTPTS," if t_start else "asetpts=PTS-STARTPTS,")

        v_filt = (
            f"[{i}:v]{trim_v}"
            f"scale=1920:1080:force_original_aspect_ratio=decrease,"
            f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,"
            f"setsar=1,fps=30,format=yuv420p[v{i}]"
        )
        a_filt = (
            f"[{i}:a]{trim_a}"
            f"aformat=sample_rates=48000:channel_layouts=stereo,"
            f"loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a{i}]"
        )
        filter_complex.extend([v_filt, a_filt])
        concat_inputs.extend([f"[v{i}]", f"[a{i}]"])

    total_segments = len(resolved_scenes)
    concat_str = f"{''.join(concat_inputs)}concat=n={total_segments}:v=1:a=1[outv][outa]"
    filter_complex.append(concat_str)

    output_path = os.path.join(OUTPUT_DIR, output_name)
    cmd = [
        "ffmpeg", "-y",
        *input_args,
        "-filter_complex", "; ".join(filter_complex),
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "48000",
        "-movflags", "+faststart",
        output_path
    ]

    print(f"\n[+] Rendering {output_name}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[✓] Render complete: {output_path}")
    else:
        print(f"[✗] ffmpeg error:\n{res.stderr[-1000:]}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Merge HEXARCH demo clips")
    parser.add_argument("--out", default="HEXARCH_demo_final.mp4", help="Output filename")
    args = parser.parse_args()
    merge_videos(output_name=args.out)

if __name__ == "__main__":
    main()
