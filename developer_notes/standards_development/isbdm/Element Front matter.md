I'll provide a complete YAML front matter example with these additions and then map them to the corresponding RDF serializations.

# Expanded YAML to RDF Mapping

I'll update the mapping to include empty attributes, deprecation information, ElementSuperType as upper_value, and Docusaurus-specific fields.

URI RULES: 
  1. the root URI is the same elements: http://iflastandards.info/ns/isbdm/elements/
  2. The URI will always prepend a 'P' to the element number, which also the file name.
  3. The slug will always be the path of the file in the 'docs' folder
  4. The id of the file will be the filename without the extension
  5. The aliases will be ['/elements/P'] prepended to the file name/elements/P1277'

SIDEBAR RULES:
  1. Read the sidebar_label from the sidebar navigation in the source file
  2. Read the side_bar_level from the number of arrows preceding the label in the source sidebar plus one
  3. Read the sidebar_position from the sidebar order in the source file

## Enhanced YAML Front Matter

```yaml
---
# Docusaurus-specific fields
# id: defaults to the file name
# slug: defaults to the file path
# sidebar_label: will default to the First header in the file, but can be overridden here
sidebar_position: 13  # determiines the position in the sidebar and the section TOC
sidebar_level: 3  # the level of subproperty reletive to the base property. Used in building the section TOC

# Core element metadata
RDF:
  # Required properties
  id: "1025"
  # uri: will be assembled by concatenating the element_vocabulary_uri and the id
  # label: will default to the First header in the file, but can be overridden here
  # language: will be set by the locale of the documentation and default to "en"
  definition: "Relates a manifestation to a statement that appears in a manifestation to represent aspects of itself."
  domain: "Manifestation"
  range: ""  # Empty attribute example
  type: "ObjectProperty"
  
  # Optional properties
  scopeNote: "Additional information about the element's scope"
  
  # Relationships with other elements (optional)
  elementSubType:  # has no RDF equivalent. Used in the table
    - uri: "http://iflastandards.info/ns/isbdm/elements/1029"
      url: "/docs/statements/1029"
      label: "has manifestation statement of edition"
    - uri: "http://iflastandards.info/ns/isbdm/elements/1280"
      url: "/docs/statements/1280"
      label: "has manifestation statement of extent"
  # Multiple parent example (upper_value). Is output as multiple subPropertyOf in RDF      
  elementSuperType: # will convert to subPropertyOf in RDF
    - uri: "http://iflastandards.info/ns/isbdm/elements/P1023"
      url: "/ISBDM/docs/attributes/1023.html"
      label: "has extent of manifestation"
  equivalentProperty: []  # Empty array example
  inverseOf: []  # Empty array example
  
# Status and provenance
#  status: "Published" will be maintained at the global vocabulary level
#  isDefinedBy: will be maintained at the global vocabulary level
  
# Deprecation information (if applicable - all optional)
deprecated: true
deprecatedInVersion: "1.2.0"
willBeRemovedInVersion: "2.0.0"
---
```

## Mapping to RDF Serializations

### Complete Mapping Table

| YAML Property | JSON-LD                                                                                 | Turtle                                             | RDF/XML                                                                                        |
|---------------|-----------------------------------------------------------------------------------------|----------------------------------------------------|------------------------------------------------------------------------------------------------|
| `slug`, `aliases` | Not included in RDF                                                                     | Not included in RDF                                | Not included in RDF                                                                            |
| `label` | `skos:preflabel`                                                                        | `akos:prefLabel @en`                               | `skos:preflabel xml:lang="en"`                                                                 |
| `uri` | `@id`                                                                                   | Subject URI                                        | `rdf:about` attribute                                                                          |
| `type` | `@type`                                                                                 | `a`                                                | `rdf:type`                                                                                     |
| `definition` | `skos:definition`                                                                       | `rdfs:comment @en`                                 | `rdfs:comment xml:lang="en"`                                                                   |
| `scopeNote` 'Additional information about the element's scope'| Omitted or `skos:scopeNote: {"en": "Additional information about the element's scope"}` | 'Additional information about the element's scope' | 'Additional information about the element's scope'                                             |
| `domain` | `domain.@id`                                                                            | `rdfs:domain`                                      | `rdfs:domain rdf:resource`                                                                     |
| `range` (empty) | Omitted or `range: null`                                                                | Omitted                                            | Omitted                                                                                        |
| `elementSuperType` | `subPropertyOf` array                                                                   | Multiple `rdfs:subPropertyOf` statements           | Multiple `rdfs:subPropertyOf` elements                                                         |
| `equivalentProperty` (empty) | `equivalentProperty: []`                                                                | Omitted                                            | Omitted                                                                                        |
| `inverseOf` (empty) | `inverseOf: []`                                                                         | Omitted                                            | Omitted                                                                                        |
| `isDefinedBy` | `isDefinedBy.@id`                                                                       | `rdfs:isDefinedBy`                                 | `rdfs:isDefinedBy rdf:resource`                                                                |
| `deprecated` | `owl:deprecated: true`                                                                  | `owl:deprecated true`                              | `owl:deprecated rdf:datatype="http://www.w3.org/2001/XMLSchema#boolean">true</owl:deprecated>` |
| `deprecatedInVersion` | `ifla:deprecatedInVersion: "1.2.0"`                                                     | `ifla:deprecatedInVersion "1.2.0"`                 | `ifla:deprecatedInVersion>1.2.0</ifla:deprecatedInVersion>`                                    |
| `willBeRemovedInVersion` | `ifla:willBeRemovedInVersion: "2.0.0"`                                                  | `ifla:willBeRemovedInVersion "2.0.0"`              | `ifla:willBeRemovedInVersion>2.0.0</ifla:willBeRemovedInVersion>`                              |

