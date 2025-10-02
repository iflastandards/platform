[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / RdfBuild

# Type Alias: RdfBuild

> **RdfBuild** = `object`

RDF Build Schema - Represents RDF generation jobs
This extends the base Job schema with RDF-specific fields

## Type declaration

### buildConfig?

> `optional` **buildConfig**: `object`

#### buildConfig.compression?

> `optional` **compression**: `boolean`

#### buildConfig.format?

> `optional` **format**: `"turtle"` \| `"jsonld"` \| `"ntriples"` \| `"rdfxml"`

#### buildConfig.includeDeprecated?

> `optional` **includeDeprecated**: `boolean`

#### buildConfig.includeHistory?

> `optional` **includeHistory**: `boolean`

### createdAt?

> `optional` **createdAt**: `string`

### error?

> `optional` **error**: `string`

### finishedAt?

> `optional` **finishedAt**: `string`

### format?

> `optional` **format**: `"turtle"` \| `"jsonld"` \| `"ntriples"` \| `"rdfxml"`

### id?

> `optional` **id**: `string`

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

### namespace?

> `optional` **namespace**: `string`

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

> `optional` **type**: `"rdf_build"`

### updatedAt?

> `optional` **updatedAt**: `string`

### userId?

> `optional` **userId**: `string`

### vocabularyId?

> `optional` **vocabularyId**: `string`

### vocabularyName?

> `optional` **vocabularyName**: `string`
