# Repeatable Array Format Test Notes

This test demonstrates:

1. **Array indexing**: Properties can be defined with `[0]`, `[1]`, `[2]` etc. to create separate columns for repeatable values
2. **Overflow handling**: When there are more values than defined slots, the extra values are dropped (e.g., the 4th altLabel and 3rd note for concept1)
3. **Sparse arrays**: Empty slots are preserved in the CSV output (e.g., concept2 has no altLabel[1])
4. **Language-specific arrays**: Array notation can be combined with language tags (e.g., `skos:note@en[0]`)
5. **IRI arrays**: Works with both literal and IRI values (e.g., `skos:broader[0]`)

The array format is useful when you need a fixed number of columns for repeatable values in the CSV output.