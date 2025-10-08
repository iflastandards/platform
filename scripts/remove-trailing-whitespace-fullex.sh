#!/bin/bash

# Script to remove whitespace after \n within string values in MDX files
# Transforms: "text\n      more" -> "text\nmore"

set -euo pipefail

TARGET_DIR="standards/ISBDM/docs/fullex"

processed=0
skipped=0
errors=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧹 Removing whitespace after \\n in string values in ${TARGET_DIR}"
echo "=================================================="

if [[ ! -d "$TARGET_DIR" ]]; then
    echo -e "${RED}❌ Error: Directory ${TARGET_DIR} does not exist${NC}"
    exit 1
fi

while IFS= read -r -d '' file; do
    if [[ ! -r "$file" ]] || [[ ! -w "$file" ]]; then
        echo -e "${YELLOW}⚠️  Skipped (permissions): ${file}${NC}"
        ((skipped++))
        continue
    fi

    if ! file "$file" | grep -q "text"; then
        echo -e "${YELLOW}⚠️  Skipped (not text): ${file}${NC}"
        ((skipped++))
        continue
    fi

    temp_file="${file}.tmp"

    # Use perl to remove whitespace after \n within strings
    # This preserves the \n but removes following spaces/tabs
    if perl -pe 's/(\\n)\s+/\1/g' "$file" > "$temp_file"; then
        if ! cmp -s "$file" "$temp_file"; then
            if mv "$temp_file" "$file"; then
                echo -e "${GREEN}✅ Processed: ${file}${NC}"
                ((processed++))
            else
                echo -e "${RED}❌ Error moving temp file: ${file}${NC}"
                rm -f "$temp_file"
                ((errors++))
            fi
        else
            rm -f "$temp_file"
            echo "✓  No changes needed: ${file}"
        fi
    else
        echo -e "${RED}❌ Error processing: ${file}${NC}"
        rm -f "$temp_file"
        ((errors++))
    fi

done < <(find "$TARGET_DIR" -type f -name "*.mdx" -print0)

echo ""
echo "=================================================="
echo "📊 Summary:"
echo -e "   ${GREEN}Processed: ${processed}${NC}"
echo -e "   Unchanged: $((skipped - errors))"
echo -e "   ${YELLOW}Skipped: ${skipped}${NC}"
echo -e "   ${RED}Errors: ${errors}${NC}"
echo "=================================================="

if [[ $errors -gt 0 ]]; then
    exit 1
fi

exit 0
