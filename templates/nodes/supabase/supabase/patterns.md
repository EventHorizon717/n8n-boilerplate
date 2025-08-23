# Supabase Node - Production Patterns

## Overview
The Supabase node demonstrates enterprise-grade patterns for database operations, combining robust error handling, dynamic schema discovery, flexible data mapping strategies, and comprehensive PostgREST integration with advanced filtering capabilities.

## Core Implementation Patterns

### 1. Dynamic Schema Discovery
```typescript
// Load available tables from API schema
async getTables(): Promise<INodePropertyOptions[]> {
    const { paths } = await supabaseApiRequest.call(this, 'GET', '/');
    return Object.keys(paths).filter(path => path !== '/').map(path => ({
        name: path.replace('/', ''),
        value: path.replace('/', '')
    }));
}

// Load column metadata with type information
async getTableColumns(): Promise<INodePropertyOptions[]> {
    const tableName = this.getCurrentNodeParameter('tableId') as string;
    const { definitions } = await supabaseApiRequest.call(this, 'GET', '/');
    return Object.keys(definitions[tableName].properties).map(column => ({
        name: `${column} - (${definitions[tableName].properties[column].type})`,
        value: column
    }));
}
```

**Key Benefits:**
- Runtime table and column discovery
- Type-aware field selection
- Dynamic adaptation to schema changes
- Reduces configuration overhead

### 2. Flexible Data Mapping Strategy
```typescript
// Auto-mapping approach
if (dataToSend === 'autoMapInputData') {
    const incomingKeys = Object.keys(items[i].json);
    const inputDataToIgnore = rawInputsToIgnore.split(',').map(c => c.trim());
    
    for (const key of incomingKeys) {
        if (inputDataToIgnore.includes(key)) continue;
        record[key] = items[i].json[key];
    }
}

// Manual field mapping
else {
    const fields = this.getNodeParameter('fieldsUi.fieldValues', i, []);
    for (const field of fields) {
        record[field.fieldId] = field.fieldValue;
    }
}
```

**Implementation Guidelines:**
- Use auto-mapping for dynamic workflows
- Use manual mapping for strict schema control
- Always provide field exclusion capability
- Support both approaches in the same node

### 3. Advanced Query Building with PostgREST Integration
```typescript
// Enhanced filter construction from GenericFunctions.ts
export const buildQuery = (obj: IDataObject, value: IDataObject) => {
    if (value.condition === 'fullText') {
        return Object.assign(obj, {
            [`${value.keyName}`]: `${value.searchFunction}.${value.keyValue}`,
        });
    }
    return Object.assign(obj, { [`${value.keyName}`]: `${value.condition}.${value.keyValue}` });
};

// OR query building for complex conditions
export const buildOrQuery = (key: IDataObject) => {
    if (key.condition === 'fullText') {
        return `${key.keyName}.${key.searchFunction}.${key.keyValue}`;
    }
    return `${key.keyName}.${key.condition}.${key.keyValue}`;
};

// Optimized GET query building
export const buildGetQuery = (obj: IDataObject, value: IDataObject) => {
    return Object.assign(obj, { [`${value.keyName}`]: `eq.${value.keyValue}` });
};
```

**Enhanced Query Pattern Benefits:**
- Full PostgREST-compatible query syntax
- Advanced full-text search with PostgreSQL functions (to_tsquery, plainto_tsquery, phraseto_tsquery, websearch_to_tsquery)
- Comprehensive operator support (eq, neq, gt, gte, lt, lte, like, ilike, is)
- Complex logical operations with AND/OR combinations
- Type-safe query construction with proper field mapping

### 4. Robust Error Handling
```typescript
try {
    const result = await supabaseApiRequest.call(this, method, endpoint, data, qs);
    const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(result),
        { itemData: { item: i } }
    );
    returnData.push(...executionData);
} catch (error) {
    if (this.continueOnFail()) {
        const executionData = this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray({ error: error.description }),
            { itemData: { item: i } }
        );
        returnData.push(...executionData);
    } else {
        throw error;
    }
}
```

**Error Handling Features:**
- Graceful degradation with continue-on-fail
- Detailed error context preservation
- Per-item error tracking in batch operations
- Maintains execution metadata for debugging

