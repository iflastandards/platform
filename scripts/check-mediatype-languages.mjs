import dotenv from 'dotenv';
import langdetect from 'langdetect';
import { writeFileSync } from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

dotenv.config();

// Language code to name mapping
const LANGUAGE_NAMES = {
    'en': 'English',
    'es': 'Spanish', 
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'tr': 'Turkish',
    'pl': 'Polish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'cs': 'Czech',
    'sk': 'Slovak',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sr': 'Serbian',
    'sl': 'Slovenian',
    'mk': 'Macedonian',
    'sq': 'Albanian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'et': 'Estonian',
    'uk': 'Ukrainian',
    'be': 'Belarusian',
    'ca': 'Catalan',
    'eu': 'Basque',
    'gl': 'Galician',
    'cy': 'Welsh',
    'ga': 'Irish',
    'mt': 'Maltese',
    'is': 'Icelandic',
    'he': 'Hebrew',
    'fa': 'Persian',
    'ur': 'Urdu',
    'bn': 'Bengali',
    'pa': 'Punjabi',
    'gu': 'Gujarati',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'tl': 'Filipino',
    'sw': 'Swahili',
    'am': 'Amharic',
    'yo': 'Yoruba',
    'zu': 'Zulu',
    'af': 'Afrikaans'
};

// Function to get language name with fallback
function getLanguageName(code) {
    return LANGUAGE_NAMES[code] || code.toUpperCase();
}

// Function to fetch sheet data via direct CSV export (no API key needed)
async function fetchSheetDirectly(spreadsheetId, sheetName) {
    try {
        // Google Sheets CSV export URL format
        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
        
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        
        // Use proper CSV parser to handle complex data
        try {
            const rows = parse(csvText, {
                skip_empty_lines: true,
                trim: false, // Don't trim - preserve exact content
                relax_quotes: true, // Handle malformed quotes
                escape: '"',
                quote: '"'
            });
            
            return rows;
        } catch (parseError) {
            console.log(`  CSV parsing failed for ${sheetName}: ${parseError.message}`);
            throw parseError;
        }
    } catch (error) {
        console.log(`  Direct access failed for ${sheetName}: ${error.message}`);
        return null;
    }
}

// Function to fetch sheet data via API (requires API key)
async function fetchSheetViaAPI(spreadsheetId, sheetName, apiKey) {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.log(`  API access failed for ${sheetName}: ${error.message}`);
        return null;
    }
}

// Function to load sheet data with fallback strategy
async function loadSheetData(spreadsheetId, sheetName, apiKey, useDirectAccess) {
    if (useDirectAccess) {
        const directData = await fetchSheetDirectly(spreadsheetId, sheetName);
        if (directData) {
            console.log(`  ✓ Direct access successful for ${sheetName}`);
            return directData;
        }
    }
    
    if (apiKey) {
        console.log(`  🔑 Falling back to API for ${sheetName}`);
        const apiData = await fetchSheetViaAPI(spreadsheetId, sheetName, apiKey);
        if (apiData) {
            console.log(`  ✓ API access successful for ${sheetName}`);
            return apiData;
        }
    }
    
    throw new Error(`Failed to access sheet ${sheetName} via both direct and API methods`);
}

async function detectLanguageWithAI(text, declaredLang) {
    if (!anthropic) {return null;}
    
    try {
        const prompt = `You are a language detection expert for library cataloging vocabularies. 

Analyze this text and determine its language:
Text: "${text}"
Declared language: ${declaredLang}

This text is from an ISBD (International Standard Bibliographic Description) vocabulary used in library cataloging. Consider:
- Technical terms and structured phrases are common
- Short phrases with parentheses like "text (visual)" are usually English technical terms
- Language codes: en=English, es=Spanish, fr=French, it=Italian, de=German, zh=Chinese, ru=Russian, sr=Serbian, hr=Croatian, bg=Bulgarian, sl=Slovenian, etc.

Respond with ONLY a JSON object in this format:
{
  "language": "detected_language_code", 
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

If the text matches the declared language, use the declared language code.
If you're unsure or confidence is below 70%, return null.`;

        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 200,
            messages: [{
                role: "user",
                content: prompt
            }]
        });

        const response = message.content[0].text.trim();
        
        // Try to parse JSON response
        try {
            const result = JSON.parse(response);
            if (result && result.language && result.confidence) {
                // Handle confidence as either decimal (0.95) or percentage (95)
                const confidence = result.confidence > 1 ? result.confidence / 100 : result.confidence;
                return {
                    language: result.language,
                    confidence: confidence,
                    reasoning: result.reasoning
                };
            }
        } catch (parseError) {
            console.log(`AI response parsing failed for "${text.substring(0, 50)}...": ${response}`);
        }
        
        return null;
    } catch (error) {
        console.error('AI language detection error:', error.message);
        return null;
    }
}

