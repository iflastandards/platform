#!/usr/bin/env python3
"""
Script to reformat existing MDX files:
1. Remove Spanish entries from frontmatter
2. Replace Element Reference section content with component
3. Copy from .bak directory to main directory
"""

import os
import re
from pathlib import Path
import shutil
import yaml

# Define paths
BACKUP_DIR = Path('/Users/jonphipps/Code/IFLA/standards-dev/standards/isbd/docs/elements/isbd.bak')
OUTPUT_DIR = Path('/Users/jonphipps/Code/IFLA/standards-dev/standards/isbd/docs/elements/isbd')

def remove_spanish_from_yaml(yaml_content):
  """Remove Spanish language entries from YAML frontmatter"""
  lines = yaml_content.split('\n')
  filtered_lines = []

  for line in lines:
    # Skip lines that end with @es or contain @es
    if '@es' in line:
      continue
    filtered_lines.append(line)

  return '\n'.join(filtered_lines)

def replace_element_reference_section(content):
  """Replace the Element Reference section content with the component"""
  # Pattern to match the Element Reference section
  # This looks for ## Element Reference and captures everything until the next ## or ####
  pattern = r'(## Element Reference\s*\n)((?:(?!##)[\s\S])*?)(\n(?:##|####))'

  # Replacement with the component
  replacement = r'\1\n<ElementReference frontMatter={frontMatter} />\n\3'

  # Perform the replacement
  updated_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

  return updated_content

def process_mdx_file(file_path):
  """Process a single MDX file"""
  print(f"Processing: {file_path}")

  try:
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
      content = f.read()

    # Split frontmatter and body
    if content.startswith('---'):
      # Find the closing ---
      end_index = content.find('---', 3)
      if end_index != -1:
        frontmatter = content[3:end_index]
        body = content[end_index + 3:]

        # Remove Spanish from frontmatter
        cleaned_frontmatter = remove_spanish_from_yaml(frontmatter)

        # Replace Element Reference section in body
        updated_body = replace_element_reference_section(body)

        # Reconstruct the file
        updated_content = f"---{cleaned_frontmatter}---{updated_body}"

        return updated_content
      else:
        print(f"Warning: Could not find closing frontmatter delimiter in {file_path}")
        return content
    else:
      print(f"Warning: No frontmatter found in {file_path}")
      return content

  except Exception as e:
    print(f"Error processing {file_path}: {e}")
    return None

def main():
  """Main function to process all MDX files"""
  if not BACKUP_DIR.exists():
    print(f"Error: Backup directory does not exist: {BACKUP_DIR}")
    return

  if not OUTPUT_DIR.exists():
    print(f"Creating output directory: {OUTPUT_DIR}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

  # Counter for processed files
  processed_count = 0
  error_count = 0

  # Walk through all subdirectories in the backup directory
  for root, dirs, files in os.walk(BACKUP_DIR):
    # Get relative path from backup root
    rel_path = Path(root).relative_to(BACKUP_DIR)

    # Create corresponding output directory
    output_subdir = OUTPUT_DIR / rel_path
    if not output_subdir.exists():
      output_subdir.mkdir(parents=True, exist_ok=True)

    # Process each MDX file
    for filename in files:
      if filename.endswith('.mdx'):
        input_file = Path(root) / filename
        output_file = output_subdir / filename

        # Process the file
        updated_content = process_mdx_file(input_file)

        if updated_content:
          # Write to output directory
          try:
            with open(output_file, 'w', encoding='utf-8') as f:
              f.write(updated_content)
            print(f"  ✓ Saved to: {output_file}")
            processed_count += 1
          except Exception as e:
            print(f"  ✗ Error saving {output_file}: {e}")
            error_count += 1
        else:
          error_count += 1

  print(f"\nProcessing complete!")
  print(f"Files processed successfully: {processed_count}")
  print(f"Files with errors: {error_count}")
  print(f"Total files: {processed_count + error_count}")

if __name__ == "__main__":
  main()
