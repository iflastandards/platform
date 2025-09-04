[**platform**](../../../README.md)

***

[platform](../../../README.md) / [contracts/schemas](../README.md) / ValidationError

# Class: ValidationError

Standard validation error that includes details about what failed

## Extends

- `Error`

## Constructors

### Constructor

> **new ValidationError**(`message`, `errors`, `data`): `ValidationError`

#### Parameters

##### message

`string`

##### errors

`ZodError`

##### data

`unknown`

#### Returns

`ValidationError`

#### Overrides

`Error.constructor`

## Properties

### data

> `readonly` **data**: `unknown`

***

### errors

> `readonly` **errors**: `ZodError`
