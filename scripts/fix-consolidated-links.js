#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to extract the first heading at any level from a source file
function extractMainHeading(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Look for any heading level (##, ###, ####, etc.)
    const headingMatch = line.match(/^(#{2,})\s+(.+)$/);
    if (headingMatch) {
      // Remove any existing anchor tags from the heading
      const heading = headingMatch[2].replace(/\{#[^}]+\}$/, '').trim();
      return heading;
    }
  }
  return null;
}

// Function to add anchor tag to heading in index file
function addAnchorToHeading(indexPath, heading, anchorId) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Check if anchor already exists for this ID
  if (content.includes(`{#${anchorId}}`)) {
    console.log(`⏭️  Anchor {#${anchorId}} already exists for "${heading}"`);
    return false;
  }
  
  // Look for the exact heading at any level and add anchor if not already present
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingPattern = new RegExp(`^(#{2,})\\s+${escapedHeading}(?!\\{#)`, 'm');
  
  if (headingPattern.test(content)) {
    content = content.replace(headingPattern, `$1 ${heading}{#${anchorId}}`);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`✅ Added anchor {#${anchorId}} to heading: "${heading}"`);
    return true;
  } 
    console.log(`⚠️  Could not find heading: "${heading}" or it already has an anchor`);
    return false;
  
}

// Function to find and update all references to a file across the entire ISBDM site
function updateReferences(fileId, section) {
  const searchPatterns = [
    `${section}/${fileId}`,
    `${section}/${fileId}.html`,
    `/${section}/${fileId}`,
    `/${section}/${fileId}.html`,
    `/docs/${section}/${fileId}`,
    `/docs/${section}/${fileId}.html`
  ];
  
  let totalUpdates = 0;
  const processedFiles = new Set();
  
  searchPatterns.forEach(pattern => {
    try {
      // Search the entire ISBDM site, not just the docs folder
      const searchCmd = `find /Users/jonphipps/Code/IFLA/standards-dev/standards/ISBDM -name "*.mdx" -exec grep -l "${pattern}" {} \\;`;
      const matchingFiles = execSync(searchCmd, { encoding: 'utf8' }).trim().split('\n').filter(f => f);
      
      matchingFiles.forEach(filePath => {
        if (!filePath || processedFiles.has(filePath)) {return;}
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let hasChanges = false;
        
        // Replace various forms of the reference, but be smart about not double-processing
        const replacements = [
          { from: `/docs/${section}/${fileId}.html`, to: `/docs/${section}/index#${fileId}` },
          { from: `/docs/${section}/${fileId}`, to: `/docs/${section}/index#${fileId}` },
          { from: `/${section}/${fileId}.html`, to: `/docs/${section}/index#${fileId}` },
          { from: `/${section}/${fileId}`, to: `/docs/${section}/index#${fileId}` },
          { from: `${section}/${fileId}.html`, to: `/docs/${section}/index#${fileId}` },
          { from: `${section}/${fileId}`, to: `/docs/${section}/index#${fileId}` }
        ];
        
        replacements.forEach(({ from, to }) => {
          // Only replace if it's not already the target format
          if (content.includes(from) && !content.includes(to)) {
            const newContent = content.replaceAll(from, to);
            if (newContent !== content) {
              content = newContent;
              hasChanges = true;
            }
          }
        });
        
        if (hasChanges && content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`    📝 Updated references in: ${path.relative(process.cwd(), filePath)}`);
          totalUpdates++;
          processedFiles.add(filePath);
        }
      });
    } catch (error) {
      // No files found with this pattern, continue
    }
  });
  
  return totalUpdates;
}

// Main function to process a folder
function processFolder(folderPath, section) {
  console.log(`\n🔄 Processing ${section} folder: ${folderPath}`);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Folder not found: ${folderPath}`);
    return;
  }
  
  const indexPath = path.join(folderPath, 'index.mdx');
  if (!fs.existsSync(indexPath)) {
    console.log(`❌ Index file not found: ${indexPath}`);
    return;
  }
  
  // Get all source files (_i*.mdx or _p*.mdx)
  const sourceFiles = fs.readdirSync(folderPath)
    .filter(file => file.match(/^_[ip]\d+\.mdx$/))
    .sort();
  
  console.log(`📋 Found ${sourceFiles.length} source files to process`);
  
  let totalProcessed = 0;
  let totalUpdates = 0;
  
  sourceFiles.forEach(file => {
    const fileId = file.replace(/^_(.+)\.mdx$/, '$1');
    const filePath = path.join(folderPath, file);
    
    console.log(`\n📄 Processing ${file} (${fileId}):`);
    
    // Extract main heading
    const heading = extractMainHeading(filePath);
    if (!heading) {
      console.log(`⚠️  No main heading found in ${file}`);
      return;
    }
    
    console.log(`    📌 Heading: "${heading}"`);
    
    // Add anchor to index
    const anchorAdded = addAnchorToHeading(indexPath, heading, fileId);
    
    // Update references across the entire ISBDM site
    const updates = updateReferences(fileId, section);
    totalUpdates += updates;
    
    if (updates > 0) {
      console.log(`    ✅ Updated ${updates} file(s) with new references`);
    } else {
      console.log(`    ℹ️  No references found to update`);
    }
    
    totalProcessed++;
  });
  
  console.log(`\n📊 ${section} Summary:`);
  console.log(`   📄 Files processed: ${totalProcessed}`);
  console.log(`   📝 Files updated: ${totalUpdates}`);
}

// Main execution
function main() {
  console.log('🚀 Starting enhanced consolidated link fix script...\n');
  console.log('🔍 Improvements in this version:');
  console.log('   • Searches entire ISBDM site (not just docs folder)');
  console.log('   • Uses first heading at any level (##, ###, ####, etc.)');
  console.log('   • Skips already processed anchors');
  console.log('   • Avoids duplicate reference updates');
  console.log('');
  
  const baseDir = '/Users/jonphipps/Code/IFLA/standards-dev/standards/ISBDM/docs';
  
  // Process intro folder
  const introPath = path.join(baseDir, 'intro');
  processFolder(introPath, 'intro');
  
  // Process assess folder  
  const assessPath = path.join(baseDir, 'assess');
  processFolder(assessPath, 'assess');
  
  console.log('\n🎉 Enhanced consolidated link fix completed!');
  console.log('\n💡 Recommended next steps:');
  console.log('   1. Review the changes');
  console.log('   2. Test a few links to ensure they work');
  console.log('   3. Run link validation to check for any issues');
  console.log('   4. Consider running again to catch any missed references');
}

if (require.main === module) {
  main();
}