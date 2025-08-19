import { z } from 'zod';
import { JobSchema } from './Job.zod';

/**
 * RDF Build Schema - Represents RDF generation jobs
 * This extends the base Job schema with RDF-specific fields
 */
export const RdfBuildSchema = JobSchema.extend({
  type: z.literal('rdf_build'),
  format: z.enum(['turtle', 'jsonld', 'ntriples', 'rdfxml']).optional(),
  vocabularyName: z.string().optional(),
  namespace: z.string().optional(),
  buildConfig: z
    .object({
      includeDeprecated: z.boolean().default(false),
      includeHistory: z.boolean().default(false),
      format: z
        .enum(['turtle', 'jsonld', 'ntriples', 'rdfxml'])
        .default('turtle'),
      compression: z.boolean().default(false),
    })
    .optional(),
});

export type RdfBuild = z.infer<typeof RdfBuildSchema>;

/**
 * Schema for creating a new RDF build job
 */
export const CreateRdfBuildSchema = z.object({
  namespaceId: z.string().min(1, 'Namespace ID is required'),
  vocabularyId: z.string().uuid('Invalid vocabulary ID').optional(),
  format: z.enum(['turtle', 'jsonld', 'ntriples', 'rdfxml']).default('turtle'),
  includeDeprecated: z.boolean().default(false),
  includeHistory: z.boolean().default(false),
  compression: z.boolean().default(false),
});

export type CreateRdfBuild = z.infer<typeof CreateRdfBuildSchema>;

/**
 * Schema for RDF build list response
 */
export const RdfBuildListSchema = z.object({
  data: z.array(RdfBuildSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type RdfBuildList = z.infer<typeof RdfBuildListSchema>;
