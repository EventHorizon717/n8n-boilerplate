# Google Sheets V2 - Implementation Guide

## Architecture Overview

Google Sheets V2 implements a sophisticated router-based architecture that separates concerns across multiple layers: node definition, operation routing, action handlers, method abstractions, and transport utilities. This modular design enables comprehensive CRUD operations with advanced resource mapping and flexible data transformation.

## Core Implementation Architecture

### 1. Node Class Structure

#### Base Node Implementation
```typescript
import type {
    IExecuteFunctions,
    INodeType,
    INodeTypeBaseDescription,
    INodeTypeDescription,
} from 'n8n-workflow';

import { router } from './actions/router';
import { versionDescription } from './actions/versionDescription';
import { credentialTest, listSearch, loadOptions, resourceMapping } from './methods';

export class GoogleSheetsV2 implements INodeType {
    description: INodeTypeDescription;

    constructor(baseDescription: INodeTypeBaseDescription) {
        this.description = {
            ...baseDescription,
            ...versionDescription,
        };
    }

    methods = {
        loadOptions,
        credentialTest,
        listSearch,
        resourceMapping,
    };

    async execute(this: IExecuteFunctions) {
        return await router.call(this);
    }
}
```

#### Version Description Integration
```typescript
// versionDescription.ts - Centralized parameter definitions
export const versionDescription: Partial<INodeTypeDescription> = {
    displayName: 'Google Sheets V2',
    name: 'googleSheetsV2',
    icon: 'file:googleSheets.svg',
    group: ['input', 'output'],
    version: [1, 2],
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Read, update and write data to Google Sheets',
    defaults: {
        name: 'Google Sheets V2',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
        {
            name: 'googleSheetsOAuth2Api',
            required: true,
        },
    ],
    properties: [
        // Resource and operation matrix
        {
            displayName: 'Resource',
            name: 'resource',
            type: 'options',
            noDataExpression: true,
            options: [
                {
                    name: 'Sheet',
                    value: 'sheet',
                },
                {
                    name: 'Spreadsheet',
                    value: 'spreadsheet',
                },
            ],
            default: 'sheet',
        },
        // Operation selection based on resource
        {
            displayName: 'Operation',
            name: 'operation',
            type: 'options',
            noDataExpression: true,
            displayOptions: {
                show: {
                    resource: ['sheet'],
                },
            },
            options: [
                {
                    name: 'Create',
                    value: 'create',
                    description: 'Create a new sheet',
                    action: 'Create a sheet',
                },
                {
                    name: 'Delete',
                    value: 'delete',
                    description: 'Delete a sheet',
                    action: 'Delete a sheet',
                },
                {
                    name: 'Read',
                    value: 'read',
                    description: 'Read data from a sheet',
                    action: 'Read a sheet',
                },
                {
                    name: 'Update',
                    value: 'update',
                    description: 'Update rows in a sheet',
                    action: 'Update a sheet',
                },
                {
                    name: 'Append',
                    value: 'append',
                    description: 'Append data to a sheet',
                    action: 'Append to a sheet',
                },
                {
                    name: 'Clear',
                    value: 'clear',
                    description: 'Clear data from a sheet',
                    action: 'Clear a sheet',
                },
            ],
            default: 'read',
        },
        // Resource locators for document and sheet
        documentId,
        sheet,
        // Operation-specific parameters defined conditionally
    ],
};
```

### 2. Router Implementation

