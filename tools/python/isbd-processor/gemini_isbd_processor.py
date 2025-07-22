from google import genai
from google.genai import types
import csv
import json
import time
import sys
import os
from pathlib import Path
import xml.etree.ElementTree as ET
from rdflib import Graph, Namespace, URIRef
import yaml
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Default output directory for IFLA standards-dev project
DEFAULT_OUTPUT_DIR = '/Users/jonphipps/Code/IFLA/standards-dev/standards/isbd/docs/elements/isbd'

class ISBDProcessor:
  def __init__(self, api_key, output_dir=None):
    # Initialize the new Google GenAI client
    self.client = genai.Client(api_key=api_key)
    self.output_dir = Path(output_dir) if output_dir else Path(DEFAULT_OUTPUT_DIR)
    self.namespaces = {
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'skos': 'http://www.w3.org/2004/02/skos/core#',
      'isbd': 'http://iflastandards.info/ns/isbd/elements/',
      'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
    }

  def upload_pdf(self, pdf_path):
    """Upload PDF to Gemini"""
    print(f"Uploading {pdf_path} to Gemini...")

    # Upload the file using the new API
    with open(pdf_path, 'rb') as f:
      pdf_file = self.client.files.upload(
        path=pdf_path,
        display_name='ISBD Documentation'
      )

    print(f"Uploaded file: {pdf_file.name}")

    # Wait for processing
    while pdf_file.state == "PROCESSING":
      print("Processing PDF...")
      time.sleep(10)
      pdf_file = self.client.files.get(name=pdf_file.name)

    if pdf_file.state != "ACTIVE":
      raise ValueError(f"File processing failed: {pdf_file.state}")

    print("PDF ready for analysis!")
    return pdf_file

  def parse_csv(self, csv_path):
    """Parse CSV file containing ISBD elements"""
    elements = []

    with open(csv_path, 'r', encoding='utf-8') as f:
      reader = csv.DictReader(f)
      for row in reader:
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

    return elements

  def parse_rdf_xml(self, xml_path):
    """Parse RDF/XML file"""
    elements = []
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # Register namespaces
    for prefix, uri in self.namespaces.items():
      ET.register_namespace(prefix, uri)

    # Find all Description elements
    for desc in root.findall('.//{http://www.w3.org/1999/02/22-rdf-syntax-ns#}Description'):
      element = {
        'uri': desc.get('{http://www.w3.org/1999/02/22-rdf-syntax-ns#}about', ''),
        'label': '',
        'prefLabel': '',
        'definition': '',
        'comment': ''
      }

      # Extract properties
      for child in desc:
        tag = child.tag
        if 'label' in tag:
          element['label'] = child.text or ''
        elif 'prefLabel' in tag:
          element['prefLabel'] = child.text or ''
        elif 'definition' in tag:
          element['definition'] = child.text or ''
        elif 'comment' in tag:
          element['comment'] = child.text or ''

      if element['label']:
        elements.append(element)

    return elements

  def parse_turtle(self, ttl_path):
    """Parse Turtle file"""
    elements = []
    g = Graph()
    g.parse(ttl_path, format='turtle')

    # Define namespace objects
    RDFS = Namespace(self.namespaces['rdfs'])
    SKOS = Namespace(self.namespaces['skos'])

    # Get all subjects
    subjects = set(g.subjects())

    for subject in subjects:
      if isinstance(subject, URIRef):
        element = {
          'uri': str(subject),
          'label': '',
          'prefLabel': '',
          'definition': '',
          'comment': ''
        }

        # Get properties
        for p, o in g.predicate_objects(subject):
          if RDFS.label in str(p):
            element['label'] = str(o)
          elif SKOS.prefLabel in str(p):
            element['prefLabel'] = str(o)
          elif SKOS.definition in str(p):
            element['definition'] = str(o)
          elif RDFS.comment in str(p):
            element['comment'] = str(o)

        if element['label']:
          elements.append(element)

    return elements

  def query_gemini_for_element(self, pdf_file, element):
    """Query Gemini for element description"""
    prompt = f"""
Looking at the ISBD documentation PDF, please find and describe the ISBD element "{element['label']}" ({element['uri']}).

Please provide a well-structured response with the following sections, using proper Markdown headings:

## Element Reference
- The official ISBD definition of this element
- Domain and range information if applicable
- Element type information

## Additional Information
- The scope and purpose of the element
- User tasks supported by this element

## Element Values
- Specific rules or guidelines for using this element
- Value constraints or formats
- String encoding schemes if applicable

## Examples
Provide at least 3-5 practical examples showing how this element would be used in real bibliographic records. Use code blocks for the examples.

## Relationships
- Notes about relationships to other ISBD elements
- Super-types and sub-types if applicable
- Inverse relationships if any

## Stipulations
- Any special considerations, exceptions, or usage notes
- Best practices for applying this element

If this specific element is not found in the PDF, please indicate that clearly at the beginning of your response.
"""

    # Use the new API to generate content
    response = self.client.models.generate_content(
      model='gemini-1.5-pro',
      contents=[
        types.Content(
          parts=[
            types.Part.from_uri(
              file_uri=pdf_file.uri,
              mime_type=pdf_file.mime_type
            ),
            types.Part.from_text(prompt)
          ]
        )
      ],
      config=types.GenerateContentConfig(
        temperature=0.1,
        max_output_tokens=2048,
      )
    )

    return response.text

  def format_rdf_for_yaml(self, element):
    """This method is no longer needed with the new approach"""
    pass

  def determine_isbd_area(self, element):
    """Determine which ISBD area this element belongs to"""
    label = (element.get('label', '') or '').lower()
    uri = (element.get('uri', '') or '').lower()

    # Area 0: Content Form and Media Type
    if any(term in label for term in ['content form', 'media type', 'production process', 'content qualification']):
      return 'area0'

    # Area 1: Title and Statement of Responsibility
    if any(term in label for term in ['title', 'statement of responsibility', 'parallel title', 'other title']):
      return 'area1'

    # Area 2: Edition
    if any(term in label for term in ['edition', 'draft', 'version']):
      return 'area2'

    # Area 3: Material or Type of Resource Specific
    if any(term in label for term in ['mathematical data', 'music format', 'numbering',
                                      'unpublished statement', 'cartographic', 'serial']):
      return 'area3'

    # Area 4: Publication, Production, Distribution
    if any(term in label for term in ['publication', 'production', 'distribution',
                                      'publisher', 'place of', 'date of']):
      return 'area4'

    # Area 5: Material Description
    if any(term in label for term in ['extent', 'physical', 'dimension', 'accompanying material']):
      return 'area5'

    # Area 6: Series
    if any(term in label for term in ['series', 'multipart monographic']):
      return 'area6'

    # Area 7: Note
    if 'note' in label:
      return 'area7'

    # Area 8: Resource Identifier
    if any(term in label for term in ['identifier', 'isbn', 'issn', 'ismn', 'terms of availability']):
      return 'area8'

    # Default to general folder
    return 'general'

  def save_as_mdx(self, element, content):
    """Save element documentation as MDX file"""
    # Extract ID from URI (e.g., P1001 from http://iflastandards.info/ns/isbd/elements/P1001)
    uri_parts = element['uri'].split('/')
    element_id = uri_parts[-1] if uri_parts[-1] else re.sub(r'[^a-z0-9]+', '-', element['label'].lower()).strip('-')

    # Determine the appropriate area folder
    area_folder = self.determine_isbd_area(element)

    filename = f"{element_id}.mdx"
    filepath = self.output_dir / area_folder / filename

    # Ensure directory exists
    filepath.parent.mkdir(parents=True, exist_ok=True)

    # Prepare frontmatter
    frontmatter = {
      'id': element_id,
      'title': element.get('label', element_id),
      'description': f"ISBD element documentation for {element.get('label', element_id)}",
      'uri': element.get('uri', ''),
      'area': area_folder
    }

    # Build RDF section
    rdf_data = {}

    # Map common RDF properties
    if element.get('skos:definition@en[0]') or element.get('skos:definition@en'):
      rdf_data['definition'] = element.get('skos:definition@en[0]', element.get('skos:definition@en', ''))
    if element.get('rdfs:domain'):
      rdf_data['domain'] = element['rdfs:domain']
    if element.get('rdfs:range'):
      rdf_data['range'] = element['rdfs:range']
    if element.get('rdf:type'):
      rdf_data['type'] = element['rdf:type']
    if element.get('skos:scopeNote@en[0]') or element.get('skos:scopeNote@en'):
      rdf_data['scopeNote'] = element.get('skos:scopeNote@en[0]', element.get('skos:scopeNote@en', ''))

    # Add relationships
    if element.get('owl:inverseOf'):
      rdf_data['inverseOf'] = element['owl:inverseOf']
    if element.get('rdfs:subPropertyOf'):
      rdf_data['elementSubType'] = element['rdfs:subPropertyOf']
    if element.get('reg:hasSubproperty'):
      rdf_data['elementSuperType'] = element['reg:hasSubproperty']

    # Add RDF data to frontmatter if any
    if rdf_data:
      frontmatter['RDF'] = rdf_data

    # Add other properties from CSV
    skip_keys = {'uri', 'label', 'prefLabel', 'definition', 'comment'}
    for key, value in element.items():
      if key not in skip_keys and value and key not in frontmatter:
        # Clean up property names for YAML
        clean_key = key.replace('@en', '').replace('[0]', '').replace('[1]', '')
        if clean_key not in frontmatter:
          frontmatter[clean_key] = value

    # Convert to YAML manually (simple approach)
    yaml_lines = ['---']
    for key, value in frontmatter.items():
      if isinstance(value, dict):
        yaml_lines.append(f"{key}:")
        for k, v in value.items():
          yaml_lines.append(f"  {k}: {json.dumps(v) if isinstance(v, (list, dict)) else v}")
      else:
        yaml_lines.append(f"{key}: {json.dumps(value) if isinstance(value, (list, dict)) or ':' in str(value) else value}")
    yaml_lines.append('---')

    # Create MDX content
    mdx_content = '\n'.join(yaml_lines) + f"""
# {element.get('label', element_id)}

{content}

---

*This content was automatically generated from the ISBD PDF documentation using Gemini AI analysis.*
"""

    filepath.write_text(mdx_content, encoding='utf-8')
    print(f"Saved: {filepath}")

  def process_elements(self, data_path, pdf_path):
    """Process all elements from data file"""
    # Upload PDF
    pdf_file = self.upload_pdf(pdf_path)

    # Parse input data
    data_path = Path(data_path)
    ext = data_path.suffix.lower()

    print(f"Parsing {ext} file...")

    if ext == '.csv':
      elements = self.parse_csv(data_path)
    elif ext == '.xml':
      elements = self.parse_rdf_xml(data_path)
    elif ext in ['.ttl', '.turtle']:
      elements = self.parse_turtle(data_path)
    else:
      raise ValueError(f"Unsupported file format: {ext}")

    print(f"Found {len(elements)} elements to process")

    # Process each element
    for i, element in enumerate(elements):
      if not element.get('label'):
        print(f"Element {i+1}: No label found, skipping...")
        continue

      print(f"\nProcessing {i+1}/{len(elements)}: {element['label']}")

      try:
        # Query Gemini
        description = self.query_gemini_for_element(pdf_file, element)

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
    print("Usage: python gemini_isbd_processor.py <data-file> <pdf-path>")
    print("API key will be read from GEMINI_API_KEY environment variable or .env file")
    print("Example: python gemini_isbd_processor.py data/elements.csv data/isbd.pdf")
    sys.exit(1)

  # Try to get API key from environment or .env file
  api_key = os.getenv('GEMINI_API_KEY')
  if not api_key:
    print("Error: GEMINI_API_KEY not found in environment variables")
    print("Please either:")
    print("  1. Create a .env file with: GEMINI_API_KEY=your-key-here")
    print("  2. Export it: export GEMINI_API_KEY=your-key-here")
    sys.exit(1)

  data_path = sys.argv[1]
  pdf_path = sys.argv[2]

  # Optional: override output directory
  output_dir = sys.argv[3] if len(sys.argv) > 3 else None

  processor = ISBDProcessor(api_key, output_dir)

  print(f"Output directory: {processor.output_dir}")

  try:
    processor.process_elements(data_path, pdf_path)
  except Exception as e:
    print(f"Processing failed: {e}")
    sys.exit(1)

if __name__ == "__main__":
  main()
