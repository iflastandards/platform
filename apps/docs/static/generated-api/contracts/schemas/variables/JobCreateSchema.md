[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / JobCreateSchema

# Variable: JobCreateSchema

> `const` **JobCreateSchema**: `ZodObject`\<`Pick`\<\{ `createdAt`: `ZodString`; `error`: `ZodOptional`\<`ZodString`\>; `finishedAt`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `metadata`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `namespaceId`: `ZodOptional`\<`ZodString`\>; `outputUrl`: `ZodOptional`\<`ZodString`\>; `progress`: `ZodDefault`\<`ZodNumber`\>; `standardId`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\[`"queued"`, `"running"`, `"success"`, `"failed"`, `"cancelled"`\]\>; `type`: `ZodEnum`\<\[`"rdf_build"`, `"csv_to_rdf"`, `"validate_rdf"`, `"translation_sync"`, `"vocabulary_import"`, `"export_rdf"`, `"validate_terms"`, `"generate_docs"`\]\>; `updatedAt`: `ZodOptional`\<`ZodString`\>; `userId`: `ZodOptional`\<`ZodString`\>; `vocabularyId`: `ZodOptional`\<`ZodString`\>; \}, `"type"` \| `"vocabularyId"` \| `"standardId"`\> & `object`, `"strip"`, `ZodTypeAny`, \{ `description?`: `string`; `priority?`: `"low"` \| `"normal"` \| `"high"`; `standardId?`: `string`; `type?`: `"rdf_build"` \| `"csv_to_rdf"` \| `"validate_rdf"` \| `"translation_sync"` \| `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"`; `vocabularyId?`: `string`; \}, \{ `description?`: `string`; `priority?`: `"low"` \| `"normal"` \| `"high"`; `standardId?`: `string`; `type?`: `"rdf_build"` \| `"csv_to_rdf"` \| `"validate_rdf"` \| `"translation_sync"` \| `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"`; `vocabularyId?`: `string`; \}\>

Schema for creating new jobs
