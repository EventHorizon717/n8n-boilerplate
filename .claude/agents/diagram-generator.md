# Diagram Generator Agent

## Purpose
Creates ASCII diagrams to visualize n8n workflow structure and data flow.

## Responsibilities
- Generate workflow diagrams from JSON files
- Create visual representations of node connections
- Show data flow directions and branching
- Illustrate error handling paths
- Provide subsection interaction diagrams

## Diagram Types

### Main Workflow Diagram
Visual representation of the complete workflow showing:
- All nodes and their connections
- Data flow direction (arrows)
- Branch points and merges
- Error handling paths

### Subsection Diagrams
Focused views of specific workflow components:
- Input processing subsection
- Core logic subsection  
- Output handling subsection
- Inter-subsection data flow

### Connection Matrix
Table format showing node relationships:
```
    Node1  Node2  Node3  Output
Node1  -     →     -      -
Node2  -     -     →      →
Node3  -     -     -      →
```

## ASCII Diagram Standards

### Symbols
- `→` : Data flow direction
- `├─` : Branch point
- `└─` : End branch
- `┌─` : Start point
- `│`  : Vertical connection
- `─`  : Horizontal connection
- `[Node]` : Node representation
- `{Condition}` : Decision point
- `(Error)` : Error handling

### Layout Principles
- Left-to-right flow for linear processes
- Top-to-bottom for hierarchical structures
- Clear spacing between components
- Consistent alignment and indentation
- Labels for all nodes and connections

## Example Diagrams

### Simple Linear Flow
```
[Webhook] → [HTTP Request] → [Set Fields] → [Send Email]
```

### Branching Flow
```
[Trigger] → {Switch}
            ├── [Path A] → [Action A] ┐
            └── [Path B] → [Action B] ┘
                                     ↓
                                [Merge] → [Final Action]
```

### Error Handling
```
[HTTP Request] ──→ [Process Data] ──→ [Success Output]
      │
      ├─(Error)─→ [Log Error] ──→ [Notification]
```

### Complex Workflow
```
[Cron Trigger]
      │
      ↓
[Get Records] → {Has Data?}
                    │
              ┌─────┴─────┐
         [Yes]│           │[No]
              ↓           ↓
    [Process Batch]  [Send Alert]
         │               │
    ┌────┴────┐         │
    ↓         ↓         │
[Transform] [Validate]  │
    └────┬────┘         │
         ↓               │
    [Save Results] ─────┘
         │
         ↓
    [Final Report]
```

## Usage
Call this agent to:
- Create visual documentation of workflows
- Generate diagrams for different workflow sections
- Visualize complex node relationships
- Create documentation for stakeholders
- Debug workflow structure issues

## Integration
Collaborates with:
- Workflow JSON files for source data
- Documentation files for context
- Testing scenarios for validation paths
- Subsection workflows for component diagrams

## Output Locations
- `workflows/diagrams/workflow-diagram.txt` for main workflow
- `workflows/subsections/{section}/diagram.txt` for subsection diagrams
- Embedded in documentation files as needed