function isLikelyTechnicalText(text) {
    // Check for patterns that indicate technical/structured text
    const technicalPatterns = [
        /^\w+\s*\([^)]+\)$/,           // single word with parentheses like "text (visual)"
        /^[\w\s]+\s*\([^)]+;\s*[^)]+\)$/,  // structured labels like "image (still ; 2-dimensional)"
        /^[A-Z]+[0-9]+$/,              // codes like "T1001"
        /^[\w-]+:[\w-]+$/,             // namespaced identifiers like "skos:prefLabel"
        /^\d{4}-\d{2}-\d{2}$/,         // dates
        /^https?:\/\//,                // URLs
        /^[a-z]+:[A-Z]\d+$/,           // prefixed IDs
    ];
    
    return technicalPatterns.some(pattern => pattern.test(text.trim()));
}

export async function run() {
    const args = process.argv.slice(2);
    const outputMarkdown = args.includes('--markdown') || args.includes('-md');
    const useAI = args.includes('--ai');
    const testMode = args.includes('--test'); // Limit to first sheet for testing

    // Parse spreadsheet ID from command line
    let customSpreadsheetId = null;
    const spreadsheetArg = args.find(arg => arg.startsWith('--spreadsheet-id='));
    if (spreadsheetArg) {
        customSpreadsheetId = spreadsheetArg.split('=')[1];
    }

    // Show help if requested
    if (args.includes('--help') || args.includes('-h')) {
        const helpText = `
Language Tag Checker for Google Sheets

Usage:
  node scripts/check-mediatype-languages.js [options]

Options:
  --spreadsheet-id=ID    Use custom Google Sheets ID
  --ai                   Use AI detection (Claude) instead of statistical
  --markdown, -md        Output results as markdown file
  --test                 Test mode (first sheet only)
  --help, -h             Show this help

Examples:
  # Check default spreadsheet with statistical detection
  yarn check:language-tags
  
  # Check custom spreadsheet with AI detection
  node scripts/check-mediatype-languages.js --spreadsheet-id=YOUR_ID --ai
  
  # Generate markdown report
  yarn check:language-tags:md
  
  # Test AI on custom spreadsheet
  node scripts/check-mediatype-languages.js --spreadsheet-id=YOUR_ID --ai --test

Access Strategy:
  1. Try direct CSV export (no API key needed, requires public sharing)
  2. Fall back to Google Sheets API (requires GOOGLE_SHEETS_API_KEY)
  3. Fail with helpful error message

`;
        console.log(helpText);
        process.exit(0);
    }

    // Initialize Claude if using AI
    const anthropic = useAI ? new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    }) : null;

    const SPREADSHEET_ID = customSpreadsheetId || process.env.SPREADSHEET_ID || '1_QI2DqNomn0jCqSdjOxCZVF6wxz6FuRuIKBMweaGmfQ';
    const {GOOGLE_SHEETS_API_KEY} = process.env;

    await main();

    async function main() {
        if (!SPREADSHEET_ID) {
            console.error('Error: No spreadsheet ID provided. Use --spreadsheet-id=ID or set SPREADSHEET_ID environment variable.');
            process.exit(1);
        }

        console.log(`Using spreadsheet ID: ${SPREADSHEET_ID}`);

        const useDirectAccess = true; // Try direct access first

        // First get the list of sheets from index
        console.log('📋 Loading sheet index...');
        let indexData;
        try {
            indexData = await loadSheetData(SPREADSHEET_ID, 'index', GOOGLE_SHEETS_API_KEY, useDirectAccess);
        } catch (error) {
            console.error('❌ Failed to load index sheet:', error.message);
            console.error('   Make sure the spreadsheet is shared for viewing or provide a valid API key');
            process.exit(1);
        }

        const sheets = [];
        for (let i = 1; i < indexData.length; i++) {
            const row = indexData[i];
            const token = row[0];
            const uri = row[3];
            if (token && uri && uri.startsWith('http') && !token.includes(':')) {
                sheets.push(token);
            }
        }

        console.log('Checking sheets:', sheets.join(', '));
        console.log('Detection method:', useAI ? 'AI (Claude)' : 'Statistical (langdetect)');
        if (!outputMarkdown) {
            console.log('\n=== LANGUAGE MISMATCHES FOUND ===\n');
        }

        let totalMismatches = 0;
        const allMismatches = [];
        const sheetSummaries = [];

        const sheetsToProcess = testMode ? sheets.slice(0, 1) : sheets;

        for (const sheetName of sheetsToProcess) {
            try {
                console.log(`\n📊 Processing ${sheetName}...`);
                const data = await loadSheetData(SPREADSHEET_ID, sheetName, GOOGLE_SHEETS_API_KEY, useDirectAccess);

                if (!data || data.length < 2) {
                    console.log(`  ⚠️  Skipping ${sheetName} (insufficient data)`);
                    continue;
                }

                const headers = data[0];
                const mismatches = [];

                // Process each row with progress updates for AI mode
                const processedCount = 0;
                const totalRows = data.length - 1;

                for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
                    const row = data[rowIdx];
                    const uri = row[0];

                    if (useAI && rowIdx % 5 === 0) {
                        console.log(`  Processing ${sheetName}: ${rowIdx}/${totalRows} rows...`);
                    }

                    // Check each column
                    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
                        const header = headers[colIdx];
                        const value = row[colIdx];

                        if (!header || !value || !value.trim()) {continue;}

                        // Extract language from header
                        const langMatch = header.match(/@([a-z]{2}(?:-[A-Z]{2})?)/);
                        if (!langMatch) {continue;}

                        const declaredLang = langMatch[1];
                        const text = value.trim();

                        // Check for obvious script mismatches first (bypass length threshold)
                        const isChinese = /[\u4e00-\u9fa5]/.test(text);
                        const isCyrillic = /[\u0400-\u04FF]/.test(text);
                        const isArabic = /[\u0600-\u06FF]/.test(text);

                        const hasScriptMismatch = 
                            (isChinese && declaredLang !== 'zh') ||
                            (isCyrillic && !['ru', 'bg', 'sr', 'mk', 'uk'].includes(declaredLang)) ||
                            (isArabic && !['ar', 'fa', 'ur'].includes(declaredLang));

                        // Skip short text unless it's a script mismatch or technical/structured text
                        if (!hasScriptMismatch && text.length < (useAI ? 25 : 15)) {continue;} // Higher threshold for AI to save API calls

                        // Skip text that looks like technical labels or structured data (unless script mismatch)
                        if (!hasScriptMismatch && isLikelyTechnicalText(text)) {continue;}

                        // Detect language
                        try {
                            let detectedLang, confidence;

                            if (useAI) {
                                const aiResult = await detectLanguageWithAI(text, declaredLang);
                                if (aiResult) {
                                    detectedLang = aiResult.language;
                                    confidence = aiResult.confidence;
                                } else {
                                    continue; // Skip if AI couldn't detect
                                }
                                // Small delay to avoid rate limiting
                                await new Promise(resolve => setTimeout(resolve, 100));
                            } else {
                                const detected = langdetect.detect(text);
                                if (detected && detected.length > 0) {
                                    detectedLang = detected[0].lang;
                                    confidence = detected[0].prob;
                                } else {
                                    continue;
                                }
                            }

                            // Adjust confidence threshold based on text characteristics
                            let confidenceThreshold = useAI ? 0.7 : 0.9; // AI is more reliable, lower threshold
                            if (!useAI) {
                                if (text.length < 30) {confidenceThreshold = 0.95;}
                                if (text.length < 50) {confidenceThreshold = 0.92;}
                            }

                            // Check for mismatches with high confidence or script mismatches
                            if (confidence > confidenceThreshold || hasScriptMismatch) {
                                // Only report if there's a clear mismatch
                                let shouldReport = false;

                                // Always report script mismatches (regardless of confidence)
                                if (hasScriptMismatch) {
                                    shouldReport = true;
                                } else if (!isChinese && !isCyrillic && !isArabic && 
                                          detectedLang !== declaredLang && 
                                          !(declaredLang === 'zh' && detectedLang.startsWith('zh')) &&
                                          text.length > 30) { // Only report Latin script mismatches for longer text
                                    shouldReport = true;
                                }

                                if (shouldReport) {
                                    const mismatch = {
                                        sheet: sheetName,
                                        row: rowIdx + 1,
                                        uri: uri,
                                        column: header,
                                        declared: declaredLang,
                                        detected: isChinese ? 'zh' : detectedLang,
                                        confidence: confidence,
                                        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                                        fullText: text
                                    };
                                    mismatches.push(mismatch);
                                    allMismatches.push(mismatch);
                                }
                            }
                        } catch (e) {
                            // Ignore detection errors
                        }
                    }
                }

                if (mismatches.length > 0) {
                    sheetSummaries.push({
                        name: sheetName,
                        count: mismatches.length,
                        mismatches: mismatches
                    });

                    if (!outputMarkdown) {
                        console.log(`\n${sheetName.toUpperCase()} (${mismatches.length} mismatches):`);
                        console.log('-'.repeat(80));

                        mismatches.forEach(m => {
                            console.log(`Row ${m.row} (${m.uri})`);
                            console.log(`  Column: ${m.column}`);
                            console.log(`  Declared: ${m.declared}, Detected: ${m.detected} (${(m.confidence * 100).toFixed(1)}%)`);
                            console.log(`  Text: "${m.text}"`);
                            console.log('');
                        });
                    }

                    totalMismatches += mismatches.length;
                }
            } catch (error) {
                console.error(`Error processing ${sheetName}:`, error.message);
            }
        }

        // Generate output
        if (outputMarkdown) {
            generateMarkdownReport(sheetSummaries, allMismatches, totalMismatches);
        } else {
            console.log(`\n=== TOTAL: ${totalMismatches} language mismatches found ===`);
        }
    }
}

