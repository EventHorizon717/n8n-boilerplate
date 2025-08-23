# Supabase Node - Implementation Guide

## Overview
Complete implementation guidance for building robust Supabase database nodes with comprehensive CRUD operations, dynamic schema discovery, enterprise-grade error handling, and advanced PostgREST integration featuring full-text search and complex filtering capabilities.

## Core Architecture

### Node Class Structure
```typescript
export class Supabase implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Supabase',
        name: 'supabase',
        icon: 'file:supabase.svg',
        group: ['input'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Add, get, delete and update data in a table',
        defaults: { name: 'Supabase' },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        usableAsTool: true,
        credentials: [{ name: 'supabaseApi', required: true, testedBy: 'supabaseApiCredentialTest' }],
        properties: [/* Parameter definitions */]
    };
}
```

### Essential Imports
```typescript
import type {
    ICredentialDataDecryptedObject,
    ICredentialTestFunctions,
    IDataObject,
    IExecuteFunctions,
    IHookFunctions,
    ILoadOptionsFunctions,
    IWebhookFunctions,
    INodeProperties,
    IPairedItemData,
    JsonObject,
    IHttpRequestMethods,
    IRequestOptions,
    INodeCredentialTestResult,
    INodeExecutionData,
    INodePropertyOptions,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
```

## Parameter Definition Patterns

### Core Resource and Operation Parameters
```typescript
// Resource selection
{
    displayName: 'Resource',
    name: 'resource',
    type: 'options',
    noDataExpression: true,
    options: [{ name: 'Row', value: 'row' }],
    default: 'row'
},

// Operation selection with enhanced structure from RowDescription.ts
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
}
```

### Dynamic Schema Support
```typescript
{
    displayName: 'Use Custom Schema',
    name: 'useCustomSchema',
    type: 'boolean',
    default: false,
    noDataExpression: true,
    description: 'Whether to use a database schema different from the default "public" schema'
},
{
    displayName: 'Schema',
    name: 'schema',
    type: 'string',
    default: 'public',
    description: 'Name of database schema to use for table',
    displayOptions: { show: { useCustomSchema: [true] } }
}
```

### Enhanced Table and Column Loading from RowDescription.ts
```typescript
// Table selection with dependency loading
{
    displayName: 'Table Name or ID',
    name: 'tableId',
    type: 'options',
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    typeOptions: {
        loadOptionsDependsOn: ['useCustomSchema', 'schema'],
        loadOptionsMethod: 'getTables',
    },
    required: true,
    displayOptions: {
        show: {
            resource: ['row'],
            operation: ['create', 'delete', 'get', 'getAll', 'update'],
        },
    },
    default: '',
},

// Field selection with table dependency
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
}
```

### Enhanced Data Input Configuration from RowDescription.ts
```typescript
// Data mapping strategy selection
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
},

// Input exclusion for auto-mapping
{
    displayName: 'Inputs to Ignore',
    name: 'inputsToIgnore',
    type: 'string',
    displayOptions: {
        show: {
            resource: ['row'],
            operation: ['create', 'update'],
            dataToSend: ['autoMapInputData'],
        },
    },
    default: '',
    description: 'List of input properties to avoid sending, separated by commas. Leave empty to send all properties.',
    placeholder: 'Enter properties...',
},

// Enhanced fields UI with better UX
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

### Operation-Specific Filter Configuration from RowDescription.ts
```typescript
// Simple filters for GET operation
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
},

