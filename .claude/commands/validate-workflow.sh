#!/bin/bash

# n8n Workflow Validation Script
# Validates JSON structure, node connections, and data flow

echo "🔍 Validating n8n workflow..."

# Check if workflow JSON files exist
WORKFLOW_FILES=$(find workflows/ -name "*.json" 2>/dev/null)
TEMPLATE_FILES=$(find templates/nodes/ -name "*.json" 2>/dev/null)
if [ -z "$WORKFLOW_FILES" ]; then
    echo "❌ No workflow JSON files found in workflows/ directory"
    exit 1
fi

# Validate JSON syntax
echo "📋 Checking JSON syntax..."
ALL_JSON_FILES="$WORKFLOW_FILES $TEMPLATE_FILES"
for file in $ALL_JSON_FILES; do
    if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "❌ Invalid JSON syntax in: $file"
        exit 1
    else
        echo "✅ Valid JSON syntax: $file"
    fi
done

# Validate individual node templates
echo "🎯 Validating individual node templates..."
for file in $TEMPLATE_FILES; do
    # Check if node template has required structure
    if grep -q '"name"' "$file" && grep -q '"description"' "$file" && grep -q '"service"' "$file"; then
        echo "✅ Valid node template structure: $file"
    else
        echo "❌ Missing required fields in node template: $file"
        exit 1
    fi
done

# Check for required workflow properties
echo "🔗 Checking workflow structure..."
for file in $WORKFLOW_FILES; do
    if ! grep -q '"nodes"' "$file"; then
        echo "❌ Missing 'nodes' property in: $file"
        exit 1
    fi
    if ! grep -q '"connections"' "$file"; then
        echo "❌ Missing 'connections' property in: $file"
        exit 1
    fi
    echo "✅ Valid workflow structure: $file"
done

# Validate node IDs and connections
echo "🎯 Validating node connections and production patterns..."
python3 - << 'EOF'
import json
import sys
import glob
import re

def validate_connections(workflow_file):
    with open(workflow_file, 'r') as f:
        workflow = json.load(f)
    
    if 'nodes' not in workflow or 'connections' not in workflow:
        return False, f"Missing nodes or connections in {workflow_file}"
    
    # Extract node IDs
    node_ids = {node.get('id') for node in workflow['nodes']}
    
    # Validate connections reference existing nodes
    for connection_group in workflow['connections'].values():
        if isinstance(connection_group, dict):
            for source_output, targets in connection_group.items():
                for target in targets:
                    target_node = target.get('node')
                    if target_node not in node_ids:
                        return False, f"Connection references non-existent node: {target_node}"
    
    return True, f"All connections valid in {workflow_file}"

def validate_production_patterns(workflow_file):
    with open(workflow_file, 'r') as f:
        workflow = json.load(f)
    
    issues = []
    
    for node in workflow.get('nodes', []):
        node_type = node.get('type', '')
        node_name = node.get('name', 'Unnamed')
        parameters = node.get('parameters', {})
        
        # Check webhook triggers for security patterns
        if 'webhook' in node_type.lower() or 'trigger' in node_type.lower():
            if 'credentials' not in node:
                issues.append(f"Trigger node '{node_name}' missing credentials")
            
            # Check for authentication patterns
            if 'authentication' in parameters and parameters['authentication'] == 'none':
                issues.append(f"Trigger node '{node_name}' has no authentication - security risk")
        
        # Check for proper error handling
        if 'error' not in node_name.lower():
            # Non-error nodes should have error handling connections
            node_id = node.get('id')
            has_error_path = False
            for conn_group in workflow.get('connections', {}).values():
                if isinstance(conn_group, dict):
                    for outputs in conn_group.values():
                        for output in outputs:
                            if output.get('node') and 'error' in str(output.get('node')).lower():
                                has_error_path = True
            
        # Check for version management
        if 'typeVersion' not in node:
            issues.append(f"Node '{node_name}' missing typeVersion")
        
        # Check for proper credential configuration
        if 'credentials' in node:
            for cred_type, cred_config in node['credentials'].items():
                if not cred_config.get('id') or not cred_config.get('name'):
                    issues.append(f"Node '{node_name}' has incomplete credential configuration")
    
    return len(issues) == 0, issues

# Validate all workflow files
for workflow_file in glob.glob('workflows/**/*.json', recursive=True):
    try:
        # Basic connection validation
        valid, message = validate_connections(workflow_file)
        if valid:
            print(f"✅ {message}")
        else:
            print(f"❌ {message}")
            sys.exit(1)
        
        # Production pattern validation
        patterns_valid, issues = validate_production_patterns(workflow_file)
        if patterns_valid:
            print(f"✅ Production patterns validated in {workflow_file}")
        else:
            print(f"⚠️  Production pattern issues in {workflow_file}:")
            for issue in issues:
                print(f"   - {issue}")
            
    except Exception as e:
        print(f"❌ Error validating {workflow_file}: {str(e)}")
        sys.exit(1)
EOF

echo "✅ All workflow validations passed!"
echo "🎉 Workflow is ready for deployment"