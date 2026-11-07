import os
import re
import difflib

skip_dirs = [".git", "node_modules", ".gemini", "__pycache__", "dist", "build"]
extensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".md", ".html", ".bat", ".sql", ".css"]

def replace_name(content):
    content = re.sub(r"\bECLIPSE\s+AI\b", "ECLIPSE", content)
    content = re.sub(r"\bEclipse\s+AI\b", "Eclipse", content)
    content = re.sub(r"\beclipse\s+ai\b", "eclipse", content)
    content = re.sub(r"\bECLIPSE-AI\b", "ECLIPSE", content)
    content = re.sub(r"\beclipse-ai\b", "eclipse", content)
    return content

for dirpath, dirnames, filenames in os.walk("."):
    if any(skip in dirpath for skip in skip_dirs):
        continue
    for f in filenames:
        if f in ["search_eclipse_ai.py", "inspect_all_matches.py", "preview_rename.py", "diff_rename.py", "perform_rename.py"]:
            continue
        ext = os.path.splitext(f)[1].lower()
        if ext in extensions:
            filepath = os.path.join(dirpath, f)
            try:
                with open(filepath, "r", encoding="utf-8") as file:
                    original = file.read()
                modified = replace_name(original)
                if original != modified:
                    diff = list(difflib.unified_diff(
                        original.splitlines(),
                        modified.splitlines(),
                        fromfile=filepath + " (before)",
                        tofile=filepath + " (after)",
                        lineterm="",
                        n=1
                    ))
                    print("\n".join(diff))
            except Exception as e:
                print(f"Error {filepath}: {e}")
