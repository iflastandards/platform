[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / JobQuerySchema

# Variable: JobQuerySchema

> `const` **JobQuerySchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"createdAt"`, `"updatedAt"`, `"status"`, `"type"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `standardId`: `ZodOptional`\<`ZodString`\>; `status`: `ZodOptional`\<`ZodEnum`\<\[`"queued"`, `"running"`, `"success"`, `"failed"`, `"cancelled"`\]\>\>; `type`: `ZodOptional`\<`ZodEnum`\<\[`"vocabulary_import"`, `"export_rdf"`, `"validate_terms"`, `"generate_docs"`\]\>\>; `vocabularyId`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"type"` \| `"status"` \| `"createdAt"` \| `"updatedAt"`; `sortOrder?`: `"asc"` \| `"desc"`; `standardId?`: `string`; `status?`: `"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"`; `type?`: `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"`; `vocabularyId?`: `string`; \}, \{ `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"type"` \| `"status"` \| `"createdAt"` \| `"updatedAt"`; `sortOrder?`: `"asc"` \| `"desc"`; `standardId?`: `string`; `status?`: `"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"`; `type?`: `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"`; `vocabularyId?`: `string`; \}\>

Schema for job filtering and search
