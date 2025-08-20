[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / VocabularyQuerySchema

# Variable: VocabularyQuerySchema

> `const` **VocabularyQuerySchema**: `ZodObject`\<\{ `includeTerm`: `ZodDefault`\<`ZodBoolean`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `search`: `ZodOptional`\<`ZodString`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"name"`, `"createdAt"`, `"updatedAt"`, `"version"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `standardId`: `ZodOptional`\<`ZodString`\>; `status`: `ZodOptional`\<`ZodEnum`\<\[`"draft"`, `"review"`, `"published"`, `"deprecated"`\]\>\>; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `includeTerm?`: `boolean`; `limit?`: `number`; `offset?`: `number`; `search?`: `string`; `sortBy?`: `"createdAt"` \| `"updatedAt"` \| `"name"` \| `"version"`; `sortOrder?`: `"asc"` \| `"desc"`; `standardId?`: `string`; `status?`: `"deprecated"` \| `"draft"` \| `"review"` \| `"published"`; `tags?`: `string`[]; \}, \{ `includeTerm?`: `boolean`; `limit?`: `number`; `offset?`: `number`; `search?`: `string`; `sortBy?`: `"createdAt"` \| `"updatedAt"` \| `"name"` \| `"version"`; `sortOrder?`: `"asc"` \| `"desc"`; `standardId?`: `string`; `status?`: `"deprecated"` \| `"draft"` \| `"review"` \| `"published"`; `tags?`: `string`[]; \}\>

Schema for vocabulary search and filtering
