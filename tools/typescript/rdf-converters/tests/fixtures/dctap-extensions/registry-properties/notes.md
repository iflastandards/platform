# Registry Properties Test Notes

This test demonstrates support for metadata registry properties commonly used in IFLA standards:

## Registry Properties

1. **reg:status**: Registry status URI (e.g., Published, Deprecated, Draft)
2. **reg:identifier**: Human-readable identifier in the registry
3. **dct:created**: Creation date (xsd:date format)
4. **dct:modified**: Last modification date (xsd:date format)
5. **dct:creator**: Agent who created the resource (IRI)
6. **dct:contributor**: Agents who contributed (repeatable, IRI)

## Key Features

- **Namespace handling**: Uses standard prefixes (reg, dct, xsd)
- **Data types**: Supports typed literals (xsd:date) and IRIs
- **Optional properties**: Registry properties are typically optional
- **Repeatable contributors**: Uses array format for multiple contributors

## Common Registry Status URIs

- `http://metadataregistry.org/uri/RegStatus/1001` - Published
- `http://metadataregistry.org/uri/RegStatus/1002` - New/Proposed
- `http://metadataregistry.org/uri/RegStatus/1003` - Changed/Amended
- `http://metadataregistry.org/uri/RegStatus/1008` - Deprecated

These properties help track the lifecycle and provenance of vocabulary terms and element sets in the registry.