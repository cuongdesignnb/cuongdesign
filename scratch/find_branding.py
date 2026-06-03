import os

search_terms = ["cuong dev", "cường dev", "cuongdev"]
project_root = r"d:\Cuongdesign\src"

matches = []

for root, dirs, files in os.walk(project_root):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.css', '.html')):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                for idx, line in enumerate(lines):
                    line_lower = line.lower()
                    if any(term in line_lower for term in search_terms):
                        matches.append({
                            'file': file_path.replace(project_root, 'src'),
                            'line': idx + 1,
                            'content': line.strip()
                        })
            except Exception as e:
                pass

with open(r"d:\Cuongdesign\scratch\results.txt", "w", encoding="utf-8") as out:
    out.write(f"Found {len(matches)} matches:\n")
    for match in matches:
        out.write(f"{match['file']}:{match['line']}: {match['content']}\n")

print("Done, results written to scratch/results.txt")
