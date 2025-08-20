[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / JobUpdateSchema

# Variable: JobUpdateSchema

> `const` **JobUpdateSchema**: `ZodObject`\<\{ `error`: `ZodOptional`\<`ZodOptional`\<`ZodString`\>\>; `finishedAt`: `ZodOptional`\<`ZodOptional`\<`ZodString`\>\>; `outputUrl`: `ZodOptional`\<`ZodOptional`\<`ZodString`\>\>; `progress`: `ZodOptional`\<`ZodDefault`\<`ZodNumber`\>\>; `status`: `ZodOptional`\<`ZodEnum`\<\[`"queued"`, `"running"`, `"success"`, `"failed"`, `"cancelled"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `error?`: `string`; `finishedAt?`: `string`; `outputUrl?`: `string`; `progress?`: `number`; `status?`: `"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"`; \}, \{ `error?`: `string`; `finishedAt?`: `string`; `outputUrl?`: `string`; `progress?`: `number`; `status?`: `"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"`; \}\>

Schema for updating job status (internal use)