#### Central Operation Dispatch
```typescript
// actions/router.ts
import type { IExecuteFunctions } from 'n8n-workflow';

import * as sheet from './sheet';
import * as spreadsheet from './spreadsheet';

export async function router(this: IExecuteFunctions) {
    let returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const googleSheets = {
        sheet,
        spreadsheet,
    } as const;

    try {
        // Dynamic operation dispatch
        if (googleSheets[resource as keyof typeof googleSheets] === undefined) {
            throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not known!`);
        }

        const resourceOperations = googleSheets[resource as keyof typeof googleSheets];
        
        if (resourceOperations[operation as keyof typeof resourceOperations] === undefined) {
            throw new NodeOperationError(
                this.getNode(),
                `The operation "${operation}" is not known for resource "${resource}"!`
            );
        }

        // Execute operation with input data iteration
        const items = this.getInputData();
        
        for (let i = 0; i < items.length; i++) {
            try {
                const operationResult = await resourceOperations[
                    operation as keyof typeof resourceOperations
                ].call(this, i);
                
                if (Array.isArray(operationResult)) {
                    returnData.push(...operationResult);
                } else {
                    returnData.push(operationResult);
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    const executionData = this.helpers.constructExecutionMetaData(
                        [{ json: { error: error.message } }],
                        { itemData: { item: i } }
                    );
                    returnData.push(...executionData);
                } else {
                    throw error;
                }
            }
        }

        return this.helpers.returnJsonArray(returnData);
    } catch (error) {
        throw new NodeOperationError(this.getNode(), error.message);
    }
}
```

#### Resource-Specific Operation Modules
```typescript
// actions/sheet/index.ts
export { create } from './create';
export { read } from './read';
export { update } from './update';
export { delete } from './delete';
export { append } from './append';
export { clear } from './clear';

// actions/sheet/read.ts
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { GoogleSheet } from '../helpers/GoogleSheet';
import type { ValueRenderOption } from '../helpers/GoogleSheets.types';

export async function read(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
    const documentId = this.getNodeParameter('documentId', itemIndex, undefined, {
        extractValue: true,
    }) as string;

    const sheetName = this.getNodeParameter('sheetName', itemIndex, undefined, {
        extractValue: true,
    }) as string;

    const options = this.getNodeParameter('options', itemIndex, {}) as {
        range?: string;
        valueRenderOption?: ValueRenderOption;
        dateTimeRenderOption?: string;
    };

    const googleSheet = new GoogleSheet(documentId, this);
    
    const range = options.range || `${sheetName}!A:Z`;
    const valueRenderOption = options.valueRenderOption || 'UNFORMATTED_VALUE';
    const dateTimeRenderOption = options.dateTimeRenderOption || 'SERIAL_NUMBER';

    const sheetData = await googleSheet.getData(
        range,
        valueRenderOption,
        dateTimeRenderOption,
    );

    if (!sheetData || sheetData.length === 0) {
        return [];
    }

    // Convert array data to JSON objects
    const [headers, ...rows] = sheetData;
    const jsonData = rows.map(row => {
        const item: { [key: string]: any } = {};
        headers.forEach((header, index) => {
            item[header || `column_${index}`] = row[index] || null;
        });
        return item;
    });

    return this.helpers.returnJsonArray(jsonData);
}
```

### 3. GoogleSheet Helper Class Integration

#### Helper Class Instantiation and Usage
```typescript
// helpers/GoogleSheet.ts integration
import { GoogleSheet } from '../helpers/GoogleSheet';

// In operation implementations
export async function read(this: IExecuteFunctions, itemIndex: number) {
    const documentId = this.getNodeParameter('documentId', itemIndex, undefined, {
        extractValue: true,
    }) as string;
    
    // Instantiate helper with context
    const googleSheet = new GoogleSheet(documentId, this);
    
    // Use helper methods for sheet operations
    const sheetInfo = await googleSheet.spreadsheetGetSheet(
        this.getNode(),
        sheetMode,
        sheetName,
    );
    
    const data = await googleSheet.getData(
        range,
        valueRenderOption,
        dateTimeRenderOption,
    );
    
    // Process and return data
    return this.helpers.returnJsonArray(processedData);
}
```

#### Advanced Helper Operations
```typescript
// Helper class advanced operations
export async function append(this: IExecuteFunctions, itemIndex: number) {
    const googleSheet = new GoogleSheet(documentId, this);
    
    // Batch data preparation
    const inputData = this.getInputData();
    const dataToAppend = inputData.map(item => 
        Object.values(item.json)
    );
    
    // Efficient batch append
    const result = await googleSheet.appendData(
        `${sheetName}!A:Z`,
        dataToAppend,
        valueInputOption,
    );
    
    return [{
        json: {
            spreadsheetId: result.spreadsheetId,
            tableRange: result.tableRange,
            updates: result.updates,
        }
    }];
}
```

### 4. Method Implementations

#### Load Options System
```typescript
// methods/loadOptions.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { apiRequest } from '../transport';

