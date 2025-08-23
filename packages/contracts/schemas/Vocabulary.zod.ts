import { z } from 'zod';

/**
 * Vocabulary Term Schema - Individual terms within a vocabulary
 */
export const VocabularyTermSchema = z.object({
  id: z.string().uuid('Invalid term ID format'),
  code: z.string().min(1, 'Term code is required'),
  label: z.string().min(1, 'Term label is required'),
  definition: z.string().optional(),
  note: z.string().optional(),
  deprecated: z.boolean().default(false),
  parentId: z.string().uuid().optional(),
  order: z.number().int().min(0).default(0),
  
  // Multilingual support
  translations: z.record(z.object({
    label: z.string(),
    definition: z.string().optional(),
    note: z.string().optional(),
  })).optional(),
  
  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().optional(),
  lastModifiedBy: z.string().optional(),
});

/**
 * Vocabulary Schema - Collection of terms for a specific domain/standard
 */
export const VocabularySchema = z.object({
  id: z.string().uuid('Invalid vocabulary ID format'),
  name: z.string().min(1, 'Vocabulary name is required'),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must follow semver format'),
  standardId: z.string().min(1, 'Standard ID is required'),
  namespace: z.string().url('Invalid namespace URL').optional(),
  
  // Status and publishing
  status: z.enum(['draft', 'review', 'published', 'deprecated'], {
    errorMap: () => ({ message: 'Invalid vocabulary status' }),
  }),
  publishedAt: z.string().datetime().optional(),
  
  // Schema and validation
  schemaUrl: z.string().url().optional(),
  validationRules: z.record(z.unknown()).optional(),
  
  // Integration settings
  googleSheetId: z.string().optional(),
  syncEnabled: z.boolean().default(false),
  lastSyncAt: z.string().datetime().optional(),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().optional(),
  lastModifiedBy: z.string().optional(),
  
  // Relations
  terms: z.array(VocabularyTermSchema).optional(),
  termCount: z.number().int().min(0).default(0),
});

/**
 * Schema for creating new vocabularies
 */
export const VocabularyCreateSchema = VocabularySchema.pick({
  name: true,
  description: true,
  standardId: true,
  namespace: true,
  tags: true,
}).extend({
  // Auto-generated fields handled by system
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('0.1.0'),
  status: z.enum(['draft']).default('draft'),
});

/**
 * Schema for updating vocabularies
 */
export const VocabularyUpdateSchema = VocabularySchema.pick({
  name: true,
  description: true,
  version: true,
  status: true,
  namespace: true,
  tags: true,
  syncEnabled: true,
  googleSheetId: true,
}).partial();

/**
 * Schema for vocabulary import/export operations
 */
export const VocabularyImportSchema = z.object({
  vocabularyId: z.string().uuid(),
  source: z.enum(['google_sheets', 'csv', 'rdf', 'json']),
  sourceUrl: z.string().url().optional(),
  mapping: z.record(z.string()).optional(), // Field mapping configuration
  options: z.object({
    overwrite: z.boolean().default(false),
    validateTerms: z.boolean().default(true),
    preserveOrder: z.boolean().default(true),
  }).optional(),
});

/**
 * Schema for vocabulary search and filtering
 */
export const VocabularyQuerySchema = z.object({
  standardId: z.string().optional(),
  status: z.enum(['draft', 'review', 'published', 'deprecated']).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(), // Text search in name/description
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'version']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeTerm: z.boolean().default(false), // Include terms in response
});

// Type exports
export type Vocabulary = z.infer<typeof VocabularySchema>;
export type VocabularyTerm = z.infer<typeof VocabularyTermSchema>;
export type VocabularyCreate = z.infer<typeof VocabularyCreateSchema>;
export type VocabularyUpdate = z.infer<typeof VocabularyUpdateSchema>;
export type VocabularyImport = z.infer<typeof VocabularyImportSchema>;
export type VocabularyQuery = z.infer<typeof VocabularyQuerySchema>;

// Status type guards
export const isPublishedVocabulary = (vocab: Vocabulary): vocab is Vocabulary & { status: 'published' } => vocab.status === 'published';

export const isDraftVocabulary = (vocab: Vocabulary): vocab is Vocabulary & { status: 'draft' } => vocab.status === 'draft';

export const hasSyncEnabled = (vocab: Vocabulary): vocab is Vocabulary & { syncEnabled: true } => vocab.syncEnabled === true;
