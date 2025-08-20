[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / JobSchema

# Variable: JobSchema

> `const` **JobSchema**: `ZodObject`\<\{ `createdAt`: `ZodString`; `error`: `ZodOptional`\<`ZodString`\>; `finishedAt`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `metadata`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `namespaceId`: `ZodOptional`\<`ZodString`\>; `outputUrl`: `ZodOptional`\<`ZodString`\>; `progress`: `ZodDefault`\<`ZodNumber`\>; `standardId`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\[`"queued"`, `"running"`, `"success"`, `"failed"`, `"cancelled"`\]\>; `type`: `ZodEnum`\<\[`"rdf_build"`, `"csv_to_rdf"`, `"validate_rdf"`, `"translation_sync"`, `"vocabulary_import"`, `"export_rdf"`, `"validate_terms"`, `"generate_docs"`\]\>; `updatedAt`: `ZodOptional`\<`ZodString`\>; `userId`: `ZodOptional`\<`ZodString`\>; `vocabularyId`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `createdAt?`: `string`; `error?`: `string`; `finishedAt?`: `string`; `id?`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `namespaceId?`: `string`; `outputUrl?`: `string`; `progress?`: `number`; `standardId?`: `string`; `status?`: `"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"`; `type?`: `"rdf_build"` \| `"csv_to_rdf"` \| `"validate_rdf"` \| `"translation_sync"` \| `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"`; `updatedAt?`: `string`; `userId?`: `string`; `vocabularyId?`: `string`; \}, \{ `createdAt?`: `string`; `error?`: `string`; `finishedAt?`: `string`; `id?`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `namespaceId?`: `string`; `outputUrl?`: `string`; `progress?`: `number`; `standardId?`: `string`; `status?`: `"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"`; `type?`: `"rdf_build"` \| `"csv_to_rdf"` \| `"validate_rdf"` \| `"translation_sync"` \| `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"`; `updatedAt?`: `string`; `userId?`: `string`; `vocabularyId?`: `string`; \}\>

Unified Job Model - All asynchronous operations conform to this model
Used throughout the admin portal for job management and monitoring
