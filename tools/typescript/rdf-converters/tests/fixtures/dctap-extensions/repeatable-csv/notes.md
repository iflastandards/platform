# Repeatable CSV Format Test Notes

This test demonstrates:

1. **Semicolon delimiter**: Multiple values are joined with `;` in a single CSV cell
2. **Handling special characters**: Values containing semicolons need to be properly escaped or quoted
3. **Language-specific CSV columns**: `[csv]` notation can be combined with language tags (e.g., `skos:note@en[csv]`)
4. **IRI CSV columns**: Works with both literal and IRI values (e.g., `skos:broader[csv]`)
5. **Single values**: Properties with only one value still work fine in CSV format
6. **Empty values**: Properties with no values result in empty cells

## CSV Escaping Rules

When values contain semicolons or other special characters:
- The entire cell should be quoted if it contains semicolons
- Internal quotes should be doubled
- This follows standard CSV escaping conventions

Example: `"Controlled Vocabulary; Thesauri;Authority Control"`