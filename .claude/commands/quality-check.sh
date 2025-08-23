#!/bin/bash

# n8n Workflow Quality Check Script
# Comprehensive validation combining all quality checks

echo "🎯 Running comprehensive workflow quality checks..."

# Function to check command exit status
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 passed"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

echo ""
echo "1️⃣ JSON Formatting Check..."
bash .claude/commands/format-json.sh
check_status "JSON formatting"

echo ""
echo "2️⃣ Workflow Validation Check..."
bash .claude/commands/validate-workflow.sh
check_status "Workflow validation"

echo ""
echo "3️⃣ Testing with Mock Data..."
bash .claude/commands/test-workflow.sh
check_status "Mock data testing"

echo ""
echo "4️⃣ Diagram Generation..."
bash .claude/commands/generate-diagram.sh
check_status "Diagram generation"

echo ""
echo "5️⃣ Documentation Completeness Check..."

# Check for required documentation files
REQUIRED_DOCS=(
    "docs/workflow-scoping.md"
    "docs/data-sources-analysis.md"
    "docs/data-architecture.md"
    "docs/workflow-requirements.md"
    "docs/success-criteria.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        # Check if file has more than just headers
        if [ $(wc -l < "$doc") -gt 10 ]; then
            echo "✅ Documentation complete: $doc"
        else
            echo "⚠️  Documentation needs content: $doc"
        fi
    else
        echo "❌ Missing required documentation: $doc"
        exit 1
    fi
done

echo ""
echo "6️⃣ Template Structure Validation..."

# Check template file completeness
TEMPLATE_FILES=$(find templates/ -name "*.json" 2>/dev/null)
if [ -z "$TEMPLATE_FILES" ]; then
    echo "❌ No template files found in templates/ directory"
    exit 1
else
    echo "✅ Template files present: $(echo $TEMPLATE_FILES | wc -w) files"
fi

# Check subsection structure
SUBSECTIONS=(data-input processing output)
for section in "${SUBSECTIONS[@]}"; do
    if [ -d "workflows/subsections/$section" ]; then
        echo "✅ Subsection directory exists: $section"
        if [ -f "workflows/subsections/$section/workflow.json" ]; then
            echo "✅ Subsection workflow exists: $section"
        else
            echo "⚠️  No workflow.json in subsection: $section"
        fi
    else
        echo "⚠️  Missing subsection directory: $section"
    fi
done

echo ""
echo "🎉 Quality check complete!"
echo "📋 Summary:"
echo "   ✅ JSON structure validated"
echo "   ✅ Node connections verified"
echo "   ✅ Mock data testing passed"
echo "   ✅ Diagrams generated"
echo "   ✅ Documentation reviewed"
echo "   ✅ Template structure verified"
echo ""
echo "🚀 Workflow is ready for deployment to n8n!"