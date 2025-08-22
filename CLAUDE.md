# n8n Workflow Project

## Project Overview
[Describe the specific n8n workflow you're building here]

## Data Engineering Foundation

### Data Architecture Assessment
Before implementing any n8n workflow, establish the data engineering foundation:

#### 1. Data Discovery & Profiling
- **Source Systems Analysis**: Identify all data sources, their schemas, update frequencies, and data quality patterns
- **Data Volume Assessment**: Understand current and projected data volumes, velocity, and variety
- **Data Lineage Mapping**: Document data flow from sources through transformations to destinations
- **Quality Baseline**: Establish current data quality metrics and acceptable thresholds

#### 2. Data Modeling & Schema Design
- **Conceptual Model**: Define business entities and relationships independent of technology
- **Logical Model**: Design normalized data structures with proper relationships and constraints
- **Physical Model**: Optimize for n8n workflow patterns, considering JSON structure limitations
- **Version Control**: Plan for schema evolution and migration strategies

#### 3. Data Governance Framework
- **Data Classification**: Categorize data by sensitivity, compliance requirements, and business criticality
- **Access Controls**: Define who can read/write different data elements
- **Retention Policies**: Establish data lifecycle and archival strategies
- **Audit Requirements**: Plan for data lineage tracking and change auditing

#### 4. Quality Assurance Strategy
- **Validation Rules**: Define comprehensive data quality checks at each processing stage
- **Error Handling**: Plan for data quality failures, malformed inputs, and system errors
- **Monitoring**: Establish data quality metrics and alerting thresholds
- **Recovery Procedures**: Define rollback and data correction processes

## Workflow Goals
- [Primary objective of this workflow]
- [Secondary objectives]
- [Success metrics]
- [Data quality targets]
- [Performance benchmarks]

## Architecture Overview
This project follows a data-centric modular architecture emphasizing data engineering principles:

### Data Ingestion Layer (Input)
- **Source Connectors**: Robust connections to APIs, databases, files, and streaming sources
- **Data Validation**: Schema validation, type checking, and business rule enforcement
- **Error Quarantine**: Isolate invalid data for analysis and reprocessing
- **Rate Limiting**: Manage API quotas and prevent system overload
- **Data Deduplication**: Handle duplicate records and maintain data uniqueness

### Data Processing Layer
- **Transformation Engine**: Standardized data cleaning, enrichment, and normalization
- **Business Logic**: Implement domain-specific rules and calculations
- **Data Quality Checks**: Continuous validation throughout processing pipeline
- **Idempotency Control**: Ensure operations can be safely retried without side effects
- **State Management**: Track processing status and maintain data lineage

### Data Output Layer
- **Format Adaptation**: Transform data to match destination system requirements
- **Delivery Guarantees**: Implement at-least-once or exactly-once delivery patterns
- **Error Recovery**: Handle downstream system failures and implement retry logic
- **Data Lineage Tracking**: Maintain audit trail of data transformations
- **Performance Monitoring**: Track throughput, latency, and system health

## Workflow Subsections
- **data-input/**: Handles all incoming data and triggers
- **processing/**: Contains core workflow logic
- **output/**: Manages results and final actions

## Data-First Development Approach

### Phase 0: Requirements Gathering
0. **Workflow Scoping**: Complete interactive questionnaire in `docs/workflow-scoping.md`
   - **MANDATORY FIRST STEP**: Fill out comprehensive scoping questionnaire
   - Use "please assist" for questions requiring technical guidance from Claude Code
   - Use "na" to skip non-applicable sections
   - Establish clear business context, technical requirements, and success criteria
   - Validate scope with stakeholders before proceeding to technical design

### Phase 1: Data Engineering Analysis
1. **Data Discovery**: Analyze source systems in `docs/data-sources-analysis.md`
   - Catalog all data sources, APIs, databases, files, and external systems (from scoping questionnaire)
   - Profile data quality, completeness, and consistency patterns
   - Document data freshness, update frequencies, and availability windows
   - Identify data dependencies and upstream/downstream relationships

2. **Data Architecture Design**: Define data flow in `docs/data-architecture.md`
   - Design conceptual data model with business entities and relationships
   - Create logical data model with normalized structures and constraints
   - Plan physical data model optimized for n8n JSON processing patterns
   - Define data transformation rules and business logic requirements

3. **Quality Framework**: Establish standards in `docs/data-quality-framework.md`
   - Define data quality dimensions (completeness, accuracy, consistency, timeliness)
   - Create validation rules for each data element and transformation step
   - Plan error handling strategies for data quality failures
   - Design monitoring and alerting for data quality issues

### Phase 2: Technical Foundation
4. **Schema & Infrastructure**: Design persistence in `docs/database-schema.md`
   - Create database schemas optimized for workflow data patterns
   - Design indexes for query performance and data retrieval efficiency
   - Plan data retention, archival, and cleanup strategies
   - Define backup, recovery, and disaster recovery procedures

5. **Processing Strategy**: Plan transformations in `docs/processing-strategy.md`
   - Define batch vs real-time processing requirements
   - Plan for data volume scalability and performance optimization
   - Design idempotency and exactly-once processing patterns
   - Create strategies for handling late-arriving and out-of-order data

### Phase 3: n8n Implementation
6. **Requirements Mapping**: Define functional needs in `docs/workflow-requirements.md`
   - Map data engineering requirements to n8n node capabilities
   - Plan workflow subsection boundaries based on data flow patterns
   - Define testing scenarios that validate data engineering requirements

7. **Modular Development**: Build subsections in `workflows/subsections/`
   - Create data ingestion subsection with validation and error handling
   - Build processing subsection with transformation and business logic
   - Implement output subsection with formatting and destination routing
   - Validate each subsection independently with comprehensive test data

8. **Integration & Optimization**: Merge and validate in complete workflow
   - Combine subsections into unified workflow with proper error handling
   - Optimize for performance, monitoring, and operational excellence
   - **Generate ASCII Workflow Diagram**: Create visual representation in `workflows/diagrams/workflow-visualization.md`
   - Validate end-to-end with realistic data scenarios

### Workflow Visualization Requirements
When building any n8n workflow, **ALWAYS generate an ASCII diagram** that shows:
- **Node Connections**: Visual representation of how nodes connect and data flows
- **Error Paths**: Show error handling and recovery routes
- **Decision Points**: Illustrate conditional logic and branching
- **Data Transformation**: Highlight where data changes occur
- **Performance Bottlenecks**: Identify potential scaling and optimization points

The diagram should be saved to `workflows/diagrams/workflow-visualization.md` and include:
1. **Main workflow flow** with all nodes and connections
2. **Error handling paths** showing how failures are managed
3. **Node descriptions** explaining the purpose and logic of each component
4. **Performance characteristics** including throughput and resource requirements
5. **Monitoring points** for tracking data quality and system health

## Success Criteria
Define what constitutes a successful workflow execution from a data engineering perspective:

### Data Quality Metrics
- **Completeness**: 99.5%+ of expected records processed successfully
- **Accuracy**: 99.9%+ of data transformations produce correct results
- **Consistency**: 100% referential integrity maintained across related data
- **Timeliness**: Data processed within defined SLA windows
- **Validity**: 99.8%+ of records pass all validation rules

### Performance Benchmarks
- **Throughput**: Process target volume within specified time windows
- **Latency**: End-to-end processing time meets business requirements
- **Resource Utilization**: Memory and CPU usage within operational limits
- **Availability**: 99.9%+ uptime for scheduled workflow executions

### Operational Excellence
- **Error Recovery**: All recoverable errors handled gracefully with retry logic
- **Monitoring**: Comprehensive observability into data flow and system health
- **Alerting**: Proactive notifications for data quality and system issues
- **Documentation**: Complete audit trail and data lineage tracking

### Business Impact Validation
- **Data Freshness**: Delivered data meets staleness requirements
- **Downstream Dependencies**: All consuming systems receive expected data format
- **Compliance**: All data governance and regulatory requirements satisfied
- **Scalability**: System handles projected growth without performance degradation

Reference detailed metrics in `docs/success-criteria.md`

## Data Engineering Best Practices

### Data Validation Patterns
- **Schema Enforcement**: Validate incoming data against defined schemas at ingestion
- **Range Checks**: Ensure numeric values fall within expected business ranges
- **Format Validation**: Verify dates, emails, URLs, and other formatted fields
- **Referential Integrity**: Check foreign key relationships and data dependencies
- **Business Rules**: Implement domain-specific validation logic

### Error Handling Strategies
- **Graceful Degradation**: Continue processing valid records when some fail
- **Dead Letter Queues**: Quarantine failed records for manual review and reprocessing
- **Circuit Breakers**: Prevent cascade failures when downstream systems are unavailable
- **Exponential Backoff**: Implement intelligent retry strategies for transient failures
- **Alerting Thresholds**: Set up monitoring for error rates and system health

### Performance Optimization
- **Batch Processing**: Group operations to reduce overhead and improve throughput
- **Parallel Execution**: Process independent data streams concurrently
- **Connection Pooling**: Efficiently manage database and API connections
- **Caching Strategies**: Cache frequently accessed reference data and API responses
- **Resource Management**: Monitor and optimize memory usage and execution time

### Data Security & Compliance
- **Data Encryption**: Encrypt sensitive data in transit and at rest
- **Access Logging**: Maintain comprehensive audit trails for compliance
- **Data Masking**: Protect PII in non-production environments
- **Credential Management**: Securely store and rotate API keys and database credentials
- **Privacy Controls**: Implement data retention and deletion policies

### Monitoring & Observability
- **Data Quality Metrics**: Track completeness, accuracy, and timeliness KPIs
- **Processing Metrics**: Monitor throughput, latency, and error rates
- **System Health**: Track resource utilization and performance trends
- **Business Metrics**: Measure impact on downstream systems and business processes
- **Alerting**: Proactive notifications for issues requiring immediate attention

## Workflow Development Instructions

### Mandatory Diagram Generation
**CRITICAL**: When building any n8n workflow, you MUST:

1. **Create ASCII Workflow Diagram** immediately after completing workflow JSON
   - Generate visual representation of all nodes and their connections
   - Show main data flow paths and error handling routes
   - Include decision points, transformations, and monitoring nodes
   - Save diagram to `workflows/diagrams/workflow-visualization.md`

2. **Update Diagram During Development**
   - Regenerate diagram whenever nodes are added, removed, or reconnected
   - Keep diagram synchronized with actual workflow JSON structure
   - Include performance annotations and bottleneck identification

3. **Diagram Content Requirements**
   - **Node Layout**: Show spatial relationship and logical flow
   - **Connection Types**: Distinguish between main, error, and conditional connections
   - **Data Transformations**: Highlight where data structure changes occur
   - **Error Paths**: Clearly show all error handling and recovery routes
   - **Performance Notes**: Annotate expected throughput and resource usage

### ASCII Diagram Symbols
```
┌─────────────┐  Workflow nodes (rectangular boxes)
│   Node      │  
└─────────────┘  

───▶  Main data flow connection
···▶  Error connection  
═══▶  High-volume data flow
╔═══════════╗  Critical/high-priority nodes
║   Node    ║
╚═══════════╝

┌─┐  Decision/switch point
│?│  
└─┘

[Q]  Queue/buffer
{T}  Transformation point
(M)  Monitoring point
<!>  Error/alert point
```

## Development Process Summary

### **ALWAYS START HERE**: Complete `docs/workflow-scoping.md` questionnaire
- This is the mandatory first step for any new workflow
- Use interactive responses ("please assist" or "na") as needed
- Claude Code will guide you through technical decisions when requested
- Validate completed scope with stakeholders before proceeding

### **Processing Interactive Responses**
When Claude Code encounters:
- **"please assist"**: Will initiate a guided conversation to help you determine the best answer
- **"na"**: Will skip that section and exclude related functionality from the workflow
- **Specific answers**: Will use your responses directly in the workflow design

## Technical References
- **START HERE**: Complete scoping questionnaire in `docs/workflow-scoping.md`
- Use `references/n8n-nodes-catalog.md` for available nodes
- Follow JSON structure guidelines in `references/json-structure-guide.md`
- Leverage workflow examples in `references/workflow-examples/`
- Run validation commands from `.claude/commands/`
- Reference data engineering patterns in `docs/data-architecture.md`
- Follow quality standards defined in `docs/data-quality-framework.md`
- **Generate workflow diagrams** in `workflows/diagrams/workflow-visualization.md`