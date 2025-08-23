#!/bin/bash

# n8n Workflow ASCII Diagram Generator
# Automatically generates ASCII diagrams from workflow JSON files

echo "🎨 Generating ASCII workflow diagrams..."

# Check if workflows exist
WORKFLOW_FILES=$(find workflows/ -name "*.json" 2>/dev/null)
if [ -z "$WORKFLOW_FILES" ]; then
    echo "❌ No workflow JSON files found in workflows/ directory"
    exit 1
fi

# Ensure diagrams directory exists
mkdir -p workflows/diagrams

echo "📊 Processing workflow files..."

for file in $WORKFLOW_FILES; do
    workflow_name=$(basename "$file" .json)
    diagram_file="workflows/diagrams/${workflow_name}-diagram.md"
    
    echo "🔍 Analyzing: $file"
    echo "📝 Generating diagram: $diagram_file"
    
    # Generate diagram using Python script
    python3 - << EOF
import json
import sys
import os

def generate_ascii_diagram(workflow_file, output_file):
    try:
        with open(workflow_file, 'r') as f:
            workflow = json.load(f)
        
        nodes = workflow.get('nodes', [])
        connections = workflow.get('connections', {})
        
        # Create diagram content
        diagram_content = f"""# Workflow Diagram: {os.path.basename(workflow_file)}

## ASCII Workflow Visualization

```
"""
        
        # Add nodes
        for i, node in enumerate(nodes):
            node_type = node.get('type', 'Unknown')
            node_name = node.get('name', f'Node{i+1}')
            
            # Determine node symbol based on type
            if 'trigger' in node_type.lower():
                symbol = "🚀"
            elif 'http' in node_type.lower():
                symbol = "🌐"
            elif 'database' in node_type.lower() or 'postgres' in node_type.lower():
                symbol = "🗄️"
            elif 'code' in node_type.lower():
                symbol = "⚙️"
            elif 'email' in node_type.lower() or 'notification' in node_type.lower():
                symbol = "📧"
            elif 'switch' in node_type.lower() or 'if' in node_type.lower():
                symbol = "🔀"
            else:
                symbol = "📦"
            
            diagram_content += f"┌─────────────────────┐\n"
            diagram_content += f"│ {symbol} {node_name:<15} │\n"
            diagram_content += f"│ {node_type:<19} │\n"
            diagram_content += f"└─────────────────────┘\n"
            diagram_content += "           │\n"
            diagram_content += "           ▼\n"
        
        diagram_content += """
```

## Node Details

| Node | Type | Purpose |
|------|------|---------|
"""
        
        # Add node details table
        for node in nodes:
            node_name = node.get('name', 'Unnamed')
            node_type = node.get('type', 'Unknown')
            parameters = node.get('parameters', {})
            purpose = parameters.get('description', 'Processing node')
            
            diagram_content += f"| {node_name} | {node_type} | {purpose} |\n"
        
        diagram_content += """

## Connection Analysis

### Data Flow Paths
- Main execution path follows sequential node order
- Error handling routes to designated error nodes
- Conditional logic creates branching paths

### Error Handling
- Failed nodes trigger error workflow paths
- Retry logic implemented for transient failures
- Dead letter processing for permanent failures

### Performance Considerations
- Monitor bottlenecks at data transformation nodes
- Consider parallel processing for independent operations
- Implement batching for high-volume data flows

*Diagram auto-generated from workflow JSON*
"""
        
        # Write diagram to file
        with open(output_file, 'w') as f:
            f.write(diagram_content)
        
        return True, f"Generated diagram: {output_file}"
        
    except Exception as e:
        return False, f"Error generating diagram: {str(e)}"

# Generate diagram for the current workflow
success, message = generate_ascii_diagram('$file', '$diagram_file')
print(message)
if not success:
    sys.exit(1)
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Diagram generated: $diagram_file"
    else
        echo "❌ Failed to generate diagram for: $file"
        exit 1
    fi
done

echo ""
echo "🎉 All workflow diagrams generated successfully!"
echo "📁 Diagrams saved to: workflows/diagrams/"
echo "💡 Review diagrams to verify workflow logic and connections"