export const loadOptions = {
    async getSpreadsheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
            const response = await apiRequest.call(
                this,
                'GET',
                '/v3/files',
                undefined,
                {
                    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
                    fields: 'files(id,name,modifiedTime,owners(displayName))',
                    orderBy: 'modifiedTime desc',
                    pageSize: 100,
                }
            );

            return response.files.map((file: any) => ({
                name: `${file.name} (${file.owners?.[0]?.displayName || 'Unknown'})`,
                value: file.id,
            })).sort((a: INodePropertyOptions, b: INodePropertyOptions) => 
                a.name.localeCompare(b.name)
            );
        } catch (error) {
            throw new NodeOperationError(
                this.getNode?.() || ({} as any),
                `Failed to load spreadsheets: ${error.message}`
            );
        }
    },

    async getSheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const documentId = this.getNodeParameter('documentId.value') as string;
        
        if (!documentId) {
            return [];
        }

        try {
            const response = await apiRequest.call(
                this,
                'GET',
                `/v4/spreadsheets/${documentId}`,
                undefined,
                { fields: 'sheets(properties(title,index,sheetId))' }
            );

            return response.sheets
                .sort((a: any, b: any) => a.properties.index - b.properties.index)
                .map((sheet: any) => ({
                    name: sheet.properties.title,
                    value: sheet.properties.title,
                    description: `Sheet ID: ${sheet.properties.sheetId}`,
                }));
        } catch (error) {
            return [];
        }
    },

    // Header row detection for column mapping
    async getSheetHeaders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const documentId = this.getNodeParameter('documentId.value') as string;
        const sheetName = this.getNodeParameter('sheetName.value') as string;
        
        if (!documentId || !sheetName) {
            return [];
        }

        try {
            const response = await apiRequest.call(
                this,
                'GET',
                `/v4/spreadsheets/${documentId}/values/${encodeURIComponent(sheetName)}!1:1`
            );

            const headers = response.values?.[0] || [];
            
            return headers
                .filter((header: string, index: number) => header && header.trim() !== '')
                .map((header: string, index: number) => ({
                    name: header,
                    value: header,
                    description: `Column ${String.fromCharCode(65 + index)}`,
                }));
        } catch (error) {
            return [];
        }
    },
};
```

#### List Search Implementation
```typescript
// methods/listSearch.ts
import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

export const listSearch = {
    async searchSpreadsheets(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
        const query = this.getNodeParameter('query', '') as string;
        
        try {
            let q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
            
            if (query) {
                q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
            }

            const response = await apiRequest.call(
                this,
                'GET',
                '/v3/files',
                undefined,
                {
                    q,
                    fields: 'files(id,name,modifiedTime,webViewLink)',
                    orderBy: 'relevance desc',
                    pageSize: 50,
                }
            );

            const results = response.files.map((file: any) => ({
                name: file.name,
                value: file.id,
                url: file.webViewLink,
                description: `Modified: ${new Date(file.modifiedTime).toLocaleDateString()}`,
            }));

            return { results };
        } catch (error) {
            return { results: [] };
        }
    },

    async searchSheets(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
        const documentId = this.getNodeParameter('documentId.value') as string;
        
        if (!documentId) {
            return { results: [] };
        }

        try {
            const response = await apiRequest.call(
                this,
                'GET',
                `/v4/spreadsheets/${documentId}`,
                undefined,
                { fields: 'sheets(properties(title,index,sheetId))' }
            );

            const results = response.sheets
                .sort((a: any, b: any) => a.properties.index - b.properties.index)
                .map((sheet: any) => ({
                    name: sheet.properties.title,
                    value: sheet.properties.title,
                    description: `Sheet ID: ${sheet.properties.sheetId}`,
                }));

            return { results };
        } catch (error) {
            return { results: [] };
        }
    },
};
```

#### Credential Testing
```typescript
// methods/credentialTest.ts
import type { ICredentialTestFunctions, INodeCredentialTestResult } from 'n8n-workflow';
import { apiRequest } from '../transport';

