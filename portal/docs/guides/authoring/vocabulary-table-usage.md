---
sidebar_label: Vocabulary - How to Document a Vocabulary
---
# How to Document a Vocabulary: A Complete Guide

*A non-technical guide to using the VocabularyTable component for documenting library metadata vocabularies*

## Overview: Two Ways to Create Vocabularies

You can document vocabularies in two ways:

1. **📝 Text Method**: Write everything directly in a documentation page
2. **📊 CSV Method**: Use a spreadsheet (CSV file) to manage your vocabulary data

Both methods create the same result - a professional vocabulary table with filtering, multiple languages, and proper formatting.

---

## Method 1: YAML Front Matter Method

This method is best when you have a small vocabulary (under 20 terms) or want everything in one place.

### Step 1: Create a New Documentation Page

Create a new file in your documentation with a name like `content-types.mdx`:

```mdx
---
vocabularyId: "content-types"
title: "Content Type Vocabulary"
description: "Types of content found in library materials"
concepts:
  - value: "text"
    definition: "Content expressed through written language"
    scopeNote: "Includes books, articles, and written documents"
  - value: "image"
    definition: "Visual content including photographs and illustrations"
    scopeNote: "Both digital and physical images"
  - value: "audio"
    definition: "Sound content including music and spoken word"
    scopeNote: "Recorded or live audio content"
---

# Content Type Vocabulary

This vocabulary defines the different types of content that can be found in library materials.

<VocabularyTable {...frontMatter} />
```

### Step 2: Understanding the YAML Structure

The vocabulary data goes in the **front matter** (the section between the `---` lines at the top). Each term in your vocabulary needs:

- **value**: The actual term (e.g., "text", "audio")
- **definition**: What the term means
- **scopeNote** *(optional)*: Additional clarification or usage notes

### Step 3: Adding More Details (Optional)

You can include additional information for any term:

```yaml
---
vocabularyId: "content-types"
title: "Content Type Vocabulary"
description: "Types of content found in library materials"
concepts:
  - value: "multimedia"
    definition: "Content combining multiple media types"
    scopeNote: "Content that includes text, images, and audio together"
    notation: "MM"
    example: "Interactive educational software, video games"
    historyNote: "Term introduced in version 2.0 of the standard"
---
```

**Available optional fields:**
- `notation`: A short code or abbreviation
- `example`: Specific examples of the term's usage
- `changeNote`: Notes about changes to the term
- `historyNote`: Historical information about the term
- `editorialNote`: Internal notes for editors

---

## Method 2: CSV Method (Using Spreadsheets)

This method is best for larger vocabularies, when multiple people are contributing, or when you want to manage data in a spreadsheet program.

### Step 1: Create Your CSV File

Open Excel, Google Sheets, or any spreadsheet program and create a file with these columns:

| uri | rdf:type | skos:prefLabel@en | skos:definition@en[0] | skos:scopeNote@en[0] |
|-----|----------|-------------------|----------------------|---------------------|
| contenttype:T1001 | http://www.w3.org/2004/02/skos/core#Concept | text | Content expressed through written language | Includes books and written documents |
| contenttype:T1002 | http://www.w3.org/2004/02/skos/core#Concept | image | Visual content including photographs | Both digital and physical images |
| contenttype:T1003 | http://www.w3.org/2004/02/skos/core#Concept | audio | Sound content including music | Recorded or live audio content |

**Required columns:**
- `uri`: Unique identifier (use pattern: `yourprefix:T1001`, `yourprefix:T1002`, etc.)
- `rdf:type`: Always use `http://www.w3.org/2004/02/skos/core#Concept`
- `skos:prefLabel@en`: The term name in English
- `skos:definition@en[0]`: The definition in English

**Optional columns:**
- `skos:scopeNote@en[0]`: Additional usage notes
- `skos:notation@en[0]`: Short codes or abbreviations
- `skos:example@en[0]`: Usage examples

### Step 2: Save Your CSV File

1. Save your spreadsheet as a CSV file
2. Name it descriptively (e.g., `content-types.csv`)
3. Place it in your documentation's `static/vocabularies/csv/` folder

### Step 3: Create the Documentation Page with Front Matter

Create a documentation page with the ConceptScheme properties in front matter and load your CSV:

```mdx
---
vocabularyId: "content-types"
title: "Content Type Vocabulary"
description: "Types of content found in library materials"
scopeNote: "This vocabulary covers the basic types of content found in library collections"
prefix: "contenttype"
uri: "http://iflastandards.info/ns/isbdm/values/content-types"
isDefinedBy: "http://iflastandards.info/ns/isbdm/values/content-types"
---

# Content Type Vocabulary

This vocabulary defines the different types of content that can be found in library materials.

<VocabularyTable 
  {...frontMatter}
  csvFile="vocabularies/csv/content-types.csv" 
/>
```

