[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / Job

# Type Alias: Job

> **Job** = `object`

Unified Job Model - All asynchronous operations conform to this model
Used throughout the admin portal for job management and monitoring

## Type declaration

### createdAt?

> `optional` **createdAt**: `string`

### error?

> `optional` **error**: `string`

### finishedAt?

> `optional` **finishedAt**: `string`

### id?

> `optional` **id**: `string`

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

### namespaceId?

> `optional` **namespaceId**: `string`

### outputUrl?

> `optional` **outputUrl**: `string`

### progress?

> `optional` **progress**: `number`

### standardId?

> `optional` **standardId**: `string`

### status?

> `optional` **status**: `"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"`

### type?

> `optional` **type**: `"rdf_build"` \| `"csv_to_rdf"` \| `"validate_rdf"` \| `"translation_sync"` \| `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"`

### updatedAt?

> `optional` **updatedAt**: `string`

### userId?

> `optional` **userId**: `string`

### vocabularyId?

> `optional` **vocabularyId**: `string`
