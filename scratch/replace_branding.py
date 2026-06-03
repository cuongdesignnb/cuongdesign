import os

replacements = [
    ("Cường Dev", "Cường Design"),
    ("cường dev", "cường design"),
    ("Cuong Dev", "Cuong Design"),
    ("cuong dev", "cuong design"),
    ("CUONG DEV", "CUONG DESIGN"),
    ("cuong-dev", "cuong-design"),
    ("CUONG-DEV", "CUONG-DESIGN"),
    ("cuongdev", "cuongdesign"),
    ("CUONGDEV", "CUONGDESIGN"),
]

project_root = r"d:\Cuongdesign"

exclude_dirs = {'.next', 'node_modules', '.git', '.gemini', 'scratch'}
exclude_files = {'package-lock.json'}
exclude_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz', '.woff', '.woff2', '.ttf', '.eot')

modified_files = []

for root, dirs, files in os.walk(project_root):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file in exclude_files or file.endswith(exclude_extensions):
            continue
        file_path = os.path.join(root, file)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            replaced = False
            for old, new in replacements:
                if old in new_content:
                    new_content = new_content.replace(old, new)
                    replaced = True
            
            if replaced:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files.append(os.path.relpath(file_path, project_root))
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

print(f"Done! Modified {len(modified_files)} files:")
for f in sorted(modified_files):
    print(f" - {f}")