**Important**: Even when using CSV files, the vocabulary-level properties (title, description, etc.) still go in the front matter. The CSV file only contains the individual terms (concepts).

---

## Adding Multiple Languages

Both methods support multiple languages. Here's how:

### YAML Front Matter Method with Multiple Languages

```yaml
---
vocabularyId: "content-types"
title:
  en: "Content Type Vocabulary"
  fr: "Vocabulaire des types de contenu"
  es: "Vocabulario de tipos de contenido"
description:
  en: "Types of content found in library materials"
  fr: "Types de contenu trouvés dans les documents de bibliothèque"
  es: "Tipos de contenido encontrados en materiales de biblioteca"
concepts:
  - value:
      en: "text"
      fr: "texte"
      es: "texto"
    definition:
      en: "Content expressed through written language"
      fr: "Contenu exprimé par le langage écrit"
      es: "Contenido expresado a través del lenguaje escrito"
    scopeNote:
      en: "Includes books and written documents"
      fr: "Comprend les livres et documents écrits"
      es: "Incluye libros y documentos escritos"
---

# {frontMatter.title.en}

<VocabularyTable {...frontMatter} />
```

### CSV Method with Multiple Languages

Add columns for each language:

| uri | rdf:type | skos:prefLabel@en | skos:prefLabel@fr | skos:prefLabel@es | skos:definition@en[0] | skos:definition@fr[0] | skos:definition@es[0] |
|-----|----------|-------------------|-------------------|-------------------|----------------------|----------------------|----------------------|
| contenttype:T1001 | http://www.w3.org/2004/02/skos/core#Concept | text | texte | texto | Content expressed through written language | Contenu exprimé par le langage écrit | Contenido expresado a través del lenguaje escrito |

**Language codes to use:**
- `@en` - English
- `@fr` - French  
- `@es` - Spanish
- `@de` - German
- `@it` - Italian
- `@zh` - Chinese
- `@ru` - Russian
- `@ar` - Arabic

---

## Customizing Your Vocabulary Display

You can customize how your vocabulary appears by adding options to the front matter or component:

### Hiding or Showing Elements

```yaml
---
vocabularyId: "content-types"
title: "Content Type Vocabulary"
description: "Types of content found in library materials"
showTitle: true        # Show the title in the component
showURIs: false        # Hide the technical URIs
showFilter: true       # Show the search filter (default)
showLanguageSelector: true  # Show language dropdown (default)
concepts:
  - value: "text"
    definition: "Content expressed through written language"
---

# Content Type Vocabulary

<VocabularyTable {...frontMatter} />
```

### Alternative: Using Component Props

```yaml
---
vocabularyId: "content-types"
title: "Content Type Vocabulary"
description: "Types of content found in library materials"
concepts:
  - value: "text"
    definition: "Content expressed through written language"
---

# Content Type Vocabulary

<VocabularyTable 
  {...frontMatter}
  showTitle={true}
  showURIs={false}
  filterPlaceholder="Search for terms..."
/>
```

### Custom Text

```yaml
---
vocabularyId: "content-types"
title: "My Custom Title"
description: "My custom description text"
filterPlaceholder: "Search for terms..."
concepts:
  - value: "text"
    definition: "Content expressed through written language"
---
```

### Different URI Styles

```yaml
---
vocabularyId: "content-types"
title: "Content Type Vocabulary"
uriStyle: "slug"           # Use word-based URIs like #text-content
caseStyle: "kebab-case"    # Use dashes: #text-content
concepts:
  - value: "text content"
    definition: "Content expressed through written language"
---
```

**URI Style Options:**
- `numeric`: Creates `#t1001`, `#t1002` (default)
- `slug`: Creates `#text-content`, `#audio-content`

**Case Style Options (for slug URIs):**
- `kebab-case`: `#text-content` (default)
- `snake_case`: `#text_content`
- `camelCase`: `#textContent`
- `PascalCase`: `#TextContent`

---

## Common Use Cases and Examples

### 1. Simple Glossary (No URIs shown)

```yaml
---
vocabularyId: "glossary"
title: "Library Terms Glossary"
description: "Common terms used in library science"
showURIs: false
concepts:
  - value: "cataloging"
    definition: "The process of creating bibliographic records for library materials"
  - value: "circulation"
    definition: "The lending of library materials to patrons"
---

# Library Terms Glossary

<VocabularyTable {...frontMatter} />
```

### 2. Formal Vocabulary with URIs

```yaml
---
vocabularyId: "media-types"
title: "Media Type Vocabulary"
description: "Controlled vocabulary for media types in library collections"
prefix: "ifla"
startCounter: 2000
concepts:
  - value: "print"
    definition: "Physical materials printed on paper"
    notation: "P"
    example: "Books, journals, newspapers"
---

# Media Type Vocabulary

<VocabularyTable {...frontMatter} />
```

### 3. Large Vocabulary from CSV

