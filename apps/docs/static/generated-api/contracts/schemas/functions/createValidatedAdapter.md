[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / createValidatedAdapter

# Function: createValidatedAdapter()

> **createValidatedAdapter**\<`TInput`, `TOutput`\>(`inputSchema`, `outputSchema`, `adapter`): (`rawInput`) => `Promise`\<`TOutput`\>

Create a validated adapter function
This enforces validation on every call

## Type Parameters

### TInput

`TInput`

### TOutput

`TOutput`

## Parameters

### inputSchema

`ZodType`\<`TInput`\>

### outputSchema

`ZodType`\<`TOutput`\>

### adapter

(`input`) => `TOutput` \| `Promise`\<`TOutput`\>

## Returns

> (`rawInput`): `Promise`\<`TOutput`\>

### Parameters

#### rawInput

`unknown`

### Returns

`Promise`\<`TOutput`\>
