import os
import re

pattern = re.compile(r"eclipse[\s\-_]+ai", re.IGNORECASE)
matches = {}

for dirpath, dirnames, filenames in os.walk("."):
    if any(skip in dirpath for skip in [".git", "node_modules", ".gemini", "__pycache__", "dist", "build"]):
        continue
    for f in filenames:
        ext = os.path.splitext(f)[1].lower()
        if ext in [".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".md", ".html", ".bat", ".sql", ".css"]:
            filepath = os.path.join(dirpath, f)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    for i, line in enumerate(file, 1):
                        if pattern.search(line):
                            matches.setdefault(filepath, []).append((i, line.strip()))
            except Exception as e:
                pass

print(f"Total files with matches: {len(matches)}")
for filepath, lines in sorted(matches.items()):
    print(f"\n{filepath} ({len(lines)} matches):")
    for lno, text in lines[:8]:
        print(f"  Line {lno}: {text[:100]}")
    if len(lines) > 8:
        print(f"  ... and {len(lines) - 8} more")
