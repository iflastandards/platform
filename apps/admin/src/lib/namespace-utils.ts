import { promises as fs } from 'fs';
import path from 'path';

export interface NamespaceData {
  id: string;
  name: string;
  description: string;
  reviewGroup: string;
  visibility: 'public' | 'private';
  status: 'active' | 'inactive' | 'archived';
  conceptSchemes: number;
  elementSets: number;
  vocabularies: number;
  translations: string[];
  lastModified?: string;
  createdAt?: string;
}

async function countRdfFiles(namespacePath: string): Promise<{ elementSets: number; conceptSchemes: number; vocabularies: number }> {
  let elementSets = 0;
  let conceptSchemes = 0;
  let vocabularies = 0;

  try {
    // Check for RDF files in various formats
    const rdfPath = path.join(namespacePath, 'rdf');
    const formats = ['ttl', 'xml', 'jsonld', 'nt'];
    
    for (const format of formats) {
      const formatPath = path.join(rdfPath, format);
      
      try {
        // Check for namespace directory
        const nsPath = path.join(formatPath, 'ns');
        const nsExists = await fs.stat(nsPath).then(() => true).catch(() => false);
        
        if (nsExists) {
          const nsDirs = await fs.readdir(nsPath);
          for (const dir of nsDirs) {
            const dirPath = path.join(nsPath, dir);
            const stat = await fs.stat(dirPath);
            
            if (stat.isDirectory()) {
              const files = await fs.readdir(dirPath);
              
              // Count element files
              const elementFiles = files.filter(f => 
                f.includes('element') || f.includes('Element')
              );
              elementSets += elementFiles.length;
              
              // Check for terms directory (concept schemes)
              const termsPath = path.join(dirPath, 'terms');
              const termsExists = await fs.stat(termsPath).then(() => true).catch(() => false);
              
              if (termsExists) {
                const termFiles = await fs.readdir(termsPath);
                conceptSchemes += termFiles.filter(f => f.endsWith(`.${format}`)).length;
              }
              
              // Check for vocabularies
              const vocabFiles = files.filter(f => 
                (f.includes('vocab') || f.includes('Vocab')) && f.endsWith(`.${format}`)
              );
              vocabularies += vocabFiles.length;
            }
          }
        }
        
        // Also check root format directory for files
        const rootFiles = await fs.readdir(formatPath);
        const rdfFiles = rootFiles.filter(f => f.endsWith(`.${format}`) && f !== '.gitkeep');
        
        // Simple heuristic: files with 'concept' or 'scheme' in name are concept schemes
        conceptSchemes += rdfFiles.filter(f => 
          f.includes('concept') || f.includes('scheme') || f.includes('Concept') || f.includes('Scheme')
        ).length;
        
        // Files with 'element' in name are element sets
        elementSets += rdfFiles.filter(f => 
          f.includes('element') || f.includes('Element')
        ).length;
        
      } catch (err) {
        // Format directory doesn't exist, skip
      }
    }
    
    // If we found files in any format, don't count duplicates
    if (elementSets > 0 || conceptSchemes > 0 || vocabularies > 0) {
      // Divide by number of formats to avoid counting duplicates
      const formatCount = formats.filter(async format => {
        const formatPath = path.join(rdfPath, format);
        return await fs.stat(formatPath).then(() => true).catch(() => false);
      }).length || 1;
      
      // Keep the highest count (assuming same content in different formats)
      elementSets = Math.ceil(elementSets / formatCount);
      conceptSchemes = Math.ceil(conceptSchemes / formatCount);
      vocabularies = Math.ceil(vocabularies / formatCount);
    }
    
  } catch (err) {
    console.error(`Error counting RDF files for ${namespacePath}:`, err);
  }

  return { elementSets, conceptSchemes, vocabularies };
}

export async function getAllNamespacesData(): Promise<NamespaceData[]> {
  // Navigate to project root from admin app directory
  const projectRoot = path.resolve(process.cwd(), '../..');
  const standardsDir = path.join(projectRoot, 'standards');
  const namespaces: NamespaceData[] = [];
  
  try {
    const dirs = await fs.readdir(standardsDir);
    
    for (const dir of dirs) {
      // Skip hidden files and non-directories
      if (dir.startsWith('.')) continue;
      
      const namespacePath = path.join(standardsDir, dir);
      const stat = await fs.stat(namespacePath);
      
      if (stat.isDirectory()) {
        // Check if namespace.json exists
        const configPath = path.join(namespacePath, 'namespace.json');
        let config: any = {};
        
        try {
          const configData = await fs.readFile(configPath, 'utf8');
          config = JSON.parse(configData);
        } catch (err) {
          // If no namespace.json, use defaults
          config = {
            name: dir.toUpperCase(),
            description: `${dir} namespace`,
            reviewGroup: `${dir.toLowerCase()}-review-group`,
            visibility: 'public',
            status: 'active',
            languages: ['en'],
          };
        }
        
        // Count RDF files
        const { elementSets, conceptSchemes, vocabularies } = await countRdfFiles(namespacePath);
        
        // Get last modified date
        const lastModified = stat.mtime.toISOString();
        
        namespaces.push({
          id: dir,
          name: config.name || dir,
          description: config.description || '',
          reviewGroup: config.reviewGroup || 'default',
          visibility: config.visibility || 'public',
          status: config.status || 'active',
          conceptSchemes,
          elementSets,
          vocabularies,
          translations: config.languages || ['en'],
          lastModified,
          createdAt: config.created || stat.birthtime.toISOString(),
        });
      }
    }
  } catch (err) {
    console.error('Error reading namespaces:', err);
  }
  
  return namespaces;
}