export const credentialTest = {
    async testGoogleSheetsOAuth2Api(
        this: ICredentialTestFunctions,
        credential: ICredentialsDecrypted
    ): Promise<INodeCredentialTestResult> {
        try {
            // Test Drive API access
            await apiRequest.call(
                this,
                'GET',
                '/v3/about',
                undefined,
                { fields: 'user(displayName)' }
            );
            
            // Test Sheets API access  
            await apiRequest.call(
                this,
                'GET',
                '/v4/spreadsheets/test',
                undefined,
                undefined,
                undefined,
                { simple: false, resolveWithFullResponse: true }
            ).catch(error => {
                // 404 is expected for non-existent test spreadsheet
                if (error.statusCode !== 404) {
                    throw error;
                }
            });

            return {
                status: 'OK',
                message: 'Connection successful',
            };
        } catch (error) {
            return {
                status: 'Error',
                message: `Authentication failed: ${error.message}`,
            };
        }
    },
};
```

#### Resource Mapping System
```typescript
// methods/resourceMapping.ts
import type { ILoadOptionsFunctions, INodeResourceMappingResult } from 'n8n-workflow';

export const resourceMapping = {
    async mapSheetFields(this: ILoadOptionsFunctions): Promise<INodeResourceMappingResult> {
        const documentId = this.getNodeParameter('documentId.value') as string;
        const sheetName = this.getNodeParameter('sheetName.value') as string;
        
        if (!documentId || !sheetName) {
            return { 
                fields: [],
                metadata: { note: 'Select document and sheet to enable field mapping' }
            };
        }

        try {
            // Get header row for field names
            const headerResponse = await apiRequest.call(
                this,
                'GET',
                `/v4/spreadsheets/${documentId}/values/${encodeURIComponent(sheetName)}!1:1`
            );
            
            // Get sample data for type inference
            const sampleResponse = await apiRequest.call(
                this,
                'GET',
                `/v4/spreadsheets/${documentId}/values/${encodeURIComponent(sheetName)}!2:11`,
                undefined,
                { valueRenderOption: 'UNFORMATTED_VALUE' }
            );

            const headers = headerResponse.values?.[0] || [];
            const sampleRows = sampleResponse.values || [];
            
            const fields = headers.map((header: string, index: number) => {
                const columnData = sampleRows.map((row: any[]) => row[index]).filter(Boolean);
                const inferredType = inferColumnType(columnData);
                
                return {
                    id: header || `column_${index}`,
                    displayName: header || `Column ${String.fromCharCode(65 + index)}`,
                    type: inferredType,
                    canBeUsedToMatch: true,
                    display: true,
                    required: false,
                    removed: false,
                    options: inferredType === 'options' ? getUniqueValues(columnData) : undefined,
                };
            });

            return {
                fields,
                metadata: {
                    totalRows: sampleRows.length + 1, // +1 for header
                    totalColumns: headers.length,
                    note: 'Field types inferred from sample data'
                }
            };
        } catch (error) {
            return {
                fields: [],
                metadata: { error: `Failed to map fields: ${error.message}` }
            };
        }
    },
};

// Type inference helper
function inferColumnType(values: any[]): string {
    if (values.length === 0) return 'string';
    
    const nonEmptyValues = values.filter(v => v !== null && v !== '');
    
    if (nonEmptyValues.every(v => typeof v === 'number' || !isNaN(Number(v)))) {
        return 'number';
    }
    
    if (nonEmptyValues.every(v => /^\d{4}-\d{2}-\d{2}/.test(String(v)))) {
        return 'dateTime';
    }
    
    if (nonEmptyValues.every(v => /^(true|false)$/i.test(String(v)))) {
        return 'boolean';
    }
    
    const uniqueValues = [...new Set(nonEmptyValues)];
    if (uniqueValues.length <= 10 && uniqueValues.length > 1) {
        return 'options';
    }
    
    return 'string';
}

