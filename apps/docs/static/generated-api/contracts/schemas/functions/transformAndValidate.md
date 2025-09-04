[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / transformAndValidate

# Function: transformAndValidate()

> **transformAndValidate**\<`TInput`, `TOutput`\>(`inputSchema`, `outputSchema`, `transformer`, `data`, `context?`): `TOutput`

Transform and validate data in one step
Useful for API responses that need transformation

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

### transformer

(`input`) => `TOutput`

### data

`unknown`

### context?

`string`

## Returns

`TOutput`
