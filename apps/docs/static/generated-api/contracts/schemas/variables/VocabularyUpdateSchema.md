[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / VocabularyUpdateSchema

# Variable: VocabularyUpdateSchema

> `const` **VocabularyUpdateSchema**: `ZodObject`\<\{ `description`: `ZodOptional`\<`ZodOptional`\<`ZodString`\>\>; `googleSheetId`: `ZodOptional`\<`ZodOptional`\<`ZodString`\>\>; `name`: `ZodOptional`\<`ZodString`\>; `namespace`: `ZodOptional`\<`ZodOptional`\<`ZodString`\>\>; `status`: `ZodOptional`\<`ZodEnum`\<\[`"draft"`, `"review"`, `"published"`, `"deprecated"`\]\>\>; `syncEnabled`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `tags`: `ZodOptional`\<`ZodDefault`\<`ZodArray`\<`ZodString`, `"many"`\>\>\>; `version`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `description?`: `string`; `googleSheetId?`: `string`; `name?`: `string`; `namespace?`: `string`; `status?`: `"deprecated"` \| `"draft"` \| `"review"` \| `"published"`; `syncEnabled?`: `boolean`; `tags?`: `string`[]; `version?`: `string`; \}, \{ `description?`: `string`; `googleSheetId?`: `string`; `name?`: `string`; `namespace?`: `string`; `status?`: `"deprecated"` \| `"draft"` \| `"review"` \| `"published"`; `syncEnabled?`: `boolean`; `tags?`: `string`[]; `version?`: `string`; \}\>

Schema for updating vocabularies
