import os
import re

# Files to inspect
skip_dirs = [".git", "node_modules", ".gemini", "__pycache__", "dist", "build"]
extensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".md", ".html", ".bat", ".sql", ".css"]

# Patterns to match: "ECLIPSE AI", "Eclipse AI", "eclipse ai"
# Make sure we do not mess up URLs like eclipse.ai or email addresses unless specified.
# \bECLIPSE\s+AI\b -> ECLIPSE
# \bEclipse\s+AI\b -> Eclipse
# \beclipse\s+ai\b -> eclipse

def replace_name(content):
    # Order matters: exact cases
    # 1. ECLIPSE AI
    content = re.sub(r"\bECLIPSE\s+AI\b", "ECLIPSE", content)
    # 2. Eclipse AI
    content = re.sub(r"\bEclipse\s+AI\b", "Eclipse", content)
    # 3. eclipse ai
    content = re.sub(r"\beclipse\s+ai\b", "eclipse", content)
    # 4. ECLIPSE-AI (if any)
    content = re.sub(r"\bECLIPSE-AI\b", "ECLIPSE", content)
    content = re.sub(r"\beclipse-ai\b", "eclipse", content)
    return content

changes = []

for dirpath, dirnames, filenames in os.walk("."):
    if any(skip in dirpath for skip in skip_dirs):
        continue
    for f in filenames:
        if f in ["search_eclipse_ai.py", "inspect_all_matches.py", "preview_rename.py", "perform_rename.py"]:
            continue
        ext = os.path.splitext(f)[1].lower()
        if ext in extensions:
            filepath = os.path.join(dirpath, f)
            try:
                with open(filepath, "r", encoding="utf-8") as file:
                    original = file.read()
                modified = replace_name(original)
                if original != modified:
                    # Count differences
                    orig_count = len(re.findall(r"eclipse\s+ai", original, re.IGNORECASE))
                    mod_count = len(re.findall(r"eclipse\s+ai", modified, re.IGNORECASE))
                    changes.append((filepath, orig_count, mod_count, original, modified))
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

print(f"Total files that will be modified: {len(changes)}")
total_replacements = sum(c[1] - c[2] for c in changes)
print(f"Total replacements: {total_replacements}")

for filepath, orig_cnt, mod_cnt, orig, mod in changes:
    print(f"  {filepath}: {orig_cnt} -> {mod_cnt} remaining")
