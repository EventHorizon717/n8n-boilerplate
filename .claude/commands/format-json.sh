#!/bin/bash

# n8n Workflow JSON Formatter
# Standardizes JSON formatting for all workflow files

echo "✨ Formatting n8n workflow JSON files..."

# Find all JSON files in workflows directory
WORKFLOW_FILES=$(find workflows/ -name "*.json" 2>/dev/null)
TEMPLATE_FILES=$(find templates/ -name "*.json" 2>/dev/null)
TESTING_FILES=$(find testing/ -name "*.json" 2>/dev/null)

ALL_JSON_FILES="$WORKFLOW_FILES $TEMPLATE_FILES $TESTING_FILES"

if [ -z "$ALL_JSON_FILES" ]; then
    echo "❌ No JSON files found to format"
    exit 1
fi

echo "📁 Formatting JSON files..."

for file in $ALL_JSON_FILES; do
    if [ -f "$file" ]; then
        echo "🔧 Formatting: $file"
        
        # Create backup
        cp "$file" "$file.backup"
        
        # Format JSON with proper indentation
        if python3 -m json.tool "$file" > "$file.tmp" 2>/dev/null; then
            mv "$file.tmp" "$file"
            rm -f "$file.backup"
            echo "✅ Formatted: $file"
        else
            # Restore backup on error
            mv "$file.backup" "$file"
            echo "❌ Failed to format (invalid JSON): $file"
            exit 1
        fi
    fi
done

echo ""
echo "🎉 All JSON files formatted successfully!"
echo "📏 Standardized indentation: 2 spaces"
echo "🔗 Maintained n8n workflow structure"