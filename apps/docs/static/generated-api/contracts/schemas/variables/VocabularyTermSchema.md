[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / VocabularyTermSchema

# Variable: VocabularyTermSchema

> `const` **VocabularyTermSchema**: `ZodObject`\<\{ `code`: `ZodString`; `createdAt`: `ZodString`; `createdBy`: `ZodOptional`\<`ZodString`\>; `definition`: `ZodOptional`\<`ZodString`\>; `deprecated`: `ZodDefault`\<`ZodBoolean`\>; `id`: `ZodString`; `label`: `ZodString`; `lastModifiedBy`: `ZodOptional`\<`ZodString`\>; `note`: `ZodOptional`\<`ZodString`\>; `order`: `ZodDefault`\<`ZodNumber`\>; `parentId`: `ZodOptional`\<`ZodString`\>; `translations`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodObject`\<\{ `definition`: `ZodOptional`\<`ZodString`\>; `label`: `ZodString`; `note`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `definition?`: `string`; `label?`: `string`; `note?`: `string`; \}, \{ `definition?`: `string`; `label?`: `string`; `note?`: `string`; \}\>\>\>; `updatedAt`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `code?`: `string`; `createdAt?`: `string`; `createdBy?`: `string`; `definition?`: `string`; `deprecated?`: `boolean`; `id?`: `string`; `label?`: `string`; `lastModifiedBy?`: `string`; `note?`: `string`; `order?`: `number`; `parentId?`: `string`; `translations?`: `Record`\<`string`, \{ `definition?`: `string`; `label?`: `string`; `note?`: `string`; \}\>; `updatedAt?`: `string`; \}, \{ `code?`: `string`; `createdAt?`: `string`; `createdBy?`: `string`; `definition?`: `string`; `deprecated?`: `boolean`; `id?`: `string`; `label?`: `string`; `lastModifiedBy?`: `string`; `note?`: `string`; `order?`: `number`; `parentId?`: `string`; `translations?`: `Record`\<`string`, \{ `definition?`: `string`; `label?`: `string`; `note?`: `string`; \}\>; `updatedAt?`: `string`; \}\>

Vocabulary Term Schema - Individual terms within a vocabulary
