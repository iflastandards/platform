/**
 * @integration @performance @stress @api @validation @high-priority
 * 
 * Performance tests for large-scale batch processing
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

describe('Performance Testing @integration @performance', () => {
  const perfTestDir = '/tmp/perf-test-' + Date.now();
  const testFileCounts = [10, 50, 100, 500];

  beforeAll(() => {
    fs.mkdirSync(perfTestDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(perfTestDir)) {
      fs.rmSync(perfTestDir, { recursive: true, force: true });
    }
  });

  describe('Batch Processing Performance', () => {
    testFileCounts.forEach(count => {
      it(`should efficiently process ${count} files`, async () => {
        const files: string[] = [];
        const subDir = path.join(perfTestDir, `batch-${count}`);
        fs.mkdirSync(subDir, { recursive: true });

        // Create test files
        for (let i = 0; i < count; i++) {
          const file = path.join(subDir, `test-${i}.test.ts`);
          const complexity = i % 3; // Vary complexity
          
          let content = '';
          switch (complexity) {
            case 0: // Simple unit test
              content = `
describe('Simple ${i}', () => {
  it('test ${i}', () => {
    expect(true).toBe(true);
  });
});`;
              break;
            case 1: // Integration test
              content = `
import { setupServer } from 'msw/node';
describe('Integration ${i}', () => {
  const server = setupServer();
  beforeAll(() => server.listen());
  it('test ${i}', async () => {
    await fetch('/api/data');
  });
});`;
              break;
            case 2: // Complex test
              content = `
import { render } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
describe('Complex ${i}', () => {
  it('renders with data', async () => {
    const client = new QueryClient();
    render(<Component />);
  });
  it('validates form', () => {
    validateForm(data);
  });
  it('handles errors', () => {
    expect(() => throwError()).toThrow();
  });
});`;
              break;
          }
          
          fs.writeFileSync(file, content);
          files.push(file);
        }

        const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
        const tagger = new EnhancedTestTagger({
          provider: 'local',
          batchSize: Math.min(20, Math.ceil(count / 5)),
          dryRun: true,
          verbose: false
        });

        const startTime = performance.now();
        const results = await tagger['processFiles'](files);
        const duration = performance.now() - startTime;

        expect(results).toHaveLength(count);
        
        // Performance expectations (with local provider)
        const expectedMaxDuration = count * 50; // 50ms per file max
        expect(duration).toBeLessThan(expectedMaxDuration);
        
        // Log performance metrics
        const avgTimePerFile = duration / count;
        console.log(`Processed ${count} files in ${duration.toFixed(2)}ms (${avgTimePerFile.toFixed(2)}ms per file)`);
        
        // Verify memory usage is reasonable
        const memUsage = process.memoryUsage();
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        expect(heapUsedMB).toBeLessThan(500); // Should not exceed 500MB
      });
    });

    it('should optimize batch sizes based on file count', async () => {
      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      
      const testCases = [
        { fileCount: 5, expectedBatch: 5 },
        { fileCount: 20, expectedBatch: 10 },
        { fileCount: 100, expectedBatch: 20 },
        { fileCount: 1000, expectedBatch: 50 }
      ];

      testCases.forEach(({ fileCount, expectedBatch }) => {
        const tagger = new EnhancedTestTagger({
          provider: 'local',
          autoBatchSize: true
        });
        
        const batchSize = tagger['calculateOptimalBatchSize'](fileCount);
        expect(batchSize).toBeLessThanOrEqual(expectedBatch);
        expect(batchSize).toBeGreaterThan(0);
      });
    });
  });

  describe('Concurrent Processing', () => {
    it('should process batches concurrently', async () => {
      const batchCount = 5;
      const filesPerBatch = 10;
      const batches: string[][] = [];

      // Create batches of files
      for (let b = 0; b < batchCount; b++) {
        const batch: string[] = [];
        const batchDir = path.join(perfTestDir, `concurrent-batch-${b}`);
        fs.mkdirSync(batchDir, { recursive: true });
        
        for (let f = 0; f < filesPerBatch; f++) {
          const file = path.join(batchDir, `test-${f}.test.ts`);
          fs.writeFileSync(file, `
describe('Batch ${b} Test ${f}', () => {
  it('test', () => {});
});`);
          batch.push(file);
        }
        batches.push(batch);
      }

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        concurrency: 3,
        dryRun: true
      });

      const startTime = performance.now();
      
      // Process batches concurrently
      const promises = batches.map(batch => 
        tagger['processFiles'](batch)
      );
      
      const results = await Promise.all(promises);
      const duration = performance.now() - startTime;

      // Verify all batches processed
      expect(results).toHaveLength(batchCount);
      results.forEach(batchResult => {
        expect(batchResult).toHaveLength(filesPerBatch);
      });

      // Should be faster than sequential processing
      const sequentialEstimate = batchCount * filesPerBatch * 30; // 30ms per file sequential
      expect(duration).toBeLessThan(sequentialEstimate * 0.5); // At least 2x faster
      
      console.log(`Concurrent processing: ${duration.toFixed(2)}ms for ${batchCount} batches`);
    });

    it('should limit concurrent API calls', async () => {
      const files: string[] = [];
      const fileCount = 20;
      
      for (let i = 0; i < fileCount; i++) {
        const file = path.join(perfTestDir, `api-limit-${i}.test.ts`);
        fs.writeFileSync(file, `
describe('API ${i}', () => {
  it('test', () => {});
});`);
        files.push(file);
      }

      let concurrentCalls = 0;
      let maxConcurrent = 0;

      // Mock API with concurrency tracking
      vi.mocked(global.fetch).mockImplementation(async () => {
        concurrentCalls++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCalls);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        concurrentCalls--;
        
        return {
          ok: true,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    tags: ['@unit'],
                    confidence: 0.9,
                    reasoning: 'Test'
                  })
                }]
              }
            }]
          }),
          statusText: 'OK'
        } as Response;
      });

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'gemini',
        apiKey: 'test-key',
        maxConcurrentAPICalls: 3,
        dryRun: true
      });

      await tagger['processFiles'](files);
      
      // Should respect concurrency limit
      expect(maxConcurrent).toBeLessThanOrEqual(3);
      console.log(`Max concurrent API calls: ${maxConcurrent}`);
    });
  });

  describe('Memory Management', () => {
    it('should handle large files without memory leaks', async () => {
      const largeFile = path.join(perfTestDir, 'large.test.ts');
      
      // Create a large test file (1MB+)
      const testCount = 1000;
      let content = '/* Large test file */\n\n';
      
      for (let i = 0; i < testCount; i++) {
        content += `
describe('Test Suite ${i}', () => {
  it('test ${i}-1', () => {
    const data = Array(100).fill('x'.repeat(10));
    expect(data.length).toBe(100);
  });
  it('test ${i}-2', async () => {
    const response = await fetch('/api/endpoint-${i}');
    expect(response.ok).toBe(true);
  });
  it('test ${i}-3', () => {
    const validation = validateComplexData({ id: ${i}, data: 'test' });
    expect(validation).toBe(true);
  });
});\n`;
      }
      
      fs.writeFileSync(largeFile, content);
      
      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        dryRun: true
      });

      // Record initial memory
      global.gc && global.gc(); // Force GC if available
      const memBefore = process.memoryUsage().heapUsed;

      // Process large file
      await tagger['analyzeFile'](largeFile);

      // Force cleanup
      global.gc && global.gc();
      const memAfter = process.memoryUsage().heapUsed;

      // Memory increase should be reasonable
      const memIncreaseMB = (memAfter - memBefore) / 1024 / 1024;
      expect(memIncreaseMB).toBeLessThan(50); // Less than 50MB increase
      
      console.log(`Memory increase for large file: ${memIncreaseMB.toFixed(2)}MB`);
    });

    it('should stream process very large projects', async () => {
      const streamDir = path.join(perfTestDir, 'stream-test');
      fs.mkdirSync(streamDir, { recursive: true });
      
      // Create directory structure with many files
      const dirCount = 10;
      const filesPerDir = 50;
      const allFiles: string[] = [];
      
      for (let d = 0; d < dirCount; d++) {
        const dir = path.join(streamDir, `module-${d}`);
        fs.mkdirSync(dir, { recursive: true });
        
        for (let f = 0; f < filesPerDir; f++) {
          const file = path.join(dir, `test-${f}.test.ts`);
          fs.writeFileSync(file, `
describe('Module ${d} Test ${f}', () => {
  it('test', () => {});
});`);
          allFiles.push(file);
        }
      }

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        streamMode: true,
        batchSize: 50,
        dryRun: true
      });

      const startMem = process.memoryUsage().heapUsed;
      const results: any[] = [];
      
      // Process in streaming fashion
      for (let i = 0; i < allFiles.length; i += 50) {
        const batch = allFiles.slice(i, i + 50);
        const batchResults = await tagger['processFiles'](batch);
        results.push(...batchResults);
        
        // Allow GC between batches
        if (global.gc) {global.gc();}
      }

      const endMem = process.memoryUsage().heapUsed;
      const memUsedMB = (endMem - startMem) / 1024 / 1024;
      
      expect(results).toHaveLength(allFiles.length);
      expect(memUsedMB).toBeLessThan(100); // Should use less than 100MB
      
      console.log(`Streamed ${allFiles.length} files using ${memUsedMB.toFixed(2)}MB`);
    });
  });

  describe('Caching and Optimization', () => {
    it('should cache analysis results effectively', async () => {
      const cacheTestFile = path.join(perfTestDir, 'cache-test.test.ts');
      fs.writeFileSync(cacheTestFile, `
describe('Cache Test', () => {
  it('should cache', () => {});
});`);

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        enableCache: true,
        dryRun: true
      });

      // First analysis
      const start1 = performance.now();
      const result1 = await tagger['analyzeFile'](cacheTestFile);
      const time1 = performance.now() - start1;

      // Second analysis (should use cache)
      const start2 = performance.now();
      const result2 = await tagger['analyzeFile'](cacheTestFile);
      const time2 = performance.now() - start2;

      expect(result1.suggestedTags).toEqual(result2.suggestedTags);
      expect(time2).toBeLessThan(time1 * 0.1); // Cache should be 10x faster
      
      console.log(`Cache performance: ${time1.toFixed(2)}ms vs ${time2.toFixed(2)}ms`);
    });

    it('should optimize pattern matching', async () => {
      const patterns = [
        { pattern: /describe\s*\(/g, name: 'describe blocks' },
        { pattern: /it\s*\(/g, name: 'test cases' },
        { pattern: /import.*msw/g, name: 'MSW imports' },
        { pattern: /fetch|axios|api/gi, name: 'API calls' },
        { pattern: /@testing-library/g, name: 'Testing library' }
      ];

      const testContent = `
import { setupServer } from 'msw/node';
import { render } from '@testing-library/react';

describe('Performance test', () => {
  it('test 1', () => {});
  it('test 2', () => {});
  it('test 3', () => {});
});`.repeat(100); // Repeat for larger content

      const start = performance.now();
      
      const matches: Record<string, number> = {};
      patterns.forEach(({ pattern, name }) => {
        const matchArray = testContent.match(pattern);
        matches[name] = matchArray ? matchArray.length : 0;
      });
      
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50); // Pattern matching should be fast
      expect(matches['describe blocks']).toBeGreaterThan(0);
      expect(matches['test cases']).toBeGreaterThan(0);
      
      console.log(`Pattern matching completed in ${duration.toFixed(2)}ms`);
    });
  });
});