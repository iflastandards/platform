#!/usr/bin/env node

/**
 * File Extractors Module
 * Identifies script relationships and package.json references
 * Converted to TypeScript from scripts/script-inventory/lib/extractors.js
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { PackageJsonScript } from '../types';

export interface FileInfo {
  absolutePath: string;
  relativePath: string;
  directory: string;
  fileName: string;
  extension: string;
  size: number;
  created: Date;
  modified: Date;
  hash: string;
  lineCount: number;
  isSymlink: boolean;
  permissions: string;
}

export interface PackageJsonReference {
  scriptName: string;
  command: string;
  packageJsonPath: string;
  projectName: string;
  isDirectReference: boolean;
  matchType: 'exact' | 'partial' | 'indirect';
}

export class FileExtractor {
  private packageJsonCache = new Map<string, any>();

  constructor(private rootDir: string = process.cwd()) {}

  /**
   * Extract comprehensive file information
   */
  async extractFileInfo(filePath: string): Promise<FileInfo> {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.rootDir, filePath);

    const stats = await fs.stat(absolutePath);
    const content = await fs.readFile(absolutePath, 'utf-8');

    return {
      absolutePath,
      relativePath: path.relative(this.rootDir, absolutePath),
      directory: path.dirname(absolutePath),
      fileName: path.basename(absolutePath),
      extension: path.extname(absolutePath),
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      hash: this.calculateHash(content),
      lineCount: content.split('\n').length,
      isSymlink: stats.isSymbolicLink(),
      permissions: this.formatPermissions(stats.mode),
    };
  }

  /**
   * Find package.json references to this script
   */
  async findPackageJsonReferences(scriptPath: string): Promise<PackageJsonReference[]> {
    const references: PackageJsonReference[] = [];
    const normalizedPath = this.normalizePath(scriptPath);
    
    // Find all package.json files
    const packageJsonFiles = await this.findPackageJsonFiles();

    for (const packagePath of packageJsonFiles) {
      const packageData = await this.loadPackageJson(packagePath);
      
      if (packageData.scripts) {
        for (const [scriptName, command] of Object.entries(packageData.scripts)) {
          const commandStr = command as string;
          
          // Check for direct and indirect references
          const matchType = this.getMatchType(commandStr, normalizedPath);
          if (matchType) {
            references.push({
              scriptName,
              command: commandStr,
              packageJsonPath: packagePath,
              projectName: packageData.name || 'unknown',
              isDirectReference: matchType === 'exact',
              matchType,
            });
          }
        }
      }
    }

    return references;
  }

  /**
   * Extract import/require dependencies from file
   */
  async extractDependencies(filePath: string): Promise<string[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const dependencies = new Set<string>();

    // JavaScript/TypeScript import patterns
    const importPatterns = [
      /import\s+.*?from\s+['""]([^'""\s]+)['"]/g,
      /import\s*\(\s*['""]([^'""\s]+)['"]\s*\)/g,
      /require\s*\(\s*['""]([^'""\s]+)['"]\s*\)/g,
      /await\s+import\s*\(\s*['""]([^'""\s]+)['"]\s*\)/g,
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const dependency = match[1];
        if (!this.isRelativeImport(dependency)) {
          dependencies.add(dependency);
        }
      }
    }

    // Python import patterns (if applicable)
    if (path.extname(filePath) === '.py') {
      const pythonPatterns = [
        /^import\s+([^\s,]+)/gm,
        /^from\s+([^\s]+)\s+import/gm,
      ];

      for (const pattern of pythonPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          dependencies.add(match[1]);
        }
      }
    }

    return Array.from(dependencies);
  }

  /**
   * Find all package.json files in the project
   */
  private async findPackageJsonFiles(): Promise<string[]> {
    const packageFiles: string[] = [];
    
    const searchDir = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isFile() && entry.name === 'package.json') {
            packageFiles.push(fullPath);
          } else if (entry.isDirectory() && 
                    !entry.name.startsWith('.') && 
                    entry.name !== 'node_modules' &&
                    entry.name !== 'dist' &&
                    entry.name !== 'build') {
            await searchDir(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await searchDir(this.rootDir);
    return packageFiles;
  }

  /**
   * Load and cache package.json data
   */
  private async loadPackageJson(packagePath: string): Promise<any> {
    if (this.packageJsonCache.has(packagePath)) {
      return this.packageJsonCache.get(packagePath);
    }

    try {
      const content = await fs.readFile(packagePath, 'utf-8');
      const data = JSON.parse(content);
      this.packageJsonCache.set(packagePath, data);
      return data;
    } catch (error) {
      return {};
    }
  }

  /**
   * Determine how the script is referenced in the command
   */
  private getMatchType(command: string, scriptPath: string): 'exact' | 'partial' | 'indirect' | null {
    const normalizedCommand = command.toLowerCase();
    const normalizedScript = scriptPath.toLowerCase();

    // Exact match
    if (normalizedCommand.includes(normalizedScript)) {
      return 'exact';
    }

    // Partial match (just filename)
    const scriptName = path.basename(scriptPath);
    if (normalizedCommand.includes(scriptName.toLowerCase())) {
      return 'partial';
    }

    // Indirect match (script directory)
    const scriptDir = path.dirname(scriptPath);
    if (scriptDir !== '.' && normalizedCommand.includes(scriptDir)) {
      return 'indirect';
    }

    return null;
  }

  /**
   * Normalize path for comparison
   */
  private normalizePath(filePath: string): string {
    return path.relative(this.rootDir, filePath)
      .replace(/\\/g, '/')
      .toLowerCase();
  }

  /**
   * Check if import is relative (starts with . or ..)
   */
  private isRelativeImport(dependency: string): boolean {
    return dependency.startsWith('.') || dependency.startsWith('/');
  }

  /**
   * Calculate SHA256 hash of content
   */
  private calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Format file permissions as octal string
   */
  private formatPermissions(mode: number): string {
    return '0' + (mode & parseInt('777', 8)).toString(8);
  }
}

// Export default instance
export const fileExtractor = new FileExtractor();