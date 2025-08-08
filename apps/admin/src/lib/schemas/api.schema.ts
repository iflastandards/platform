import { z } from 'zod';

/**
 * Zod schemas for API request/response validation
 */

// Pagination metadata
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

// Cache metadata
export const CacheMetaSchema = z.object({
  cached: z.boolean(),
  cachedAt: z.string().datetime().optional(),
  ttl: z.number().int().positive().optional(),
});

// Success response
export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        pagination: PaginationMetaSchema.optional(),
        cache: CacheMetaSchema.optional(),
      })
      .optional(),
  });

// Error details
export const ErrorDetailsSchema = z.record(z.string(), z.any());

// Error response
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: ErrorDetailsSchema.optional(),
  }),
});

// API Response union
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.union([SuccessResponseSchema(dataSchema), ErrorResponseSchema]);

// Common error codes
export const ErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'BAD_REQUEST',
  'VALIDATION_ERROR',
  'INTERNAL_ERROR',
  'RATE_LIMITED',
  'SERVICE_UNAVAILABLE',
]);

// Type exports
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type CacheMeta = z.infer<typeof CacheMetaSchema>;
export type ErrorDetails = z.infer<typeof ErrorDetailsSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

// Generic success response type
export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    cache?: CacheMeta;
  };
};

// Generic API response type
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Pagination request parameters
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

// Common query filters
export const CommonFiltersSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.string().optional(),
});

export type CommonFilters = z.infer<typeof CommonFiltersSchema>;