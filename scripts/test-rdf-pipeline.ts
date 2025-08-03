#!/usr/bin/env tsx

/**
 * Test script for RDF Pipeline with Unified Spreadsheet API
 * Tests the complete flow: RDF → CSV → Spreadsheet → CSV → RDF → Docusaurus
 */

import { createSpreadsheetAPI } from '@ifla/unified-spreadsheet';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

// Test configuration
const TEST_DIR = path.join(process.cwd(), '.test-rdf-pipeline');
const TEST_RDF_FILE = path.join(process.cwd(), 'tools/typescript/rdf-converters/tests/fixtures/elements/minimal/input.ttl');
const TEST_PROFILE = path.join(process.cwd(), 'standards/isbd/static/data/DCTAP/isbd-elements-profile.csv');

interface TestResult {
  step: string;
  status: 'pass' | 'fail';
  message: string;
  error?: any;
}

const results: TestResult[] = [];

function logResult(step: string, status: 'pass' | 'fail', message: string, error?: any) {
  results.push({ step, status, message, error });
  const emoji = status === 'pass' ? '✅' : '❌';
  console.log(`${emoji} ${step}: ${message}`);
  if (error) {
    console.error(`   Error: ${error.message || error}`);
  }
}

async function setupTestEnvironment() {
  try {
    // Clean up previous test directory
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });
    logResult('Setup', 'pass', 'Test environment created');
  } catch (error) {
    logResult('Setup', 'fail', 'Failed to create test environment', error);
    throw error;
  }
}

async function testRdfToCsv(): Promise<string> {
  const outputCsv = path.join(TEST_DIR, 'step1-rdf-output.csv');
  
  try {
    // Use the RDF to CSV converter
    const command = `pnpm dlx tsx tools/typescript/rdf-converters/src/rdf-to-csv.ts -i "${TEST_RDF_FILE}" -p "${TEST_PROFILE}" -o "${outputCsv}"`;
    console.log(`\nRunning: ${command}`);
    
    execSync(command, { stdio: 'inherit' });
    
    // Verify CSV was created
    const stats = await fs.stat(outputCsv);
    logResult('RDF to CSV', 'pass', `CSV created (${stats.size} bytes)`);
    
    // Read and display sample
    const content = await fs.readFile(outputCsv, 'utf-8');
    const lines = content.split('\n');
    console.log(`   First 3 lines of CSV:`);
    lines.slice(0, 3).forEach(line => console.log(`   ${line}`));
    
    return outputCsv;
  } catch (error) {
    logResult('RDF to CSV', 'fail', 'Failed to convert RDF to CSV', error);
    throw error;
  }
}

async function testCsvToSpreadsheet(csvPath: string): Promise<string> {
  const xlsxPath = path.join(TEST_DIR, 'step2-workbook.xlsx');
  
  try {
    // Create unified spreadsheet API
    const api = createSpreadsheetAPI();
    
    // Read CSV into workbook
    console.log(`\nReading CSV: ${csvPath}`);
    const workbook = await api.read({
      type: 'file',
      path: csvPath
    });
    
    logResult('CSV to Workbook', 'pass', `Workbook created with ${workbook.sheets.length} sheet(s)`);
    
    // Display sheet info
    workbook.sheets.forEach(sheet => {
      console.log(`   Sheet "${sheet.name}": ${sheet.data.length} rows, ${sheet.headers?.length || 0} headers`);
      if (sheet.headers && sheet.headers.length > 0) {
        console.log(`   Headers: ${sheet.headers.slice(0, 5).join(', ')}...`);
      }
      // Debug: show first row data
      if (sheet.data.length > 0) {
        console.log(`   First row data:`, JSON.stringify(sheet.data[0], null, 2).split('\n').slice(0, 5).join('\n'));
      }
    });
    
    // Write to XLSX
    console.log(`\nWriting XLSX: ${xlsxPath}`);
    await api.write(workbook, {
      type: 'file',
      path: xlsxPath
    });
    
    const stats = await fs.stat(xlsxPath);
    logResult('Workbook to XLSX', 'pass', `XLSX created (${stats.size} bytes)`);
    
    return xlsxPath;
  } catch (error) {
    logResult('CSV to Spreadsheet', 'fail', 'Failed to convert CSV to spreadsheet', error);
    throw error;
  }
}

async function testSpreadsheetToCsv(xlsxPath: string): Promise<string> {
  const outputCsv = path.join(TEST_DIR, 'step3-csv-from-xlsx.csv');
  
  try {
    // Create unified spreadsheet API
    const api = createSpreadsheetAPI();
    
    // Read XLSX
    console.log(`\nReading XLSX: ${xlsxPath}`);
    const workbook = await api.read({
      type: 'file',
      path: xlsxPath
    });
    
    // Write back to CSV
    console.log(`Writing CSV: ${outputCsv}`);
    await api.write(workbook, {
      type: 'file',
      path: outputCsv
    });
    
    const stats = await fs.stat(outputCsv);
    logResult('Spreadsheet to CSV', 'pass', `CSV created (${stats.size} bytes)`);
    
    // Compare with original CSV
    const originalCsv = await fs.readFile(path.join(TEST_DIR, 'step1-rdf-output.csv'), 'utf-8');
    const newCsv = await fs.readFile(outputCsv, 'utf-8');
    
    if (originalCsv.trim() === newCsv.trim()) {
      logResult('CSV Comparison', 'pass', 'CSV content matches original');
    } else {
      logResult('CSV Comparison', 'fail', 'CSV content differs from original');
      console.log('   Note: Minor formatting differences may be acceptable');
    }
    
    return outputCsv;
  } catch (error) {
    logResult('Spreadsheet to CSV', 'fail', 'Failed to convert spreadsheet to CSV', error);
    throw error;
  }
}

async function testDctapValidation(csvPath: string): Promise<void> {
  try {
    // Create unified spreadsheet API with validation
    const api = createSpreadsheetAPI();
    
    // Read CSV
    const workbook = await api.read({
      type: 'file',
      path: csvPath
    });
    
    // TODO: When DCTAP validator is implemented, validate here
    // const errors = await api.validate(workbook, dctapProfile);
    
    logResult('DCTAP Validation', 'pass', 'Validation placeholder (not yet implemented)');
  } catch (error) {
    logResult('DCTAP Validation', 'fail', 'Failed to validate', error);
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('RDF PIPELINE TEST REPORT');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`- ${r.step}: ${r.message}`);
      if (r.error) {
        console.log(`  Error: ${r.error.message || r.error}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Save report
  const reportPath = path.join(TEST_DIR, 'test-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

async function main() {
  console.log('🧪 Testing RDF Pipeline with Unified Spreadsheet API');
  console.log('Pipeline: RDF → CSV → Spreadsheet → CSV → Validation\n');
  
  try {
    // Setup
    await setupTestEnvironment();
    
    // Step 1: RDF to CSV
    const csvPath = await testRdfToCsv();
    
    // Step 2: CSV to Spreadsheet (XLSX)
    const xlsxPath = await testCsvToSpreadsheet(csvPath);
    
    // Step 3: Spreadsheet back to CSV
    const finalCsvPath = await testSpreadsheetToCsv(xlsxPath);
    
    // Step 4: DCTAP Validation (placeholder)
    await testDctapValidation(finalCsvPath);
    
  } catch (error) {
    console.error('\n❌ Pipeline test failed:', error);
  }
  
  // Generate report
  await generateReport();
}

// Run the test
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});