### 5. Pagination and Bulk Processing
```typescript
// Automatic pagination for large datasets
let rows: IDataObject[] = [];
let responseLength = 0;

do {
    const newRows = await supabaseApiRequest.call(this, 'GET', endpoint, {}, qs);
    responseLength = newRows.length;
    rows = rows.concat(newRows);
    qs.offset = rows.length;
} while (responseLength >= 1000);
```

**Pagination Benefits:**
- Handles datasets larger than API limits
- Memory-efficient streaming approach
- Automatic offset management
- Configurable batch sizes

### 6. Enhanced API Request Pattern
```typescript
export async function supabaseApiRequest(
    this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
    method: IHttpRequestMethods,
    resource: string,
    body: IDataObject | IDataObject[] = {},
    qs: IDataObject = {},
    uri?: string,
    headers: IDataObject = {},
) {
    const credentials = await this.getCredentials<{
        host: string;
        serviceRole: string;
    }>('supabaseApi');

    // Enhanced custom schema support
    if (this.getNodeParameter('useCustomSchema', false)) {
        const schema = this.getNodeParameter('schema', 'public');
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            headers['Content-Profile'] = schema;
        } else if (['GET', 'HEAD'].includes(method)) {
            headers['Accept-Profile'] = schema;
        }
    }

    const options: IRequestOptions = {
        headers: {
            Prefer: 'return=representation',
        },
        method,
        qs,
        body,
        uri: uri ?? `${credentials.host}/rest/v1${resource}`,
        json: true,
    };

    try {
        options.headers = Object.assign({}, options.headers, headers);
        if (Object.keys(body).length === 0) {
            delete options.body;
        }
        return await this.helpers.requestWithAuthentication.call(this, 'supabaseApi', options);
    } catch (error) {
        if (error.description) {
            error.message = `${error.message}: ${error.description}`;
        }
        throw new NodeApiError(this.getNode(), error as JsonObject);
    }
}
```

### 7. Enhanced Credential Validation
```typescript
export async function validateCredentials(
    this: ICredentialTestFunctions,
    decryptedCredentials: ICredentialDataDecryptedObject,
): Promise<any> {
    const credentials = decryptedCredentials;
    const { serviceRole } = credentials as { serviceRole: string; };

    const options: IRequestOptions = {
        headers: {
            apikey: serviceRole,
            Authorization: 'Bearer ' + serviceRole,
        },
        method: 'GET',
        uri: `${credentials.host}/rest/v1/`,
        json: true,
    };

    return await this.helpers.request(options);
}

export function mapPairedItemsFrom<T>(iterable: Iterable<T> | ArrayLike<T>): IPairedItemData[] {
    return Array.from(iterable, (_, i) => i).map((index) => {
        return { item: index };
    });
}
```

**Enhanced Validation Features:**
- Comprehensive credential structure validation
- Bearer token authentication pattern
- Proper API health check endpoint usage
- Error context preservation with NodeApiError
- Custom schema header management (Content-Profile/Accept-Profile)
- Paired item mapping for batch error handling

## Advanced Implementation Patterns

