[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / AppUser

# Type Alias: AppUser

> **AppUser** = `object`

## Type declaration

### accessibleNamespaces?

> `optional` **accessibleNamespaces**: `string`[]

### email?

> `optional` **email**: `string`

### githubUsername?

> `optional` **githubUsername**: `string`

### id?

> `optional` **id**: `string`

### isReviewGroupAdmin?

> `optional` **isReviewGroupAdmin**: `boolean`

### name?

> `optional` **name**: `string`

### projects?

> `optional` **projects**: `Record`\<`string`, \{ `namespaces?`: `string`[]; `number?`: `number`; `role?`: `"editor"` \| `"lead"` \| `"reviewer"` \| `"translator"`; `sourceTeam?`: `string`; `title?`: `string`; \}\>

### reviewGroups?

> `optional` **reviewGroups**: `object`[]

### roles?

> `optional` **roles**: `string`[]

### systemRole?

> `optional` **systemRole**: `"admin"`
