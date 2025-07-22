# Component Transformation Guide

This document provides a comprehensive guide on how to transform HTML elements to their corresponding React components when converting HTML to MDX.

## 1. ElementReference

**Search Pattern**: `<div class="referenceTable">` with rows of `<div class="label">` and `<div class="value">`

**Props**: Takes `frontMatter` prop containing RDF metadata

**Transformation**:
```jsx
// Before (HTML):
<div class="elementReference">
  <table>
    <tr><td>Definition</td><td>Definition text</td></tr>
    <tr><td>Domain</td><td>Manifestation</td></tr>
  </table>
</div>

// After (MDX):
---
RDF:
  label: "element name"
  definition: "Definition text"
  domain: "Manifestation"
  uri: "http://example.org/element/123"
---
<ElementReference frontMatter={frontMatter} />
```

## 2. ExampleTable

**Search Pattern**: `<table class="exampleTable">` with element, value, and detail columns

**Props**: Takes `entries` array with element, elementUrl, value, and detail properties

**Transformation**:
```jsx
// Before (HTML):
<table>
  <tr>
    <td><a href="/ISBDM/docs/statements/1028.html">element name</a></td>
    <td>"element value"</td>
    <td>additional detail</td>
  </tr>
</table>

// After (MDX):
<ExampleTable
  entries={[
    {
      element: "element name",
      elementUrl: "/docs/statements/1028",
      value: "\"element value\"",
      detail: "additional detail"
    }
  ]}
/>
```

## 3. Figure

**Search Pattern**: Image elements with `<figure>` and `<figcaption>` tags, often in `<div class="col-md-12 my-2 text-center">` blocks

**Props**: `src`, `caption`, `alt`, `expandLink`, `expandText`

**Transformation**:
```jsx
// Before (HTML):
<div class="text-center">
  <figure class="figure">
    <img src="/ISBDM/images/x001.png" alt="Alt text" />
    <figcaption>Caption text</figcaption>
    <figcaption><a href="/ISBDM/docs/fullimages/x001.html">[Expand image]</a></figcaption>
  </figure>
</div>

// After (MDX):
<Figure 
  src="/img/x001.png"
  caption="Caption text"
  alt="Alt text"
  expandLink="/docs/fullimages/x001"
  expandText="[Expand image]"
/>
```

## 4. InLink

**Search Pattern**: `<a class="linkInline">` or `<a class="linkMenuElement">`

**Props**: `href` for link target, content as children

**Transformation**:
```jsx
// Before (HTML):
<a class="linkInline" href="/ISBDM/docs/attributes/1277.html">link text</a>

// After (MDX):
<InLink href="/docs/attributes/1277">link text</InLink>
```

## 5. Mandatory

**Search Pattern**: `<span class="mandatory">` with symbol `&#10045;`

**Props**: `link`, `symbol`, `tooltipText`

**Transformation**:
```jsx
// Before (HTML):
<span class="mandatory" title="Mandatory">
  <a href="/ISBDM/docs/intro#i022.html">&#10045;</a>
</span>

// After (MDX):
<Mandatory link="/docs/intro#i022" symbol="✽" tooltipText="Mandatory" />
// Or simplest form with defaults:
<Mandatory />
```

## 6. OutLink

**Search Pattern**: `<a class="linkOutline">` and links with `target="_blank"`

**Props**: `href` for external URL, content as children, optional `external` boolean

**Transformation**:
```jsx
// Before (HTML):
<a class="linkOutline" href="https://www.ifla.org" target="_blank" rel="noopener noreferrer">IFLA website</a>

// After (MDX):
<OutLink href="https://www.ifla.org">IFLA website</OutLink>
```

## 7. SeeAlso

**Search Pattern**: `<div class="seeAlso">` containing italicized "See also" text

**Props**: Content after "See also:" as children

**Transformation**:
```jsx
// Before (HTML):
<div class="seeAlso">
  <p><i>See also</i>: <a class="linkInline" href="/ISBDM/docs/assess/p016.html">Related page</a></p>
</div>

// After (MDX):
<SeeAlso>
  <InLink href="/docs/assess#p016">Related page</InLink>
</SeeAlso>
```

## 8. Unique

**Search Pattern**: `<span class="unique">1</span>`

**Props**: `symbol`, `tooltipText`

**Transformation**:
```jsx
// Before (HTML):
<span class="unique">1</span>

// After (MDX):
<Unique symbol="1" tooltipText="Unique" />
// Or simplest form:
<Unique />
```

## 9. VocabularyTable

**Search Pattern**: `<div class="tableContainer">` with vocabulary structures or tables with value/definition/scope note columns

**Props**: `vocabularyId`, `title`, `description`, `concepts` array

**Transformation**:
```jsx
// Before (HTML):
<h2>1275 - Vocabulary Title</h2>
<p>Description text...</p>
<table>
  <tr><th>Value</th><th>Definition</th><th>Scope Note</th></tr>
  <tr><td>term1</td><td>Definition text</td><td>Scope note</td></tr>
</table>

// After (MDX):
---
vocabularyId: "1275"
title: "Vocabulary Title"
description: "Description text..."
concepts: [
  {
    value: "term1",
    definition: "Definition text",
    scopeNote: "Scope note"
  }
]
---
<VocabularyTable {...frontMatter} />
```