function generateMarkdownReport(sheetSummaries, allMismatches, totalMismatches) {
    const timestamp = new Date().toISOString();
    const reportPath = path.join(process.cwd(), 'tmp', `language-tag-mismatches${anthropic ? '-ai' : ''}.md`);

    let markdown = `# Language Tag Mismatch Report${anthropic ? ' (AI Detection)' : ' (Statistical Detection)'}
Generated: ${timestamp}

## Summary
Total mismatches found: **${totalMismatches}**
Detection method: **${anthropic ? 'AI (Claude Haiku)' : 'Statistical (langdetect)'}**

`;

    // Summary table
    if (sheetSummaries.length > 0) {
        markdown += `## Summary by Sheet

| Sheet | Mismatches |
|-------|------------|
`;
        sheetSummaries.forEach(sheet => {
            markdown += `| ${sheet.name} | ${sheet.count} |\n`;
        });
        markdown += '\n';
    }

    // Detailed findings
    markdown += `## Detailed Findings

`;

    if (sheetSummaries.length === 0) {
        markdown += 'No language mismatches detected.\n';
    } else {
        sheetSummaries.forEach(sheet => {
            markdown += `### ${sheet.name}
Found ${sheet.count} mismatches

| URI | Row | Column | Declared | Detected | Confidence | Text Sample |
|-----|-----|--------|----------|----------|------------|-------------|
`;
            sheet.mismatches.forEach(m => {
                const escapedText = m.text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
                markdown += `| ${m.uri} | ${m.row} | ${m.column} | ${m.declared} | ${m.detected} | ${(m.confidence * 100).toFixed(1)}% | ${escapedText} |\n`;
            });
            markdown += '\n';
        });
    }

    // Language summary
    const languagePairs = {};
    allMismatches.forEach(m => {
        const pair = `${m.declared} → ${m.detected}`;
        languagePairs[pair] = (languagePairs[pair] || 0) + 1;
    });

    if (Object.keys(languagePairs).length > 0) {
        markdown += `## Language Summary

| Declared → Detected | Count |
|---------------------|-------|
`;
        Object.entries(languagePairs)
            .sort((a, b) => b[1] - a[1])
            .forEach(([pair, count]) => {
                const [declared, detected] = pair.split(' → ');
                const declaredName = getLanguageName(declared);
                const detectedName = getLanguageName(detected);
                markdown += `| ${declared} (${declaredName}) → ${detected} (${detectedName}) | ${count} |\n`;
            });
        markdown += '\n';
    }

    // High confidence mismatches
    const highConfidence = allMismatches.filter(m => m.confidence > 0.9);
    if (highConfidence.length > 0) {
        markdown += `## High Confidence Mismatches (>90% confidence)

These are most likely actual language tagging errors:

`;
        highConfidence.forEach(m => {
            const declaredName = getLanguageName(m.declared);
            const detectedName = getLanguageName(m.detected);
            markdown += `- **${m.sheet}** ${m.uri} (Row ${m.row}), ${m.column}: "${m.text}" tagged as @${m.declared} (${declaredName}) but detected as ${m.detected} (${detectedName}) (${(m.confidence * 100).toFixed(1)}%)\n`;
        });
        markdown += '\n';
    }

    // Write to file
    try {
        writeFileSync(reportPath, markdown);
        console.log(`\n📄 Markdown report saved to: ${reportPath}`);
        console.log(`📊 Total mismatches found: ${totalMismatches}`);
    } catch (error) {
        console.error('Error writing markdown report:', error.message);
        console.log(markdown); // Output to console as fallback
    }
}

// Check if the script is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run().catch(err => {
        console.error(err);
        process.exit(1);
    });
}