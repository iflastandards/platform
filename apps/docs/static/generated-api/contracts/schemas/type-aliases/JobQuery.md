[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / JobQuery

# Type Alias: JobQuery

> **JobQuery** = `object`

Schema for job filtering and search

## Type declaration

### limit?

> `optional` **limit**: `number`

### offset?

> `optional` **offset**: `number`

### sortBy?

> `optional` **sortBy**: `"type"` \| `"status"` \| `"createdAt"` \| `"updatedAt"`

### sortOrder?

> `optional` **sortOrder**: `"asc"` \| `"desc"`

### standardId?

> `optional` **standardId**: `string`

### status?

> `optional` **status**: `"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"`

### type?

> `optional` **type**: `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"`

### vocabularyId?

> `optional` **vocabularyId**: `string`
