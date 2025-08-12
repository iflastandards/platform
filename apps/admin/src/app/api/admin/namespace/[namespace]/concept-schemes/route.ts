import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /api/admin/namespace/[namespace]/concept-schemes
 * Get concept schemes for a namespace
 */
export const GET = withAuth(async (
  _req: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>> | Record<string, string> }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { namespace } = resolvedParams;
    
    // Read site-config.json for the namespace
    // Navigate to project root from admin app directory
    const projectRoot = path.resolve(process.cwd(), '../..');
    const siteConfigPath = path.join(projectRoot, 'standards', namespace, 'site-config.json');
    let conceptSchemes = [];
    
    try {
      const configContent = await fs.readFile(siteConfigPath, 'utf8');
      const siteConfig = JSON.parse(configContent);
      
      // Extract concept schemes from the site configuration
      if (siteConfig.conceptSchemes) {
        conceptSchemes = siteConfig.conceptSchemes.map((cs: any) => ({
          id: cs.id || `cs_${namespace}_${Math.random().toString(36).substr(2, 9)}`,
          name: cs.title || cs.name || 'Unnamed Concept Scheme',
          description: cs.description || '',
          namespace,
          status: cs.status || 'published',
          version: cs.version || '1.0.0',
          concepts: cs.conceptCount || 0,
        }));
      } else if (siteConfig.vocabularies) {
        // Some namespaces might use 'vocabularies' instead
        conceptSchemes = siteConfig.vocabularies.map((vocab: any) => ({
          id: vocab.id || `vocab_${namespace}_${Math.random().toString(36).substr(2, 9)}`,
          name: vocab.title || vocab.name || 'Unnamed Vocabulary',
          description: vocab.description || '',
          namespace,
          status: vocab.status || 'published',
          version: vocab.version || '1.0.0',
          concepts: vocab.termCount || vocab.conceptCount || 0,
        }));
      }
    } catch (err) {
      // If no site-config.json or error reading it, return empty array
      console.log(`No site-config.json found for namespace ${namespace}`);
    }

    return NextResponse.json({
      success: true,
      data: conceptSchemes,
      meta: {
        total: conceptSchemes.length,
        namespace,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching concept schemes:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch concept schemes',
        },
      },
      { status: 500 }
    );
  }
});