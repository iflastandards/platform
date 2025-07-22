# ISBD Documentation Structure

This directory contains the documentation for the ISBD namespace, organized to support multiple element sets and vocabularies.

## Directory Structure

```
docs/
├── index.mdx                    # Namespace hub - overview of all element sets and vocabularies
├── elements/
│   ├── index.mdx               # Element sets overview
│   ├── isbd/                   # ISBD constrained element set
│   │   ├── index.mdx          # ISBD elements overview
│   │   ├── statements/        # Statement elements category
│   │   ├── notes/            # Note elements category
│   │   ├── attributes/       # Attribute elements category
│   │   └── relationships/    # Relationship elements category
│   └── unconstrained/         # ISBD unconstrained element set
│       ├── index.mdx         # Unconstrained elements overview
│       └── elements/         # All unconstrained elements
├── vocabularies/              # Concept schemes/vocabularies
│   ├── index.mdx             # Vocabularies overview
│   ├── contentform/          # Content form vocabulary
│   ├── contentformbase/      # Content form base vocabulary
│   ├── mediatype/            # Media type vocabulary
│   └── contentqualification/ # Content qualification vocabularies
│       ├── dimensionality/
│       ├── motion/
│       ├── sensoryspecification/
│       └── type/
├── introduction.mdx           # ISBD introduction
├── assessment.mdx            # Assessment guidelines
├── examples.mdx              # Usage examples
├── glossary.mdx              # Glossary of terms
└── about.mdx                 # About ISBD

```

## Key Features

### Multiple Element Sets
- **ISBD Elements**: Constrained elements with domain/range (prefix: isbd:)
- **ISBD Unconstrained**: Flexible elements without constraints (prefix: isbdu:)

### Organized Vocabularies
- 7 concept schemes organized by purpose
- Clear namespace patterns for each vocabulary

### Import-Ready Structure
- Each directory is ready to receive imported elements/terms
- Placeholder index pages provide context
- Structure matches the multi-element set design

## Navigation

Users can navigate via:
1. **Sidebar**: Hierarchical navigation through all content
2. **Navbar dropdowns**: Quick access to element sets and vocabularies
3. **Hub page**: Visual overview with statistics and cards
4. **Search**: Find specific elements or terms

## For Import Process

When importing from spreadsheets:
- Elements go into their respective category directories
- Use the element set information in site-config.json
- Maintain the P-prefix for constrained, U-prefix for unconstrained
- Vocabularies use T-prefix for all terms