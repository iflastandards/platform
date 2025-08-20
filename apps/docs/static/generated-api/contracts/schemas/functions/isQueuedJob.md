[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / isQueuedJob

# Function: isQueuedJob()

> **isQueuedJob**(`job`): job is \{ createdAt?: string; error?: string; finishedAt?: string; id?: string; metadata?: Record\<string, unknown\>; namespaceId?: string; outputUrl?: string; progress?: number; standardId?: string; status?: "queued" \| "running" \| "success" \| "failed" \| "cancelled"; type?: "rdf\_build" \| "csv\_to\_rdf" \| "validate\_rdf" \| "translation\_sync" \| "vocabulary\_import" \| "export\_rdf" \| "validate\_terms" \| "generate\_docs"; updatedAt?: string; userId?: string; vocabularyId?: string \} & \{ status: "queued" \}

## Parameters

### job

#### createdAt?

`string` = `...`

#### error?

`string` = `...`

#### finishedAt?

`string` = `...`

#### id?

`string` = `...`

#### metadata?

`Record`\<`string`, `unknown`\> = `...`

#### namespaceId?

`string` = `...`

#### outputUrl?

`string` = `...`

#### progress?

`number` = `...`

#### standardId?

`string` = `...`

#### status?

`"queued"` \| `"running"` \| `"success"` \| `"failed"` \| `"cancelled"` = `...`

#### type?

`"rdf_build"` \| `"csv_to_rdf"` \| `"validate_rdf"` \| `"translation_sync"` \| `"vocabulary_import"` \| `"export_rdf"` \| `"validate_terms"` \| `"generate_docs"` = `...`

#### updatedAt?

`string` = `...`

#### userId?

`string` = `...`

#### vocabularyId?

`string` = `...`

## Returns

job is \{ createdAt?: string; error?: string; finishedAt?: string; id?: string; metadata?: Record\<string, unknown\>; namespaceId?: string; outputUrl?: string; progress?: number; standardId?: string; status?: "queued" \| "running" \| "success" \| "failed" \| "cancelled"; type?: "rdf\_build" \| "csv\_to\_rdf" \| "validate\_rdf" \| "translation\_sync" \| "vocabulary\_import" \| "export\_rdf" \| "validate\_terms" \| "generate\_docs"; updatedAt?: string; userId?: string; vocabularyId?: string \} & \{ status: "queued" \}
