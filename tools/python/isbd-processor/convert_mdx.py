import os
import re
from bs4 import BeautifulSoup, NavigableString

def to_markdown(soup, level=0):
    """Recursively converts BeautifulSoup object to Markdown."""
    markdown = ""
    indent = "  " * level
    for element in soup.contents:
        if isinstance(element, NavigableString):
            # Preserve whitespace and newlines from NavigableString
            markdown += element.string
        elif element.name == 'strong':
            markdown += f"**{element.get_text(strip=True)}**"
        elif element.name == 'ul':
            markdown += to_markdown(element, level + 1)
        elif element.name == 'li':
            # Process list item content
            item_content = ''.join(to_markdown(c, level) for c in element.contents).strip()
            markdown += f"{indent}- {item_content}\n"
        else:
            # For other tags like <div>, <p>, etc., just process their content
            markdown += to_markdown(element, level)
    return markdown

def process_mdx_file(filepath):
    """Reads an MDX file, converts specific HTML tags to Markdown, and saves it."""
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        original_content = f.read()

    # Split content to isolate parts inside <div> tags for processing
    parts = re.split(r'(<div.*?/div>)', original_content, flags=re.DOTALL)
    
    new_content = ""
    converted = False
    for part in parts:
        if part.startswith('<div'):
            # Extract content within the div
            div_match = re.match(r'(<div.*?>)(.*)(</div>)', part, re.DOTALL)
            if div_match:
                div_start_tag, div_content, div_end_tag = div_match.groups()
                
                # Use BeautifulSoup to parse and convert only the div's content
                soup = BeautifulSoup(div_content, 'html.parser')
                
                # Convert <strong>
                for strong in soup.find_all('strong'):
                    strong.replace_with(f"**{strong.get_text(strip=True)}**")
                
                # Convert <ul>
                for ul in soup.find_all('ul'):
                    md_list = ""
                    for li in ul.find_all('li', recursive=False):
                        # Handle nested lists by recursively calling a conversion function
                        def process_li_content(li_tag, current_level=1):
                            prefix = "  " * (current_level -1)
                            text = ''.join(f"**{c.get_text(strip=True)}**" if c.name == 'strong' else c.string for c in li_tag.contents if c.name != 'ul').strip()
                            md_item = f"{prefix}- {text}\n"
                            nested_ul = li_tag.find('ul')
                            if nested_ul:
                                for nested_li in nested_ul.find_all('li', recursive=False):
                                    md_item += process_li_content(nested_li, current_level + 1)
                            return md_item
                        md_list += process_li_content(li)

                    # Replace the ul tag with the markdown string
                    ul.replace_with(md_list)

                converted_div_content = str(soup)
                
                if div_content != converted_div_content:
                    converted = True

                new_content += div_start_tag + converted_div_content + div_end_tag
            else:
                new_content += part # Should not happen with the regex
        else:
            new_content += part

    if converted:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  - Converted {os.path.basename(filepath)}")
    else:
        print(f"  - No changes needed for {os.path.basename(filepath)}")


def process_directory(directory):
    """Processes all MDX files in a given directory."""
    for filename in os.listdir(directory):
        if filename.endswith(".mdx"):
            filepath = os.path.join(directory, filename)
            process_mdx_file(filepath)

if __name__ == "__main__":
    ses_directory = 'standards/isbd/docs/elements/isbd/SES'
    abs_ses_directory = os.path.abspath(ses_directory)

    if os.path.exists(abs_ses_directory):
        process_directory(abs_ses_directory)
    else:
        print(f"Directory not found: {abs_ses_directory}")

    print("\nProcessing complete.")