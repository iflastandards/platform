[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / validationMiddleware

# Function: validationMiddleware()

> **validationMiddleware**\<`T`\>(`schema`): (`handler`) => (`req`) => `Promise`\<`unknown`\>

Validation middleware for API routes
Can be used with Next.js API routes or Express

## Type Parameters

### T

`T`

## Parameters

### schema

`ZodType`\<`T`\>

## Returns

> (`handler`): (`req`) => `Promise`\<`unknown`\>

### Parameters

#### handler

(`data`) => `unknown`

### Returns

> (`req`): `Promise`\<`unknown`\>

#### Parameters

##### req

###### body?

`unknown`

###### params?

`unknown`

###### query?

`unknown`

#### Returns

`Promise`\<`unknown`\>
