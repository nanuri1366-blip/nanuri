import os
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

log_dir = r"C:\Users\user\.gemini\antigravity-ide\brain\0d7865db-2429-4b8b-b587-cf9a0c4d43f5\.system_generated\logs"
transcript_path = os.path.join(log_dir, "transcript.jsonl")

if os.path.exists(transcript_path):
    with open(transcript_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    with open("transcript_info.txt", "w", encoding="utf-8") as out:
        for i, line in enumerate(lines):
            try:
                data = json.loads(line)
                # If this line is the browser_subagent call, let's print it and the next few lines
                if "browser_subagent" in line:
                    out.write(f"=== FOUND BROWSER_SUBAGENT AT LINE {i} ===\n")
                    for j in range(max(0, i-1), min(len(lines), i+3)):
                        out.write(f"Line {j}: {lines[j]}\n")
                    out.write("="*50 + "\n")
            except Exception as e:
                out.write(f"Error parsing line {i}: {e}\n")
    print("Done writing to transcript_info.txt")
else:
    print("Transcript not found")
