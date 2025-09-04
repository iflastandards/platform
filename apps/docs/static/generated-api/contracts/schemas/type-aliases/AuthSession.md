[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / AuthSession

# Type Alias: AuthSession

> **AuthSession** = `object`

## Type declaration

### sessionClaims?

> `optional` **sessionClaims**: `object`

#### sessionClaims.email?

> `optional` **email**: `string`

#### sessionClaims.publicMetadata?

> `optional` **publicMetadata**: `object` & `object`

##### Type declaration

###### githubId?

> `optional` **githubId**: `string`

###### githubUsername?

> `optional` **githubUsername**: `string`

###### isReviewGroupAdmin?

> `optional` **isReviewGroupAdmin**: `boolean`

###### reviewGroups?

> `optional` **reviewGroups**: `object`[] \| `object`[]

###### role?

> `optional` **role**: `"admin"` \| `"editor"` \| `"author"` \| `"translator"`

###### roles?

> `optional` **roles**: `string`[]

###### systemRole?

> `optional` **systemRole**: `"admin"` \| `"superadmin"`

###### teams?

> `optional` **teams**: `object`[]

###### totalActiveProjects?

> `optional` **totalActiveProjects**: `number`

###### translations?

> `optional` **translations**: `object`[]

### sessionId?

> `optional` **sessionId**: `string`

### userId?

> `optional` **userId**: `string`