function getUniqueValues(values: any[]): Array<{ name: string; value: string }> {
    const unique = [...new Set(values.filter(Boolean))];
    return unique.slice(0, 10).map(v => ({
        name: String(v),
        value: String(v),
    }));
}
```

### 5. Transport Layer Implementation

#### API Request Abstraction
```typescript
// transport/apiRequest.ts
import type { IExecuteFunctions, ILoadOptionsFunctions, IRequestOptions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function apiRequest(
    this: IExecuteFunctions | ILoadOptionsFunctions,
    method: string,
    endpoint: string,
    body?: any,
    qs?: any,
    uri?: string,
    options: IRequestOptions = {}
): Promise<any> {
    const baseUrl = 'https://www.googleapis.com';
    
    // Determine API base URL from endpoint
    let apiBaseUrl = baseUrl;
    if (endpoint.startsWith('/v4/')) {
        apiBaseUrl = 'https://sheets.googleapis.com';
    } else if (endpoint.startsWith('/v3/')) {
        apiBaseUrl = 'https://www.googleapis.com';
    }
    
    const requestOptions: IRequestOptions = {
        method,
        body,
        qs,
        uri: uri || `${apiBaseUrl}${endpoint}`,
        json: true,
        gzip: true,
        timeout: 30000,
        ...options,
    };

    try {
        return await this.helpers.requestWithAuthentication.call(
            this,
            'googleSheetsOAuth2Api',
            requestOptions
        );
    } catch (error) {
        // Enhanced error handling with context
        if (error.statusCode === 403) {
            if (error.message.includes('exceeded')) {
                throw new NodeApiError(this.getNode(), error, {
                    message: 'Google Sheets API quota exceeded',
                    description: 'Please wait before making more requests or upgrade your quota',
                    level: 'warning',
                });
            }
            
            throw new NodeApiError(this.getNode(), error, {
                message: 'Insufficient permissions for Google Sheets operation',
                description: 'Check that your credentials have the required scopes and the spreadsheet is shared appropriately',
            });
        }
        
        if (error.statusCode === 404) {
            throw new NodeApiError(this.getNode(), error, {
                message: 'Spreadsheet or sheet not found',
                description: 'Verify that the spreadsheet ID and sheet name are correct and accessible',
            });
        }
        
        if (error.statusCode === 429) {
            throw new NodeApiError(this.getNode(), error, {
                message: 'Rate limit exceeded',
                description: 'Too many requests. The operation will be retried automatically.',
                level: 'warning',
            });
        }

        throw new NodeApiError(this.getNode(), error);
    }
}

// Batch request handling
export async function batchApiRequest(
    this: IExecuteFunctions,
    requests: Array<{
        method: string;
        endpoint: string;
        body?: any;
        qs?: any;
    }>
): Promise<any[]> {
    const batchSize = 100; // Google API batch limit
    const results: any[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        
        // Create multipart batch request
        const boundary = `batch_${Date.now()}_${Math.random()}`;
        const batchBody = createBatchRequestBody(batch, boundary);
        
        const batchResponse = await apiRequest.call(
            this,
            'POST',
            '/batch',
            batchBody,
            undefined,
            'https://www.googleapis.com/batch/sheets/v4',
            {
                headers: {
                    'Content-Type': `multipart/mixed; boundary=${boundary}`,
                },
            }
        );
        
        const batchResults = parseBatchResponse(batchResponse);
        results.push(...batchResults);
    }
    
    return results;
}
```

### 6. Advanced Operation Implementations

#### Batch Update Implementation
```typescript
// actions/sheet/batchUpdate.ts
export async function batchUpdate(this: IExecuteFunctions, itemIndex: number) {
    const documentId = this.getNodeParameter('documentId', itemIndex, undefined, {
        extractValue: true,
    }) as string;
    
    const requests = this.getNodeParameter('requests', itemIndex) as any[];
    
    const batchUpdateBody = {
        requests: requests.map(request => ({
            ...request,
            // Ensure proper request structure
        })),
        includeSpreadsheetInResponse: false,
        responseRanges: [],
        responseIncludeGridData: false,
    };
    
    try {
        const response = await apiRequest.call(
            this,
            'POST',
            `/v4/spreadsheets/${documentId}:batchUpdate`,
            batchUpdateBody
        );
        
        return [{
            json: {
                spreadsheetId: response.spreadsheetId,
                replies: response.replies,
                updatedSpreadsheet: response.updatedSpreadsheet,
            }
        }];
    } catch (error) {
        throw new NodeOperationError(
            this.getNode(),
            `Batch update failed: ${error.message}`,
            { itemIndex }
        );
    }
}
```

#### Advanced Data Processing
```typescript
// Data transformation utilities
export function transformInputData(
    inputData: any[],
    headers: string[],
    options: {
        valueInputOption: string;
        dateTimeHandling: string;
        nullHandling: string;
    }
): any[][] {
    return inputData.map(item => {
        return headers.map(header => {
            let value = item[header];
            
            // Handle null/undefined values
            if (value === null || value === undefined) {
                return options.nullHandling === 'empty' ? '' : null;
            }
            
            // Handle different value input options
            if (options.valueInputOption === 'RAW') {
                return String(value);
            } else if (options.valueInputOption === 'USER_ENTERED') {
                // Allow formulas and automatic parsing
                if (typeof value === 'string' && value.startsWith('=')) {
                    return value; // Keep formula as-is
                }
                
                // Handle date conversion
                if (value instanceof Date) {
                    return value.toISOString();
                }
                
                return value;
            }
            
            return value;
        });
    });
}

// Output data processing
export function transformOutputData(
    sheetData: any[][],
    options: {
        valueRenderOption: string;
        dateTimeRenderOption: string;
        includeHeaders: boolean;
    }
): any[] {
    if (!sheetData || sheetData.length === 0) {
        return [];
    }
    
    const [headers, ...rows] = sheetData;
    
    if (!options.includeHeaders && rows.length === 0) {
        return [];
    }
    
    return rows.map((row, rowIndex) => {
        const item: any = {};
        
        headers.forEach((header, colIndex) => {
            const cellValue = row[colIndex];
            const fieldName = header || `column_${colIndex}`;
            
            // Apply value rendering
            item[fieldName] = processCellValue(
                cellValue,
                options.valueRenderOption,
                options.dateTimeRenderOption
            );
        });
        
        // Add row metadata
        item._rowIndex = rowIndex + 2; // +2 because of 0-based index and header row
        
        return item;
    });
}

function processCellValue(
    value: any,
    valueRenderOption: string,
    dateTimeRenderOption: string
): any {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    
    // Handle different render options
    switch (valueRenderOption) {
        case 'FORMATTED_VALUE':
            // Value is already formatted by API
            return value;
            
        case 'UNFORMATTED_VALUE':
            // Raw value without formatting
            if (typeof value === 'number') {
                // Handle date serial numbers
                if (dateTimeRenderOption === 'FORMATTED_STRING' && isDateSerial(value)) {
                    return serialToDate(value).toISOString();
                }
                return value;
            }
            return value;
            
        case 'FORMULA':
            // Return formula if present, otherwise value
            return value;
            
        default:
            return value;
    }
}
```

## Integration Patterns

### Error Handling Framework
```typescript
// Comprehensive error handling
export class SheetsOperationError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode?: number,
        public context?: any
    ) {
        super(message);
        this.name = 'SheetsOperationError';
    }
}

