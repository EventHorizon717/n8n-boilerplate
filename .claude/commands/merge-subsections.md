# Merge Subsections Command

## Purpose
Combine modular workflow subsections into a complete n8n workflow JSON file.

## Command Usage
Merge individual subsection JSON files into the main workflow while maintaining proper connections and data flow.

## Merge Process

### 1. Pre-merge Validation
Before merging, validate each subsection:
- Run `json-validator.md` on each subsection file
- Verify subsection interfaces and data contracts
- Check for naming conflicts and duplicate node IDs
- Ensure compatible node types at connection points

### 2. Subsection Analysis
Analyze each subsection file:
- **data-input/**: Extract input nodes and their outputs
- **processing/**: Identify input requirements and outputs
- **output/**: Determine final output formats and destinations

### 3. Connection Planning
Map connections between subsections:
- Identify interface nodes (connection points)
- Plan data flow between subsections
- Resolve any data format mismatches
- Handle error propagation between sections

### 4. Node ID Resolution
Ensure unique node IDs across merged workflow:
- Check for ID conflicts between subsections
- Regenerate IDs if conflicts exist
- Update connection references
- Maintain node naming conventions

### 5. JSON Merge Operation
Combine JSON structures:
- Merge `nodes` arrays from all subsections
- Combine `connections` objects
- Merge workflow metadata
- Consolidate settings and configurations

### 6. Post-merge Validation
After merging, validate the complete workflow:
- Run full workflow validation
- Check end-to-end connectivity
- Verify data flow integrity
- Generate updated workflow diagram

## Subsection Interface Standards

### Input Interface
Each subsection should define:
- Expected input data format
- Required input fields
- Optional parameters
- Error handling for invalid inputs

### Output Interface
Each subsection should provide:
- Output data format specification
- Success data structure
- Error output format
- Status indicators

### Connection Points
Define clear connection points:
- Named output nodes for subsection exits
- Named input nodes for subsection entries
- Data transformation requirements
- Error handling propagation

## Merge Configuration

### Subsection Order
Standard merge order:
1. `data-input/` - Input handling and validation
2. `processing/` - Core business logic
3. `output/` - Result formatting and delivery

### Connection Rules
- Input subsection outputs connect to processing inputs
- Processing outputs connect to output subsection inputs
- Error outputs can connect to any appropriate error handlers
- Maintain consistent data formats at boundaries

## Error Handling
Handle merge conflicts and errors:
- Node ID conflicts: Regenerate with prefixes
- Data format mismatches: Insert transformation nodes
- Missing connections: Add bridging nodes
- Invalid configurations: Report and halt merge

## Validation Checklist
After merge completion:
- [ ] All subsection nodes included
- [ ] Node IDs are unique
- [ ] Connections are valid
- [ ] Data flow is continuous
- [ ] Error paths are maintained
- [ ] Workflow diagram updated
- [ ] Main workflow file saved

## Output Files
Merge process produces:
- Updated `workflows/main-workflow.json`
- New workflow diagram in `workflows/diagrams/`
- Merge log with any issues or changes
- Validation report for merged workflow

## Best Practices
- Keep subsections loosely coupled
- Use consistent data formats
- Document subsection interfaces
- Test subsections individually before merge
- Maintain version control of subsection files