// Advanced filters for getAll, delete, update operations with getFilters pattern
// This demonstrates the sophisticated filtering from GenericFunctions.getFilters()
{
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    noDataExpression: true,
    displayOptions: {
        show: {
            resource: ['row'],
            operation: ['getAll'],
        },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
},
{
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
        show: {
            resource: ['row'],
            operation: ['getAll'],
            returnAll: [false],
        },
    },
    typeOptions: {
        minValue: 1,
    },
    default: 50,
    description: 'Max number of results to return',
}
```

## Method Implementation Patterns

### Dynamic Table Discovery
```typescript
methods = {
    loadOptions: {
        async getTables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
            const returnData: INodePropertyOptions[] = [];
            
            try {
                const { paths } = await supabaseApiRequest.call(this, 'GET', '/');
                
                for (const path of Object.keys(paths as IDataObject)) {
                    if (path === '/') continue; // Skip introspection path
                    
                    returnData.push({
                        name: path.replace('/', ''),
                        value: path.replace('/', '')
                    });
                }
                
                return returnData.sort((a, b) => a.name.localeCompare(b.name));
            } catch (error) {
                throw new NodeOperationError(this.getNode(), 
                    `Failed to load tables: ${error.message}`);
            }
        }
    }
};
```

### Column Metadata Loading
```typescript
async getTableColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const returnData: INodePropertyOptions[] = [];
    const tableName = this.getCurrentNodeParameter('tableId') as string;
    
    if (!tableName) {
        return returnData;
    }
    
    try {
        const { definitions } = await supabaseApiRequest.call(this, 'GET', '/');
        const tableDefinition = definitions[tableName];
        
        if (!tableDefinition || !tableDefinition.properties) {
            throw new Error(`Table '${tableName}' not found or has no columns`);
        }
        
        for (const column of Object.keys(tableDefinition.properties as IDataObject)) {
            const columnType = tableDefinition.properties[column].type;
            returnData.push({
                name: `${column} - (${columnType})`,
                value: column
            });
        }
        
        return returnData.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        throw new NodeOperationError(this.getNode(), 
            `Failed to load columns for table '${tableName}': ${error.message}`);
    }
}
```

### Credential Testing Implementation
```typescript
credentialTest: {
    async supabaseApiCredentialTest(
        this: ICredentialTestFunctions,
        credential: ICredentialsDecrypted,
    ): Promise<INodeCredentialTestResult> {
        try {
            // Validate credentials by making a test API call
            await validateCredentials.call(this, credential.data as ICredentialDataDecryptedObject);
            
            return {
                status: 'OK',
                message: 'Connection successful!'
            };
        } catch (error) {
            const errorMessage = error.message || 'The Service Key is invalid';
            return {
                status: 'Error',
                message: errorMessage
            };
        }
    }
}
```

## CRUD Operation Implementation

### Create Operation
```typescript
if (operation === 'create') {
    const records: IDataObject[] = [];
    
    for (let i = 0; i < length; i++) {
        const record: IDataObject = {};
        const dataToSend = this.getNodeParameter('dataToSend', i) as 'defineBelow' | 'autoMapInputData';
        
        if (dataToSend === 'autoMapInputData') {
            // Auto-map all input fields
            const incomingKeys = Object.keys(items[i].json);
            const rawInputsToIgnore = this.getNodeParameter('inputsToIgnore', i) as string;
            const inputDataToIgnore = rawInputsToIgnore.split(',').map(c => c.trim()).filter(c => c);
            
            for (const key of incomingKeys) {
                if (inputDataToIgnore.includes(key)) continue;
                record[key] = items[i].json[key];
            }
        } else {
            // Use manually defined fields
            const fields = this.getNodeParameter('fieldsUi.fieldValues', i, []) as FieldsUiValues;
            
            for (const field of fields) {
                if (field.fieldId && field.fieldValue !== undefined) {
                    record[field.fieldId] = field.fieldValue;
                }
            }
        }
        
        records.push(record);
    }
    
    const endpoint = `/${tableId}`;
    
    try {
        const createdRows = await supabaseApiRequest.call(this, 'POST', endpoint, records);
        
        // Handle single record vs array response
        const rowsArray = Array.isArray(createdRows) ? createdRows : [createdRows];
        
        rowsArray.forEach((row, i) => {
            const executionData = this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray(row),
                { itemData: { item: i } }
            );
            returnData.push(...executionData);
        });
    } catch (error) {
        if (this.continueOnFail()) {
            const executionData = this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray({ error: error.message }),
                { itemData: mapPairedItemsFrom(records) }
            );
            returnData.push(...executionData);
        } else {
            throw new NodeOperationError(this.getNode(), 
                `Failed to create records: ${error.message}`);
        }
    }
}
```

### Read Operations (Get/GetAll)
```typescript
if (operation === 'get' || operation === 'getAll') {
    const endpoint = `/${tableId}`;
    const returnAll = operation === 'getAll' ? this.getNodeParameter('returnAll', 0) : false;
    
    for (let i = 0; i < length; i++) {
        let qs: IDataObject = {};
        
        // Build filter conditions
        const filterType = this.getNodeParameter('filterType', i) as string;
        
        if (filterType === 'manual') {
            const matchType = this.getNodeParameter('matchType', i) as string;
            const conditions = this.getNodeParameter('filters.conditions', i, []) as IDataObject[];
            
            if (operation === 'get' && !conditions.length) {
                throw new NodeOperationError(this.getNode(),
                    'At least one filter condition must be defined for get operation',
                    { itemIndex: i });
            }
            
            if (conditions.length > 0) {
                if (matchType === 'allFilters') {
                    const data = conditions.reduce((obj, value) => buildQuery(obj, value), {});
                    Object.assign(qs, data);
                } else {
                    const data = conditions.map(condition => buildOrQuery(condition));
                    Object.assign(qs, { or: `(${data.join(',')})` });
                }
            }
        } else if (filterType === 'string') {
            const filterString = this.getNodeParameter('filterString', i) as string;
            if (filterString) {
                // Parse and apply string filter
                const params = new URLSearchParams(filterString);
                params.forEach((value, key) => {
                    qs[key] = value;
                });
            }
        }
        
        // Apply pagination for getAll
        if (operation === 'getAll' && !returnAll) {
            qs.limit = this.getNodeParameter('limit', i);
        }
        
        try {
            let rows: IDataObject[] = [];
            
            if (operation === 'getAll' && returnAll) {
                // Handle pagination automatically
                let responseLength = 0;
                do {
                    const newRows = await supabaseApiRequest.call(this, 'GET', endpoint, {}, qs);
                    responseLength = newRows.length;
                    rows = rows.concat(newRows);
                    qs.offset = rows.length;
                } while (responseLength >= 1000);
            } else {
                rows = await supabaseApiRequest.call(this, 'GET', endpoint, {}, qs);
            }
            
            const executionData = this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray(rows),
                { itemData: { item: i } }
            );
            returnData.push(...executionData);
        } catch (error) {
            if (this.continueOnFail()) {
                const executionData = this.helpers.constructExecutionMetaData(
                    this.helpers.returnJsonArray({ error: error.message }),
                    { itemData: { item: i } }
                );
                returnData.push(...executionData);
            } else {
                throw new NodeOperationError(this.getNode(), 
                    `Failed to retrieve records: ${error.message}`, { itemIndex: i });
            }
        }
    }
}
```

### Update Operation
```typescript
if (operation === 'update') {
    const filterType = this.getNodeParameter('filterType', 0) as string;
    let endpoint = `/${tableId}`;
    
    for (let i = 0; i < length; i++) {
        let qs: IDataObject = {};
        
        // Build filter conditions (same as read operations)
        if (filterType === 'manual') {
            const matchType = this.getNodeParameter('matchType', i) as string;
            const conditions = this.getNodeParameter('filters.conditions', i, []) as IDataObject[];
            
            if (!conditions.length) {
                throw new NodeOperationError(this.getNode(),
                    'At least one filter condition must be defined for update operation',
                    { itemIndex: i });
            }
            
            if (matchType === 'allFilters') {
                const data = conditions.reduce((obj, value) => buildQuery(obj, value), {});
                Object.assign(qs, data);
            } else {
                const data = conditions.map(condition => buildOrQuery(condition));
                Object.assign(qs, { or: `(${data.join(',')})` });
            }
        }
        
        // Build update data (same as create operation)
        const record: IDataObject = {};
        const dataToSend = this.getNodeParameter('dataToSend', i) as 'defineBelow' | 'autoMapInputData';
        
        if (dataToSend === 'autoMapInputData') {
            const incomingKeys = Object.keys(items[i].json);
            const rawInputsToIgnore = this.getNodeParameter('inputsToIgnore', i) as string;
            const inputDataToIgnore = rawInputsToIgnore.split(',').map(c => c.trim()).filter(c => c);
            
            for (const key of incomingKeys) {
                if (inputDataToIgnore.includes(key)) continue;
                record[key] = items[i].json[key];
            }
        } else {
            const fields = this.getNodeParameter('fieldsUi.fieldValues', i, []) as FieldsUiValues;
            for (const field of fields) {
                if (field.fieldId && field.fieldValue !== undefined) {
                    record[field.fieldId] = field.fieldValue;
                }
            }
        }
        
        try {
            const updatedRows = await supabaseApiRequest.call(this, 'PATCH', endpoint, record, qs);
            
            const executionData = this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray(updatedRows as IDataObject[]),
                { itemData: { item: i } }
            );
            returnData.push(...executionData);
        } catch (error) {
            if (this.continueOnFail()) {
                const executionData = this.helpers.constructExecutionMetaData(
                    this.helpers.returnJsonArray({ error: error.message }),
                    { itemData: { item: i } }
                );
                returnData.push(...executionData);
            } else {
                throw new NodeOperationError(this.getNode(), 
                    `Failed to update records: ${error.message}`, { itemIndex: i });
            }
        }
    }
}
```

### Delete Operation
```typescript
if (operation === 'delete') {
    const filterType = this.getNodeParameter('filterType', 0) as string;
    
    for (let i = 0; i < length; i++) {
        let endpoint = `/${tableId}`;
        let qs: IDataObject = {};
        
        // Build filter conditions (required for delete)
        if (filterType === 'manual') {
            const matchType = this.getNodeParameter('matchType', i) as string;
            const conditions = this.getNodeParameter('filters.conditions', i, []) as IDataObject[];
            
            if (!conditions.length) {
                throw new NodeOperationError(this.getNode(),
                    'At least one filter condition must be defined for delete operation',
                    { itemIndex: i });
            }
            
            if (matchType === 'allFilters') {
                const data = conditions.reduce((obj, value) => buildQuery(obj, value), {});
                Object.assign(qs, data);
            } else {
                const data = conditions.map(condition => buildOrQuery(condition));
                Object.assign(qs, { or: `(${data.join(',')})` });
            }
        } else if (filterType === 'string') {
            const filterString = this.getNodeParameter('filterString', i) as string;
            if (filterString) {
                endpoint = `${endpoint}?${encodeURI(filterString)}`;
            }
        }
        
        try {
            const deletedRows = await supabaseApiRequest.call(this, 'DELETE', endpoint, {}, qs);
            
            const executionData = this.helpers.constructExecutionMetaData(
                this.helpers.returnJsonArray(deletedRows as IDataObject[]),
                { itemData: { item: i } }
            );
            returnData.push(...executionData);
        } catch (error) {
            if (this.continueOnFail()) {
                const executionData = this.helpers.constructExecutionMetaData(
                    this.helpers.returnJsonArray({ error: error.message }),
                    { itemData: { item: i } }
                );
                returnData.push(...executionData);
            } else {
                throw new NodeOperationError(this.getNode(), 
                    `Failed to delete records: ${error.message}`, { itemIndex: i });
            }
        }
    }
}
```

## Helper Function Implementation

### Enhanced Query Building Functions with Full-Text Search
```typescript
const mapOperations: { [key: string]: string } = {
    create: 'created',
    update: 'updated',
    getAll: 'retrieved',
    delete: 'deleted',
};

