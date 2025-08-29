/**
 * @unit @testing @ai @api
 * @ai-reviewed by:test-suite on:2024-01-15 tags:[@unit,@testing,@ai,@api]
 * 
 * Tests for AI provider integration and fallback logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnhancedTestTagger } from '../auto-tag-tests-v2';

// Mock fetch globally
global.fetch = vi.fn();

/**
 * @integration @api @high-priority @ai
 */

describe('AI Provider Integration Tests @unit @ai', () => {
  let tagger: EnhancedTestTagger;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Gemini Provider', () => {
    it('should call Gemini API with correct parameters', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                tags: ['@unit', '@ui'],
                confidence: 0.95,
                reasoning: 'Component test with rendering'
              })
            }]
          }
        }]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        statusText: 'OK'
      } as Response);

      tagger = new EnhancedTestTagger({
        provider: 'gemini',
        apiKey: 'test-gemini-key'
      });

      const result = await tagger['callGemini'](
        'Test prompt',
        'test-gemini-key'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test prompt')
        })
      );

      expect(result).toEqual({
        tags: ['@unit', '@ui'],
        confidence: 0.95,
        reasoning: 'Component test with rendering'
      });
    });

    it('should handle Gemini API errors gracefully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Rate limit exceeded',
        json: async () => ({ error: 'Rate limit' })
      } as Response);

      tagger = new EnhancedTestTagger({
        provider: 'gemini',
        apiKey: 'test-key'
      });

      await expect(
        tagger['callGemini']('Test prompt', 'test-key')
      ).rejects.toThrow('Gemini API error: Rate limit exceeded');
    });

    it('should parse JSON from Gemini response text', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: `Here's the analysis:
              \`\`\`json
              {
                "tags": ["@integration", "@api"],
                "confidence": 0.88,
                "reasoning": "API integration test"
              }
              \`\`\`
              This test uses API calls.`
            }]
          }
        }]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        statusText: 'OK'
      } as Response);

      tagger = new EnhancedTestTagger({
        provider: 'gemini',
        apiKey: 'test-key'
      });

      const result = await tagger['callGemini']('Test', 'test-key');

      expect(result.tags).toEqual(['@integration', '@api']);
      expect(result.confidence).toBe(0.88);
    });
  });

  describe('Anthropic Provider', () => {
    it('should call Anthropic API with correct parameters', async () => {
      const mockResponse = {
        content: [{
          text: JSON.stringify({
            tags: ['@e2e', '@auth', '@critical'],
            confidence: 0.92,
            reasoning: 'E2E authentication flow test'
          })
        }]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        statusText: 'OK'
      } as Response);

      tagger = new EnhancedTestTagger({
        provider: 'anthropic',
        apiKey: 'test-anthropic-key',
        fallbackModel: 'claude-3-opus-20240229'
      });

      const result = await tagger['callAnthropic'](
        'Test prompt',
        'test-anthropic-key'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-anthropic-key',
            'anthropic-version': '2023-06-01'
          }),
          body: expect.stringContaining('Test prompt')
        })
      );

      expect(result).toEqual({
        tags: ['@e2e', '@auth', '@critical'],
        confidence: 0.92,
        reasoning: 'E2E authentication flow test'
      });
    });

    it('should handle Anthropic API errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid API key' })
      } as Response);

      tagger = new EnhancedTestTagger({
        provider: 'anthropic',
        apiKey: 'invalid-key'
      });

      await expect(
        tagger['callAnthropic']('Test', 'invalid-key')
      ).rejects.toThrow('Anthropic API error: Unauthorized');
    });
  });

  describe('Provider Fallback Logic', () => {
    it('should fall back to Anthropic when Gemini confidence is low', async () => {
      // Mock Gemini with low confidence
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  tags: ['@unit'],
                  confidence: 0.65, // Low confidence
                  reasoning: 'Uncertain analysis'
                })
              }]
            }
          }]
        }),
        statusText: 'OK'
      } as Response);

      // Mock Anthropic with high confidence
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{
            text: JSON.stringify({
              tags: ['@integration', '@api', '@validation'],
              confidence: 0.94,
              reasoning: 'Clear integration test pattern'
            })
          }]
        }),
        statusText: 'OK'
      } as Response);

      const mockFile = 'test.spec.ts';
      const mockContent = `
describe('API Test', () => {
  it('validates data', () => {});
});`;

      const fs = await import('fs');
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

      tagger = new EnhancedTestTagger({
        provider: 'gemini',
        fallbackProvider: 'anthropic',
        apiKey: 'gemini-key',
        fallbackApiKey: 'anthropic-key'
      });

      const analysis = await tagger['analyzeFile'](mockFile);

      // Should have used Anthropic due to low Gemini confidence
      expect(analysis.provider).toBe('anthropic');
      expect(analysis.confidence).toBe(0.94);
      expect(analysis.suggestedTags).toContain('@integration');
      expect(analysis.suggestedTags).toContain('@api');
    });

    it('should use local analysis when both providers fail', async () => {
      // Mock both providers failing
      vi.mocked(global.fetch)
        .mockRejectedValueOnce(new Error('Gemini network error'))
        .mockRejectedValueOnce(new Error('Anthropic network error'));

      const mockFile = 'msw-test.spec.ts';
      const mockContent = `
import { setupServer } from 'msw/node';
import { rest } from 'msw';

describe('MSW Integration Test', () => {
  const server = setupServer(
    rest.get('/api/users', handler)
  );
  
  beforeAll(() => server.listen());
});`;

      const fs = await import('fs');
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

      tagger = new EnhancedTestTagger({
        provider: 'gemini',
        fallbackProvider: 'anthropic',
        apiKey: 'gemini-key',
        fallbackApiKey: 'anthropic-key',
        verbose: false
      });

      const analysis = await tagger['analyzeFile'](mockFile);

      // Should fall back to local analysis
      expect(analysis.provider).toBe('local');
      expect(analysis.confidence).toBe(0.7);
      expect(analysis.suggestedTags).toContain('@integration');
      expect(analysis.suggestedTags).toContain('@api');
    });

    it('should skip fallback when primary confidence is high enough', async () => {
      // Mock Gemini with high confidence
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  tags: ['@unit', '@ui', '@validation'],
                  confidence: 0.95, // High confidence
                  reasoning: 'Clear unit test'
                })
              }]
            }
          }]
        }),
        statusText: 'OK'
      } as Response);

      const mockFile = 'component.test.tsx';
      const mockContent = `
import { render } from '@testing-library/react';
describe('Component', () => {
  it('renders', () => { render(<Button />); });
});`;

      const fs = await import('fs');
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

      tagger = new EnhancedTestTagger({
        provider: 'gemini',
        fallbackProvider: 'anthropic',
        apiKey: 'gemini-key',
        fallbackApiKey: 'anthropic-key'
      });

      const analysis = await tagger['analyzeFile'](mockFile);

      // Should use Gemini only (no fallback needed)
      expect(analysis.provider).toBe('gemini');
      expect(analysis.confidence).toBe(0.95);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only Gemini called
    });
  });

  describe('Prompt Building', () => {
    beforeEach(() => {
      tagger = new EnhancedTestTagger();
    });

    it('should build comprehensive prompts with all rules', () => {
      const testContent = `
describe('User Service', () => {
  it('authenticates users', async () => {
    const user = await authenticate('user@test.com', 'password');
    expect(user).toBeDefined();
  });
});`;

      const prompt = tagger['buildAIPrompt'](testContent, 'auth.test.ts');

      // Check prompt contains all necessary sections
      expect(prompt).toContain('Analyze this test file');
      expect(prompt).toContain('File: auth.test.ts');
      expect(prompt).toContain('@unit');
      expect(prompt).toContain('@integration');
      expect(prompt).toContain('@e2e');
      expect(prompt).toContain('@smoke');
      expect(prompt).toContain('Rules:');
      expect(prompt).toContain('Unit tests CANNOT be @server-dependent');
      expect(prompt).toContain('Smoke tests MUST be @post-deploy');
      expect(prompt).toContain('Respond in JSON format');
      expect(prompt).toContain(testContent);
    });

    it('should truncate very long test content', () => {
      // Create content with unique pattern to properly test truncation
      let longContent = '';
      for (let i = 0; i < 5000; i++) {
        longContent += `CHAR${i}_`;
      }
      const prompt = tagger['buildAIPrompt'](longContent, 'long.test.ts');

      // Should truncate to 3000 characters - check content that's clearly within range
      expect(prompt).toContain('CHAR0_');
      expect(prompt).toContain('CHAR100_');
      // Check that content clearly beyond 3000 chars is not included
      expect(prompt).not.toContain('CHAR800_'); // This will be well beyond 3000 chars
      expect(prompt).not.toContain('CHAR1000_');
    });

    it('should include all functional area options', () => {
      const prompt = tagger['buildAIPrompt']('test', 'test.ts');

      expect(prompt).toContain('@auth');
      expect(prompt).toContain('@api');
      expect(prompt).toContain('@ui');
      expect(prompt).toContain('@validation');
      expect(prompt).toContain('@security');
      expect(prompt).toContain('@cache');
      expect(prompt).toContain('@rbac');
    });
  });

  describe('API Key Validation', () => {
    it('should use environment variables when no keys provided', () => {
      process.env.GEMINI_API_KEY = 'env-gemini-key';
      process.env.ANTHROPIC_API_KEY = 'env-anthropic-key';

      tagger = new EnhancedTestTagger({
        provider: 'gemini',
        fallbackProvider: 'anthropic'
      });

      expect(tagger['config'].apiKey).toBe('env-gemini-key');
      expect(tagger['config'].fallbackApiKey).toBe('env-anthropic-key');

      delete process.env.GEMINI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('should prefer GOOGLE_API_KEY for Gemini', () => {
      process.env.GOOGLE_API_KEY = 'google-key';

      tagger = new EnhancedTestTagger({
        provider: 'gemini'
      });

      expect(tagger['config'].apiKey).toBe('google-key');

      delete process.env.GOOGLE_API_KEY;
    });

    it('should work without API keys using local analysis', async () => {
      const mockFile = 'local.test.ts';
      const mockContent = `
describe('Local Test', () => {
  it('works without API', () => {});
});`;

      const fs = await import('fs');
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

      tagger = new EnhancedTestTagger({
        provider: 'gemini',
        apiKey: undefined,
        fallbackApiKey: undefined
      });

      const analysis = await tagger['analyzeFile'](mockFile);

      expect(analysis.provider).toBe('local');
      expect(analysis.confidence).toBe(0.7);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});