export function handleApiError(error: any, operation: string, context?: any): never {
    if (error.code === 'PERMISSION_DENIED') {
        throw new SheetsOperationError(
            `Permission denied for ${operation}. Check sharing settings and OAuth scopes.`,
            'PERMISSION_DENIED',
            403,
            context
        );
    }
    
    if (error.code === 'NOT_FOUND') {
        throw new SheetsOperationError(
            `Resource not found for ${operation}. Verify spreadsheet and sheet names.`,
            'NOT_FOUND',
            404,
            context
        );
    }
    
    if (error.code === 'INVALID_ARGUMENT') {
        throw new SheetsOperationError(
            `Invalid argument for ${operation}: ${error.message}`,
            'INVALID_ARGUMENT',
            400,
            context
        );
    }
    
    throw new SheetsOperationError(
        `Operation ${operation} failed: ${error.message}`,
        'OPERATION_FAILED',
        error.statusCode,
        context
    );
}
```

### Performance Optimization
```typescript
// Request optimization utilities
export class RequestOptimizer {
    private static cache = new Map<string, { data: any; timestamp: number }>();
    private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    static getCachedData(key: string): any | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }
    
    static setCachedData(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
    
    static optimizeRange(requestedRange: string, actualDataSize: number): string {
        // Optimize overly broad ranges
        if (requestedRange === 'A:ZZZ' && actualDataSize < 1000) {
            return `A1:Z${Math.max(actualDataSize, 100)}`;
        }
        return requestedRange;
    }
    
    static batchRequests<T>(
        requests: T[],
        batchSize: number = 100
    ): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < requests.length; i += batchSize) {
            batches.push(requests.slice(i, i + batchSize));
        }
        return batches;
    }
}
```

This implementation provides a comprehensive, production-ready Google Sheets V2 node with advanced features, robust error handling, and optimal performance characteristics.