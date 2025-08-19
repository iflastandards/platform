import { z } from 'zod';

/**
 * Central validation utility for enforcing runtime type safety
 *
 * RULE: Every adapter must validate incoming data with a corresponding Zod schema
 * before returning it. This guards against API drift, even for generated types.
 */

/**
 * Standard validation error that includes details about what failed
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodError,
    public readonly data: unknown,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Strict validation that throws on failure
 * Use this when you need guaranteed type safety
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string,
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(
      `Validation failed${context ? ` for ${context}` : ''}: ${result.error.message}`,
      result.error,
      data,
    );
  }

  return result.data;
}

/**
 * Safe validation that returns a result object
 * Use this when you want to handle errors gracefully
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): z.SafeParseReturnType<unknown, T> {
  return schema.safeParse(data);
}

/**
 * Validation wrapper for async operations
 * Ensures data is validated even from async sources
 */
export async function validateAsync<T>(
  schema: z.ZodSchema<T>,
  dataPromise: Promise<unknown>,
  context?: string,
): Promise<T> {
  const data = await dataPromise;
  return validateData(schema, data, context);
}

/**
 * Create a validated adapter function
 * This enforces validation on every call
 */
export function createValidatedAdapter<TInput, TOutput>(
  inputSchema: z.ZodSchema<TInput>,
  outputSchema: z.ZodSchema<TOutput>,
  adapter: (input: TInput) => TOutput | Promise<TOutput>,
) {
  return async (rawInput: unknown): Promise<TOutput> => {
    // Validate input
    const validInput = validateData(inputSchema, rawInput, 'adapter input');

    // Run adapter
    const rawOutput = await adapter(validInput);

    // Validate output
    return validateData(outputSchema, rawOutput, 'adapter output');
  };
}

/**
 * Batch validation for arrays of data
 * Returns both valid items and errors
 */
export function validateBatch<T>(
  schema: z.ZodSchema<T>,
  items: unknown[],
): {
  valid: T[];
  errors: Array<{ index: number; error: z.ZodError; data: unknown }>;
} {
  const valid: T[] = [];
  const errors: Array<{ index: number; error: z.ZodError; data: unknown }> = [];

  items.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({ index, error: result.error, data: item });
    }
  });

  return { valid, errors };
}

/**
 * Transform and validate data in one step
 * Useful for API responses that need transformation
 */
export function transformAndValidate<TInput, TOutput>(
  inputSchema: z.ZodSchema<TInput>,
  outputSchema: z.ZodSchema<TOutput>,
  transformer: (input: TInput) => TOutput,
  data: unknown,
  context?: string,
): TOutput {
  const validInput = validateData(inputSchema, data, `${context} input`);
  const transformed = transformer(validInput);
  return validateData(outputSchema, transformed, `${context} output`);
}

/**
 * Create a type guard function from a Zod schema
 */
export function createTypeGuard<T>(
  schema: z.ZodSchema<T>,
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    return schema.safeParse(value).success;
  };
}

/**
 * Validation middleware for API routes
 * Can be used with Next.js API routes or Express
 */
export function validationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (handler: (data: T) => unknown | Promise<unknown>) => {
    return async (req: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    }) => {
      const data = req.body ?? req.query ?? req.params;
      const validated = validateData(schema, data, 'request');
      return handler(validated);
    };
  };
}