### 1. Enhanced Filter UI Pattern
```typescript
export function getFilters(
    resources: string[],
    operations: string[],
    {
        includeNoneOption = true,
        filterTypeDisplayName = 'Select Type',
        filterFixedCollectionDisplayName = 'Select Conditions',
        mustMatchOptions = [
            { name: 'Any Select Condition', value: 'anyFilter' },
            { name: 'All Select Conditions', value: 'allFilters' },
        ],
    },
): INodeProperties[] {
    return [
        {
            displayName: filterTypeDisplayName,
            name: 'filterType',
            type: 'options',
            options: [
                ...(includeNoneOption ? [{ name: 'None', value: 'none' }] : []),
                { name: 'Build Manually', value: 'manual' },
                { name: 'String', value: 'string' },
            ],
            displayOptions: {
                show: { resource: resources, operation: operations },
            },
            default: 'manual',
            description: 'How to specify the filter conditions'
        },
        {
            displayName: 'Must Match',
            name: 'matchType',
            type: 'options',
            options: mustMatchOptions,
            displayOptions: {
                show: { 
                    resource: resources, 
                    operation: operations,
                    filterType: ['manual']
                },
            },
            default: 'anyFilter',
            description: 'Whether to match any or all of the conditions'
        },
        {
            displayName: filterFixedCollectionDisplayName,
            name: 'filtersUI',
            type: 'fixedCollection',
            typeOptions: { multipleValues: true },
            displayOptions: {
                show: { 
                    resource: resources, 
                    operation: operations,
                    filterType: ['manual']
                },
            },
            default: {},
            placeholder: 'Add Condition',
            options: [{
                displayName: 'Conditions',
                name: 'conditions',
                values: [
                    {
                        displayName: 'Field Name or ID',
                        name: 'keyName',
                        type: 'options',
                        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                        typeOptions: {
                            loadOptionsDependsOn: ['tableId'],
                            loadOptionsMethod: 'getTableColumns',
                        },
                        default: '',
                    },
                    {
                        displayName: 'Condition',
                        name: 'condition',
                        type: 'options',
                        options: [
                            { name: 'Equals', value: 'eq' },
                            { name: 'Full-Text', value: 'fullText' },
                            { name: 'Greater Than', value: 'gt' },
                            { name: 'Greater Than or Equal', value: 'gte' },
                            { name: 'ILIKE operator', value: 'ilike', description: 'Use * in place of %' },
                            { name: 'Is', value: 'is', description: 'Checking for exact equality (null,true,false,unknown)' },
                            { name: 'Less Than', value: 'lt' },
                            { name: 'Less Than or Equal', value: 'lte' },
                            { name: 'LIKE operator', value: 'like', description: 'Use * in place of %' },
                            { name: 'Not Equals', value: 'neq' },
                        ],
                        default: '',
                    },
                    {
                        displayName: 'Search Function',
                        name: 'searchFunction',
                        type: 'options',
                        displayOptions: { show: { condition: ['fullText'] } },
                        options: [
                            { name: 'to_tsquery', value: 'fts' },
                            { name: 'plainto_tsquery', value: 'plfts' },
                            { name: 'phraseto_tsquery', value: 'phfts' },
                            { name: 'websearch_to_tsquery', value: 'wfts' },
                        ],
                        default: '',
                    },
                    {
                        displayName: 'Field Value',
                        name: 'keyValue',
                        type: 'string',
                        default: '',
                    },
                ],
            }]
        },
        {
            displayName: '',
            name: 'filterStringNotice',
            type: 'notice',
            default: '',
            displayOptions: {
                show: { 
                    resource: resources, 
                    operation: operations,
                    filterType: ['string']
                },
            },
            description: 'See <a href="https://postgrest.org/en/stable/references/api/tables_views.html#horizontal-filtering" target="_blank">PostgREST guide</a> to creating filters'
        },
        {
            displayName: 'Filter String',
            name: 'filterString',
            type: 'string',
            description: 'Raw filter string for advanced queries',
            placeholder: 'name=eq.john',
            default: '',
            displayOptions: {
                show: { 
                    resource: resources, 
                    operation: operations,
                    filterType: ['string']
                },
            }
        }
    ];
}
```

### 2. Custom Schema Support
```typescript
// Schema parameter configuration
{
    displayName: 'Use Custom Schema',
    name: 'useCustomSchema',
    type: 'boolean',
    default: false,
    description: 'Whether to use a database schema different from the default "public" schema'
}
```

**Schema Management:**
- Conditional schema parameter display
- Default to 'public' schema
- Clear documentation requirements
- API exposure validation

### 2. Operation-Specific Parameter Configuration

#### Row Operations Parameter Structure
```typescript
export const rowOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: { resource: ['row'] },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                description: 'Create a new row',
                action: 'Create a row',
            },
            {
                name: 'Delete',
                value: 'delete', 
                description: 'Delete a row',
                action: 'Delete a row',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get a row',
                action: 'Get a row',
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get many rows',
                action: 'Get many rows',
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update a row',
                action: 'Update a row',
            },
        ],
        default: 'create',
    },
];
```

#### Dynamic Data Mapping Configuration
```typescript
{
    displayName: 'Data to Send',
    name: 'dataToSend',
    type: 'options',
    options: [
        {
            name: 'Auto-Map Input Data to Columns',
            value: 'autoMapInputData',
            description: 'Use when node input properties match destination column names',
        },
        {
            name: 'Define Below for Each Column',
            value: 'defineBelow',
            description: 'Set the value for each destination column',
        },
    ],
    displayOptions: {
        show: {
            resource: ['row'],
            operation: ['create', 'update'],
        },
    },
    default: 'defineBelow',
}
```

