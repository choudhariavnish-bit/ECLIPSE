import os
import re

pattern = re.compile(r"(ECLIPSE\s+AI|Eclipse\s+AI|eclipse\s+ai|ECLIPSE-AI|eclipse-ai)", re.IGNORECASE)

matches = []

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
                        m = pattern.findall(line)
                        if m:
                            matches.append((filepath, i, line.rstrip()))
            except Exception as e:
                pass

print(f"Total occurrences: {len(matches)}")
for filepath, lno, line in matches:
    print(f"{filepath}:{lno}: {line}")
