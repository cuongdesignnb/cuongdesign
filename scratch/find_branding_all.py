import os

search_terms = ["cuong dev", "cường dev", "cuongdev"]
project_root = r"d:\Cuongdesign"

exclude_dirs = {'.next', 'node_modules', '.git', '.gemini', 'scratch'}
exclude_files = {'package-lock.json', 'find_branding_all.py', 'find_branding.py', 'results.txt', 'results_all.txt'}
exclude_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz', '.woff', '.woff2', '.ttf', '.eot')

matches = []

for root, dirs, files in os.walk(project_root):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file in exclude_files or file.endswith(exclude_extensions):
            continue
        file_path = os.path.join(root, file)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            lines = content.splitlines()
            for idx, line in enumerate(lines):
                line_lower = line.lower()
                if any(term in line_lower for term in search_terms):
                    matches.append({
                        'file': os.path.relpath(file_path, project_root),
                        'line': idx + 1,
                        'content': line.strip()
                    })
        except Exception as e:
            pass

output_path = r"d:\Cuongdesign\scratch\results_all.txt"
with open(output_path, "w", encoding="utf-8") as out:
    out.write(f"Found {len(matches)} matches:\n")
    for match in matches:
        out.write(f"{match['file']}:{match['line']}: {match['content']}\n")

print(f"Done, found {len(matches)} matches, results written to scratch/results_all.txt")
