# Mixed Formats Test Notes

This test demonstrates the combination of all DCTAP extension features:

1. **Mandatory fields** (`*`): Both `*skos:prefLabel@en` and `*rdf:type` are required
2. **Language tags** (`@lang`): Properties can specify languages, with some mandatory
3. **Array format** (`[0]`, `[1]`): Fixed columns for first N values
4. **CSV format** (`[csv]`): All values in semicolon-delimited format
5. **Mixed usage**: The same property (e.g., `skos:altLabel`) can have both array and CSV columns

## Postel's Law Implementation

Following Postel's Law ("Be conservative in what you send, be liberal in what you accept"):

- **Import**: Accept data in either array or CSV format
- **Export**: If a profile defines both formats for a property, populate both columns
- **Validation**: Only enforce mandatory fields and language requirements

## Key Features Demonstrated

1. **Redundant columns**: `skos:altLabel` has both array (`[0]`, `[1]`) and CSV (`[csv]`) columns
2. **Language-specific handling**: English notes use array format, French notes use CSV format
3. **Sparse data handling**: Missing optional fields don't cause errors
4. **Validation errors**: Only reported for truly mandatory fields

This allows maximum flexibility for data editors while maintaining data quality requirements.