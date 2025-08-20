[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / VocabularyImportSchema

# Variable: VocabularyImportSchema

> `const` **VocabularyImportSchema**: `ZodObject`\<\{ `mapping`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>; `options`: `ZodOptional`\<`ZodObject`\<\{ `overwrite`: `ZodDefault`\<`ZodBoolean`\>; `preserveOrder`: `ZodDefault`\<`ZodBoolean`\>; `validateTerms`: `ZodDefault`\<`ZodBoolean`\>; \}, `"strip"`, `ZodTypeAny`, \{ `overwrite?`: `boolean`; `preserveOrder?`: `boolean`; `validateTerms?`: `boolean`; \}, \{ `overwrite?`: `boolean`; `preserveOrder?`: `boolean`; `validateTerms?`: `boolean`; \}\>\>; `source`: `ZodEnum`\<\[`"google_sheets"`, `"csv"`, `"rdf"`, `"json"`\]\>; `sourceUrl`: `ZodOptional`\<`ZodString`\>; `vocabularyId`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `mapping?`: `Record`\<`string`, `string`\>; `options?`: \{ `overwrite?`: `boolean`; `preserveOrder?`: `boolean`; `validateTerms?`: `boolean`; \}; `source?`: `"google_sheets"` \| `"csv"` \| `"rdf"` \| `"json"`; `sourceUrl?`: `string`; `vocabularyId?`: `string`; \}, \{ `mapping?`: `Record`\<`string`, `string`\>; `options?`: \{ `overwrite?`: `boolean`; `preserveOrder?`: `boolean`; `validateTerms?`: `boolean`; \}; `source?`: `"google_sheets"` \| `"csv"` \| `"rdf"` \| `"json"`; `sourceUrl?`: `string`; `vocabularyId?`: `string`; \}\>

Schema for vocabulary import/export operations