### Updated JSON-LD Example with Empty Attributes and Deprecation

```json
{
  "@context": {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "dcterms": "http://purl.org/dc/terms/",
    "ifla": "http://iflastandards.info/ns/isbd/terms/"
  },
  "@graph": [
    {
      "@id": "http://iflastandards.info/ns/isbdm/elements/P1277",
      "@type": ["rdf:Property", "owl:ObjectProperty"],
      "skos:prefLabel": {
        "en": "has extent of embodied content"
      },
      "skos:definition": {
        "en": "Relates a manifestation to an extent of manifestation that is a measurement of the layout of content that is embodied in the manifestation."
      },
      "skos:scopeNote": {
        "en": "Additional information about the element's scope"
      },
      "domain": {
        "@id": "http://iflastandards.info/ns/isbdm/elements/Manifestation"
      },
      "range": null,
      "upper_value": [
        {
          "@id": "http://iflastandards.info/ns/isbdm/elements/P1023"
        }
      ],
      "subPropertyOf": {
        "@id": "http://iflastandards.info/ns/isbdm/elements/P1023"
      },
      "isDefinedBy": {
        "@id": "http://iflastandards.info/ns/isbdm/elements/",
        "label": "ISBD Manifestation elements"
      },
      "owl:deprecated": true,
      "ifla:deprecatedInVersion": "1.2.0",
      "ifla:willBeRemovedInVersion": "2.0.0"
    }
  ]
}
```

### Updated Turtle Example

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix isbdm: <http://iflastandards.info/ns/isbdm/elements/> .
@prefix ifla: <http://iflastandards.info/ns/isbd/terms/> .

isbdm:P1277 a rdf:Property, owl:ObjectProperty ;
  skos:prefLabel "has extent of embodied content"@en ;
  skos:definition "Relates a manifestation to an extent of manifestation that is a measurement of the layout of content that is embodied in the manifestation."@en ; 
  skos:scopeNote "Additional information about the element's scope"@en ;
  rdfs:domain isbdm:Manifestation ; 
  rdfs:range "" ;
  rdfs:subPropertyOf isbdm:P1023 ;
  rdfs:isDefinedBy <http://iflastandards.info/ns/isbdm/elements/> ;
  owl:deprecated true ;
  ifla:deprecatedInVersion "1.2.0" ;
  ifla:willBeRemovedInVersion "2.0.0" .
```

### Updated RDF/XML Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  xmlns:owl="http://www.w3.org/2002/07/owl#"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:ifla="http://iflastandards.info/ns/isbd/terms/">
  
  <rdf:Property rdf:about="http://iflastandards.info/ns/isbdm/elements/P1277">
    <rdf:type rdf:resource="http://www.w3.org/2002/07/owl#ObjectProperty"/>
    <skos:prefLabel xml:lang="en">has extent of embodied content</skos:prefLabel>
    <skos:definition xml:lang="en">Relates a manifestation to an extent of manifestation that is a measurement of the layout of content that is embodied in the manifestation.</skos:definition>
    <rdfs:domain rdf:resource="http://iflastandards.info/ns/isbdm/elements/Manifestation"/>
    <rdfs:subPropertyOf rdf:resource="http://iflastandards.info/ns/isbdm/elements/P1023"/>
    <rdfs:isDefinedBy rdf:resource="http://iflastandards.info/ns/isbdm/elements/"/>
    <owl:deprecated rdf:datatype="http://www.w3.org/2001/XMLSchema#boolean">true</owl:deprecated>
    <ifla:deprecatedInVersion>1.2.0</ifla:deprecatedInVersion>
    <ifla:willBeRemovedInVersion>2.0.0</ifla:willBeRemovedInVersion>
  </rdf:Property>
</rdf:RDF>
```

## Notes on Special Cases

1. **Empty attributes**:
   - In JSON-LD: Can be explicitly represented as empty strings/arrays or omitted
   - In Turtle/RDF-XML: Typically omitted entirely
   
2. **Docusaurus slugs and aliases**:
   - These are used purely for Docusaurus routing and not included in RDF output
   - They follow the pattern described in Docusaurus documentation

3. **Deprecation**:
   - `owl:deprecated` is a standard OWL property (boolean)
   - `ifla:deprecatedInVersion` and `ifla:willBeRemovedInVersion` are custom properties for versioning information

4. **Multiple parents**:
   - The W3C example uses `upper_value` array in JSON-LD
   - In Turtle and RDF/XML, these translate to multiple `rdfs:subPropertyOf` statements

This mapping provides a comprehensive translation between the YAML front matter and various RDF serializations, handling all the special cases you mentioned.