export const buildQuery = (obj: IDataObject, value: IDataObject) => {
    if (value.condition === 'fullText') {
        return Object.assign(obj, {
            [`${value.keyName}`]: `${value.searchFunction}.${value.keyValue}`,
        });
    }
    return Object.assign(obj, { [`${value.keyName}`]: `${value.condition}.${value.keyValue}` });
};

export const buildOrQuery = (key: IDataObject) => {
    if (key.condition === 'fullText') {
        return `${key.keyName}.${key.searchFunction}.${key.keyValue}`;
    }
    return `${key.keyName}.${key.condition}.${key.keyValue}`;
};

export const buildGetQuery = (obj: IDataObject, value: IDataObject) => {
    return Object.assign(obj, { [`${value.keyName}`]: `eq.${value.keyValue}` });
};

export function mapPairedItemsFrom<T>(iterable: Iterable<T> | ArrayLike<T>): IPairedItemData[] {
    return Array.from(iterable, (_, i) => i).map((index) => {
        return { item: index };
    });
}

### Enhanced API Request Function
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

    // Enhanced custom schema support with proper headers
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
```

## Best Practices for Implementation

### 1. Error Handling
- Always provide meaningful error messages
- Use NodeOperationError for user-facing errors
- Include item index in batch operation errors
- Support continue-on-fail for resilient workflows

### 2. Type Safety
- Define TypeScript interfaces for complex parameter types
- Use proper type assertions with validation
- Handle undefined/null values gracefully
- Validate parameter types before processing

### 3. Performance Optimization
- Implement efficient pagination for large datasets
- Cache schema information when possible
- Use batch operations for bulk data processing
- Minimize API calls through intelligent query building

### 4. Security Considerations
- Never log sensitive credential information
- Validate and sanitize all user input
- Use parameterized queries to prevent injection
- Follow principle of least privilege for API access

### 5. User Experience
- Provide clear parameter descriptions
- Use conditional parameter display with displayOptions
- Implement helpful error messages with contextual information
- Support both beginner and advanced use cases
- Include PostgREST documentation links for advanced filtering

### 6. Advanced Filter Implementation
- Implement comprehensive filter UI using the getFilters helper function
- Support all PostgREST operators: eq, neq, gt, gte, lt, lte, like, ilike, is
- Full-text search integration with PostgreSQL functions (fts, plfts, phfts, wfts)
- Dynamic field loading with loadOptionsDependsOn for type safety
- Proper AND/OR logic handling with mustMatchOptions

### 7. Enhanced Schema Management
- Custom schema support with proper Content-Profile and Accept-Profile headers
- Dynamic table and column discovery with error handling
- Credential validation with Bearer token authentication
- Proper error context preservation with NodeApiError

This implementation guide provides the foundation for building robust, production-ready Supabase nodes with comprehensive database operation support, advanced filtering capabilities, and full PostgREST integration.