```yaml
---
vocabularyId: "subjects"
title: "Subject Classification System"
description: "Comprehensive subject classification for library materials"
prefix: "subjects"
uri: "http://example.org/subjects"
---

# Subject Classification System

<VocabularyTable 
  {...frontMatter}
  csvFile="vocabularies/csv/subjects.csv" 
/>

<!-- The CSV file contains 500+ subject terms -->
```

### 4. Multilingual Vocabulary

```yaml
---
vocabularyId: "multilingual-terms"
title:
  en: "Multilingual Library Terms"
  fr: "Termes de bibliothèque multilingues"
  es: "Términos de biblioteca multilingües"
  de: "Mehrsprachige Bibliotheksbegriffe"
description:
  en: "Library terms in multiple languages"
  fr: "Termes de bibliothèque en plusieurs langues"
  es: "Términos de biblioteca en varios idiomas"
  de: "Bibliotheksbegriffe in mehreren Sprachen"
defaultLanguage: "en"
availableLanguages: ["en", "fr", "es", "de"]
---

# {frontMatter.title.en}

<VocabularyTable 
  {...frontMatter}
  csvFile="vocabularies/csv/multilingual-terms.csv"
/>
```

---

## Best Practices

### 1. **Choose the Right Method**
- **Text method**: 5-20 terms, simple vocabulary, everything in one place
- **CSV method**: 20+ terms, collaborative editing, complex data management

### 2. **Writing Good Definitions**
- Keep definitions clear and concise
- Avoid circular definitions (don't use the term in its own definition)
- Use plain language when possible
- Be consistent in style and format

### 3. **Using Scope Notes**
- Clarify when to use vs. when not to use a term
- Provide examples of what's included or excluded
- Explain relationships to other terms

### 4. **Organizing Terms**
- Use logical, intuitive term names
- Be consistent in naming patterns
- Consider alphabetical order for easier browsing

### 5. **Version Control**
- Keep track of changes to your vocabularies
- Document when and why terms are added or changed
- Use change notes for significant modifications

---

## Troubleshooting Common Issues

### "My CSV file won't load"
**Solution**: 
- Make sure the file is saved as `.csv` format
- Check that it's in the `static/vocabularies/csv/` folder
- Verify the file path in your component matches exactly

### "Terms aren't displaying properly"
**Solution**:
- Check that you have the required columns: `uri`, `rdf:type`, `skos:prefLabel@en`
- Make sure there are no empty rows in your CSV
- Verify special characters are properly encoded

### "Language switching doesn't work"
**Solution**:
- Ensure you have columns for each language (e.g., `skos:prefLabel@fr`)
- Check that language codes are correct (`@en`, `@fr`, etc.)
- Verify there's actually content in the language columns

### "Search/filtering isn't working"
**Solution**:
- Make sure `showFilter={true}` is set (it's default)
- Check that your terms have content to search through
- Try refreshing the page

---

## Getting Help

If you need assistance:

1. **Check your file format** - Make sure CSV files are properly formatted
2. **Review the examples** - Compare your code to the working examples above
3. **Test with simple data first** - Try with just 2-3 terms to isolate issues
4. **Check the browser console** - Look for error messages that might help
5. **Ask for technical support** - Provide specific error messages and your code

Remember: The component is designed to be forgiving and helpful. Most issues are simple formatting problems that are easy to fix once identified.

---

## Quick Reference

### Minimal YAML Front Matter Vocabulary
```yaml
---
vocabularyId: "my-vocab"
concepts:
  - value: "term1"
    definition: "Definition 1"
  - value: "term2"
    definition: "Definition 2"
---

# My Vocabulary

<VocabularyTable {...frontMatter} />
```

### Minimal CSV Vocabulary
```yaml
---
vocabularyId: "my-csv-vocab"
title: "My CSV Vocabulary"
description: "A vocabulary loaded from CSV"
---

# My CSV Vocabulary

<VocabularyTable 
  {...frontMatter}
  csvFile="vocabularies/csv/my-terms.csv" 
/>
```

### All Available Front Matter Options
```yaml
---
vocabularyId: "complete-example"
title: "Complete Example"
description: "Shows all available options"
scopeNote: "This is a comprehensive example vocabulary"
prefix: "example"
uri: "http://example.org/vocabularies/complete"
isDefinedBy: "http://example.org/vocabularies/complete"
startCounter: 1000
uriStyle: "numeric"
caseStyle: "kebab-case"
showTitle: true
showFilter: true
showURIs: true
showLanguageSelector: true
filterPlaceholder: "Search terms..."
defaultLanguage: "en"
availableLanguages: ["en", "fr", "es"]
concepts:
  - value: "example term"
    definition: "An example definition"
    scopeNote: "Additional context"
    notation: "EX"
    example: "Usage example"
---

# {frontMatter.title}

<VocabularyTable {...frontMatter} />
```

This guide should help you create professional, searchable vocabulary documentation regardless of your technical background!
