[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / UserFixture

# Type Alias: UserFixture

> **UserFixture** = `object`

## Type declaration

### createdAt?

> `optional` **createdAt**: `number`

### email?

> `optional` **email**: `string`

### firstName?

> `optional` **firstName**: `string`

### fullName?

> `optional` **fullName**: `string`

### id?

> `optional` **id**: `string`

### lastName?

> `optional` **lastName**: `string`

### privateMetadata?

> `optional` **privateMetadata**: `object` = `UserPrivateMetadataSchema`

#### privateMetadata.accessibleNamespaces?

> `optional` **accessibleNamespaces**: `string`[]

#### privateMetadata.lastGitHubSync?

> `optional` **lastGitHubSync**: `string`

#### privateMetadata.projects?

> `optional` **projects**: `Record`\<`string`, \{ `namespaces?`: `string`[]; `number?`: `number`; `role?`: `"editor"` \| `"lead"` \| `"reviewer"` \| `"translator"`; `sourceTeam?`: `string`; `title?`: `string`; \}\>

### publicMetadata?

> `optional` **publicMetadata**: `object` & `object` = `UserPublicMetadataSchema`

#### Type declaration

##### githubId?

> `optional` **githubId**: `string`

##### githubUsername?

> `optional` **githubUsername**: `string`

##### isReviewGroupAdmin?

> `optional` **isReviewGroupAdmin**: `boolean`

##### reviewGroups?

> `optional` **reviewGroups**: `object`[] \| `object`[]

##### role?

> `optional` **role**: `"admin"` \| `"editor"` \| `"author"` \| `"translator"`

##### roles?

> `optional` **roles**: `string`[]

##### systemRole?

> `optional` **systemRole**: `"admin"` \| `"superadmin"`

##### teams?

> `optional` **teams**: `object`[]

##### totalActiveProjects?

> `optional` **totalActiveProjects**: `number`

##### translations?

> `optional` **translations**: `object`[]

### updatedAt?

> `optional` **updatedAt**: `number`
