import google.generativeai as genai
import csv
import json
import time
import sys
import os
from pathlib import Path
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Default output directory for SES documentation
DEFAULT_OUTPUT_DIR = '/Users/jonphipps/Code/IFLA/standards-dev/standards/isbd/docs/elements/isbd/SES'

class ISBDSESProcessor:
  def __init__(self, api_key, output_dir=None):
    genai.configure(api_key=api_key)
    self.model = genai.GenerativeModel('gemini-1.5-pro')
    self.output_dir = Path(output_dir) if output_dir else Path(DEFAULT_OUTPUT_DIR)

  def upload_pdf(self, pdf_path):
    """Upload PDF to Gemini"""
    print(f"Uploading {pdf_path} to Gemini...")

    # Upload the file
    pdf_file = genai.upload_file(pdf_path, mime_type='application/pdf')
    print(f"Uploaded file: {pdf_file.name}")

    # Wait for processing
    while pdf_file.state.name == "PROCESSING":
      print("Processing PDF...")
      time.sleep(10)
      pdf_file = genai.get_file(pdf_file.name)

    if pdf_file.state.name != "ACTIVE":
      raise ValueError(f"File processing failed: {pdf_file.state.name}")

    print("PDF ready for analysis!")
    return pdf_file

  def parse_csv(self, csv_path):
    """Parse CSV file containing ISBD SES elements (owl:Class)"""
    elements = []

    with open(csv_path, 'r', encoding='utf-8') as f:
      reader = csv.DictReader(f)
      for row in reader:
        # Only process rows that are owl:Class (SES)
        if row.get('rdf:type') != 'owl:Class':
          continue

        # Try to find the label from various possible columns
        label = (row.get('rdfs:label@en') or
                 row.get('dc:title@en') or
                 row.get('skos:prefLabel@en') or
                 row.get('reg:name@en') or
                 row.get('label', ''))

        element = {
          'uri': row.get('uri', row.get('URI', '')),
          'label': label
        }
        # Include all other fields from CSV
        element.update(row)

        if element['label']:
          elements.append(element)

    print(f"Found {len(elements)} SES elements with rdf:type = owl:Class")
    return elements

  def query_gemini_for_ses(self, pdf_file, element):
    """Query Gemini for SES description"""
    # Remove leading "has " from the label if present
    search_label = element['label']
    if search_label.lower().startswith('has '):
      search_label = search_label[4:]

    prompt = f"""
Looking at the ISBD documentation PDF, please analyze the Syntax Encoding Scheme (SES) "{search_label}" ({element['uri']}).

A Syntax Encoding Scheme (SES) in the context of Dublin Core and ISBD is a set of rules that specifies how a value must be structured or formatted. It determines the precise syntax or arrangement of metadata values, allowing for consistency and machine-readable interpretation.

Please provide a comprehensive analysis with the following sections:

## Definition
Provide the official ISBD definition of this SES and explain what type of values it encodes.

## Required Elements
List and describe all required elements or components that must be present in values using this SES. For example, if it's a date format, what date components are required?

## Punctuation Rules
Detail the specific punctuation marks, delimiters, or separators used in this SES. Include:
- What punctuation marks are used
- Where they must be placed
- Whether they are required or optional
- Any special spacing rules

## Relationship to ISBD Standards
Explain how this SES relates to and supports the broader ISBD standards. Which ISBD areas or elements typically use this SES?

## Relationship to Other SES
Identify any relationships to other Syntax Encoding Schemes within ISBD:
- Is this SES a subset or superset of another?
- Are there alternative SES that could be used for similar purposes?
- How does it interact with other encoding schemes?

## Examples
Provide at least 5 concrete examples showing proper use of this SES. Format as:
```
Example 1: [value]
Context: [explain what this represents]

Example 2: [value]
Context: [explain what this represents]
```

If this specific SES is not found in the PDF, please indicate that clearly at the beginning of your response.
"""

    response = self.model.generate_content([pdf_file, prompt])
    return response.text

  def parse_gemini_response(self, content):
    """Parse Gemini response into sections for the template"""
    sections = {
      'definition': '',
      'required_elements': '',
      'punctuation_rules': '',
      'isbd_relationship': '',
      'ses_relationships': '',
      'examples': ''
    }

    # Split content into lines for processing
    lines = content.split('\n')
    current_section = None
    section_content = []

    for line in lines:
      # Check for section headers
      if line.startswith('## Definition'):
        current_section = 'definition'
        section_content = []
      elif line.startswith('## Required Elements'):
        current_section = 'required_elements'
        section_content = []
      elif line.startswith('## Punctuation Rules'):
        current_section = 'punctuation_rules'
        section_content = []
      elif line.startswith('## Relationship to ISBD Standards'):
        current_section = 'isbd_relationship'
        section_content = []
      elif line.startswith('## Relationship to Other SES'):
        current_section = 'ses_relationships'
        section_content = []
      elif line.startswith('## Examples'):
        current_section = 'examples'
        section_content = []
      elif line.startswith('##'):
        # Other section, save current and reset
        if current_section and section_content:
          sections[current_section] = '\n'.join(section_content).strip()
        current_section = None
        section_content = []
      elif current_section:
        section_content.append(line)

    # Save last section
    if current_section and section_content:
      sections[current_section] = '\n'.join(section_content).strip()

    return sections

  def yaml_quote(self, value):
    """Properly quote YAML values"""
    if value is None or value == '':
      return "''"
    # Convert to string
    value_str = str(value)
    # If it contains special characters, quote it
    if any(char in value_str for char in [':', '{', '}', '[', ']', ',', '&', '*', '#', '?', '|', '-', '<', '>', '=', '!', '%', '@', '\\']):
      # Escape single quotes by doubling them
      escaped_value = value_str.replace("'", "''")
      return f"'{escaped_value}'"
    # Quote if it starts with special indicators
    if value_str.lower() in ['true', 'false', 'null', 'yes', 'no', 'on', 'off'] or value_str.isdigit():
      return f"'{value_str}'"
    return value_str

  def save_as_mdx(self, element, content):
    """Save SES documentation as MDX file"""
    # Extract ID from URI
    uri_parts = element['uri'].split('/')
    element_id = uri_parts[-1] if uri_parts[-1] else re.sub(r'[^a-z0-9]+', '-', element['label'].lower()).strip('-')

    filename = f"{element_id}.mdx"
    filepath = self.output_dir / filename

    # Ensure directory exists
    filepath.parent.mkdir(parents=True, exist_ok=True)

    # Parse the Gemini content
    sections = self.parse_gemini_response(content)

    # Prepare navigation metadata
    sidebar_label = element.get('rdfs:label@en') or element.get('label', element_id)

    # Build RDF section (excluding Spanish entries)
    rdf_data = {
      'definition': self.yaml_quote(element.get('skos:definition@en[0]') or element.get('skos:definition@en', '')),
      'type': self.yaml_quote(element.get('rdf:type', '')),
      'scopeNote': self.yaml_quote(element.get('skos:scopeNote@en[0]') or element.get('skos:scopeNote@en', ''))
    }

    # Create MDX content using the template
    mdx_content = f"""---
# Navigation
slug: /SES/{element_id}
sidebar_class_name: sidebar-level-1
sidebar_label: {self.yaml_quote(sidebar_label)}
sidebar_level: 1
sidebar_position: 1
sidebar_category: 'SES'

# Element identification
id: {self.yaml_quote(element_id)}
title: {self.yaml_quote(element.get('label', element_id))}

# RDF metadata
RDF:
  definition: {rdf_data['definition']}
  type: {rdf_data['type']}
  scopeNote: {rdf_data['scopeNote']}

# Deprecation tracking
deprecated: null
deprecatedInVersion: null
willBeRemovedInVersion: null
---

# {{frontMatter.title}}

## Element Reference
<ElementReference frontMatter={{frontMatter}} />

## Definition

<div className="guid">
{sections.get('definition', '[To be completed: Definition of this Syntax Encoding Scheme]')}
</div>

## Required Elements

<div className="guid">
{sections.get('required_elements', '[To be completed: List of required elements or components]')}
</div>

## Punctuation Rules

<div className="guid">
{sections.get('punctuation_rules', '[To be completed: Specific punctuation and formatting rules]')}
</div>

## Relationship to ISBD Standards

<div className="guid">
{sections.get('isbd_relationship', '[To be completed: How this SES supports ISBD standards]')}
</div>

## Relationship to Other SES

<div className="guid">
{sections.get('ses_relationships', '[To be completed: Relationships to other Syntax Encoding Schemes]')}
</div>

## Examples

<div className="stip">
{sections.get('examples', '[To be completed: Examples of proper SES usage]')}
</div>

<hr />

*This content was automatically generated from the ISBD PDF documentation using Gemini AI analysis.*
"""

    filepath.write_text(mdx_content, encoding='utf-8')
    print(f"Saved: {filepath}")

  def process_elements(self, data_path, pdf_path):
    """Process all SES elements from data file"""
    # Upload PDF
    pdf_file = self.upload_pdf(pdf_path)

    # Parse input data
    data_path = Path(data_path)

    print(f"Parsing CSV file for SES elements...")
    elements = self.parse_csv(data_path)

    if not elements:
      print("No SES elements (owl:Class) found in the CSV")
      return

    print(f"Found {len(elements)} SES elements to process")

    # Process each element
    for i, element in enumerate(elements):
      if not element.get('label'):
        print(f"Element {i+1}: No label found, skipping...")
        continue

      print(f"\nProcessing {i+1}/{len(elements)}: {element['label']}")

      try:
        # Query Gemini
        description = self.query_gemini_for_ses(pdf_file, element)

        # Save as MDX
        self.save_as_mdx(element, description)

        # Rate limiting
        if i < len(elements) - 1:
          print("Waiting before next query...")
          time.sleep(2)  # 2 second delay

      except Exception as e:
        print(f"Failed to process {element['label']}: {e}")
        # Continue with next element

    print("\nProcessing complete!")

def main():
  if len(sys.argv) < 3:
    print("Usage: python ses_processor.py <csv-file> <pdf-path>")
    print("API key will be read from GEMINI_API_KEY environment variable or .env file")
    print("Example: python ses_processor.py data/elements.csv data/isbd.pdf")
    sys.exit(1)

  # Try to get API key from environment or .env file
  api_key = os.getenv('GEMINI_API_KEY')
  if not api_key:
    print("Error: GEMINI_API_KEY not found in environment variables")
    print("Please either:")
    print("  1. Create a .env file with: GEMINI_API_KEY=your-key-here")
    print("  2. Export it: export GEMINI_API_KEY=your-key-here")
    sys.exit(1)

  csv_path = sys.argv[1]
  pdf_path = sys.argv[2]

  # Optional: override output directory
  output_dir = sys.argv[3] if len(sys.argv) > 3 else None

  processor = ISBDSESProcessor(api_key, output_dir)

  print(f"Output directory: {processor.output_dir}")

  try:
    processor.process_elements(csv_path, pdf_path)
  except Exception as e:
    print(f"Processing failed: {e}")
    sys.exit(1)

if __name__ == "__main__":
  main()
