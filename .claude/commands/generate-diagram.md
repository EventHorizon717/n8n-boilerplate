# Generate Diagram Command

## Purpose
Create ASCII diagrams for n8n workflows to visualize structure and data flow.

## Command Usage
Generate visual representations of workflows for documentation and debugging.

## Diagram Generation Process

### 1. Analyze Workflow JSON
- Parse main workflow file: `workflows/main-workflow.json`
- Extract node information and connections
- Identify workflow patterns and structure
- Map data flow paths

### 2. Determine Diagram Type
Based on workflow complexity:
- **Simple Linear**: Single path workflows
- **Branching**: Multiple conditional paths
- **Complex**: Loops, merges, and parallel processing
- **Modular**: Multiple subsections with interactions

### 3. Generate ASCII Representation
Using `diagram-generator.md` agent:
- Create main workflow diagram
- Generate subsection diagrams if applicable
- Show error handling paths
- Include connection details

### 4. Save Diagrams
Store generated diagrams in:
- `workflows/diagrams/workflow-diagram.txt` (main)
- `workflows/subsections/{section}/diagram.txt` (subsection)
- Embed in relevant documentation files

## Diagram Components

### Node Representation
- `[Node Name]` for standard nodes
- `{Decision}` for conditional nodes
- `(Error)` for error handling
- `<Input>` for data sources
- `>Output<` for final outputs

### Connection Symbols
- `→` for data flow direction
- `├─` for branch starts
- `└─` for branch ends
- `│` for vertical connections
- `─` for horizontal connections

### Flow Indicators
- Show trigger points clearly
- Indicate decision branches
- Mark error paths distinctly
- Highlight critical data transformations

## Use Cases

### Development Phase
- Visualize planned workflow structure
- Identify potential design issues
- Communicate workflow logic to team
- Plan subsection interactions

### Documentation
- Create visual workflow documentation
- Explain complex data transformations
- Show error handling strategies
- Illustrate integration points

### Debugging
- Trace data flow paths
- Identify bottlenecks or issues
- Verify connection logic
- Validate against requirements

### Maintenance
- Update diagrams after changes
- Document new workflow versions
- Maintain visual documentation currency
- Support troubleshooting efforts

## Quality Checks
Generated diagrams should:
- Accurately represent JSON workflow
- Be easily readable and understandable
- Include all nodes and connections
- Show error paths clearly
- Match actual workflow behavior

## Integration
This command works with:
- Workflow validation process
- Documentation generation
- Code review procedures
- Testing and debugging workflows