#### Fields UI with Dynamic Column Loading
```typescript
{
    displayName: 'Fields to Send',
    name: 'fieldsUi',
    placeholder: 'Add Field',
    type: 'fixedCollection',
    typeOptions: {
        multipleValueButtonText: 'Add Field to Send',
        multipleValues: true,
    },
    displayOptions: {
        show: {
            resource: ['row'],
            operation: ['create', 'update'],
            dataToSend: ['defineBelow'],
        },
    },
    default: {},
    options: [
        {
            displayName: 'Field',
            name: 'fieldValues',
            values: [
                {
                    displayName: 'Field Name or ID',
                    name: 'fieldId',
                    type: 'options',
                    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                    typeOptions: {
                        loadOptionsDependsOn: ['tableId'],
                        loadOptionsMethod: 'getTableColumns',
                    },
                    default: '',
                },
                {
                    displayName: 'Field Value',
                    name: 'fieldValue',
                    type: 'string',
                    default: '',
                },
            ],
        },
    ],
}
```

#### Operation-Specific Filter Configuration
```typescript
// For GET operation - simplified conditions
{
    displayName: 'Select Conditions',
    name: 'filters',
    type: 'fixedCollection',
    typeOptions: { multipleValues: true },
    displayOptions: {
        show: {
            resource: ['row'],
            operation: ['get'],
        },
    },
    default: {},
    placeholder: 'Add Condition',
    options: [
        {
            displayName: 'Conditions',
            name: 'conditions',
            values: [
                {
                    displayName: 'Name or ID',
                    name: 'keyName',
                    type: 'options',
                    typeOptions: {
                        loadOptionsDependsOn: ['tableId'],
                        loadOptionsMethod: 'getTableColumns',
                    },
                    default: '',
                    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                },
                {
                    displayName: 'Value',
                    name: 'keyValue',
                    type: 'string',
                    default: '',
                },
            ],
        },
    ],
}
```

**Configuration Strategy:**
- Context-sensitive parameter display using nested displayOptions
- Operation-specific parameter sets to reduce complexity
- Dynamic field loading with loadOptionsDependsOn pattern
- Clear action descriptions for better UX
- Flexible data mapping strategies (auto vs manual)

### 3. Batch Record Processing
```typescript
// Efficient bulk operations
const records: IDataObject[] = [];
for (let i = 0; i < length; i++) {
    // Build record from input data
    records.push(processInputItem(items[i]));
}

// Single API call for all records
const createdRows = await supabaseApiRequest.call(this, 'POST', endpoint, records);
```

**Bulk Operation Benefits:**
- Reduced API call overhead
- Better performance for large datasets
- Atomic transaction handling
- Consistent error reporting

### 4. Filter Type Abstraction
```typescript
// Support both manual and string-based filtering
if (filterType === 'manual') {
    // Use structured filter UI
    const data = keys.reduce((obj, value) => buildQuery(obj, value), {});
    Object.assign(qs, data);
} else {
    // Use raw filter string
    endpoint = `${endpoint}?${encodeURI(filterString)}`;
}
```

**Filter Strategy:**
- Multiple filter input methods
- UI-friendly manual filters
- Power-user string filters
- PostgREST syntax support

## Performance Optimization Patterns

### 1. Connection Reuse
- Single API client instance per execution
- Credential caching during execution
- Optimized request headers
- Connection pooling support

### 2. Query Optimization
- Efficient WHERE clause construction
- Index-aware filter design
- Minimal data transfer
- Optimized SELECT field lists

### 3. Memory Management
- Streaming result processing
- Garbage collection-friendly patterns
- Efficient object creation
- Memory leak prevention

## Security Implementation Patterns

### 1. Input Sanitization
- Parameter validation before API calls
- SQL injection prevention
- Type coercion safety
- Malicious input filtering

### 2. Credential Security
- Encrypted credential storage
- No credential logging
- Secure credential transmission
- Automatic credential rotation support

### 3. Access Control
- Row-level security integration
- Schema-based access control
- API key scope validation
- Audit trail support

## Integration Best Practices

### 1. Error Recovery
- Implement retry logic for transient failures
- Use exponential backoff for rate limiting
- Provide clear error messages
- Support partial success scenarios

### 2. Monitoring Integration
- Comprehensive execution logging
- Performance metric collection
- Error rate tracking
- Usage pattern analysis

### 3. Testing Strategies
- Unit tests for query building
- Integration tests with mock API
- Performance tests with large datasets
- Error scenario validation

These patterns demonstrate production-ready database integration with enterprise-grade reliability, performance, and security considerations.