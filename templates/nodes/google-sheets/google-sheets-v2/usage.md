# Google Sheets V2 - Usage Guide

## Overview
Google Sheets V2 provides comprehensive CRUD operations for Google Sheets with a router-based architecture, advanced resource mapping, and flexible data transformation capabilities. It supports multiple resources (Sheet, Spreadsheet, Row, Column) with full operation matrices for each.

## Authentication Setup

### OAuth2 Configuration
```json
{
  "authentication": "googleSheetsOAuth2Api",
  "credentials": {
    "googleSheetsOAuth2Api": {
      "id": "credential_id",
      "name": "Google Sheets OAuth2"
    }
  }
}
```

**Required Scopes:**
- `https://www.googleapis.com/auth/spreadsheets` (Full access)
- `https://www.googleapis.com/auth/drive.file` (File access)

**Optional Scopes (for extended functionality):**
- `https://www.googleapis.com/auth/drive` (Full Drive access)
- `https://www.googleapis.com/auth/spreadsheets.readonly` (Read-only access)

## Resource and Operation Matrix

### Sheet Resource Operations

#### Read Sheet Data
```json
{
  "resource": "sheet",
  "operation": "read",
  "documentId": { "mode": "list", "value": "My Spreadsheet" },
  "sheetName": { "mode": "list", "value": "Sheet1" },
  "options": {
    "range": "A1:Z1000",
    "valueRenderOption": "FORMATTED_VALUE",
    "dateTimeRenderOption": "FORMATTED_STRING"
  }
}
```

**Use Cases:**
- Data extraction for processing
- Report generation
- Data synchronization
- Analytics and visualization

#### Append Data to Sheet
```json
{
  "resource": "sheet",
  "operation": "append",
  "documentId": { "mode": "id", "value": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" },
  "sheetName": { "mode": "list", "value": "Data" },
  "options": {
    "valueInputOption": "USER_ENTERED",
    "insertDataOption": "INSERT_ROWS",
    "range": "A:E"
  }
}
```

**Input Data Format:**
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com", 
    "age": 30,
    "city": "New York",
    "status": "Active"
  }
]
```

#### Update Specific Range
```json
{
  "resource": "sheet", 
  "operation": "update",
  "documentId": { "mode": "url", "value": "https://docs.google.com/spreadsheets/d/abc123/edit" },
  "sheetName": { "mode": "list", "value": "Updates" },
  "options": {
    "range": "A2:C10",
    "valueInputOption": "RAW"
  }
}
```

#### Clear Sheet Range
```json
{
  "resource": "sheet",
  "operation": "clear",
  "documentId": { "mode": "list", "value": "Working Sheet" },
  "sheetName": { "mode": "list", "value": "Temp Data" },
  "options": {
    "range": "A1:Z1000"
  }
}
```

### Spreadsheet Resource Operations

#### Create New Spreadsheet
```json
{
  "resource": "spreadsheet",
  "operation": "create",
  "options": {
    "title": "Project Data Analysis",
    "sheets": [
      {
        "properties": {
          "title": "Raw Data",
          "gridProperties": {
            "rowCount": 1000,
            "columnCount": 20
          }
        }
      },
      {
        "properties": {
          "title": "Summary",
          "gridProperties": {
            "rowCount": 100,
            "columnCount": 10
          }
        }
      }
    ]
  }
}
```

#### Read Spreadsheet Metadata
```json
{
  "resource": "spreadsheet",
  "operation": "read",
  "documentId": { "mode": "id", "value": "spreadsheet_id" },
  "options": {
    "includeGridData": false,
    "ranges": ["Sheet1!A1:A1"],
    "fields": "properties,sheets.properties"
  }
}
```

#### Copy Spreadsheet
```json
{
  "resource": "spreadsheet",
  "operation": "copy",
  "documentId": { "mode": "list", "value": "Template Spreadsheet" },
  "options": {
    "title": "Monthly Report - December 2023",
    "parents": ["folder_id"]
  }
}
```

### Row Resource Operations

#### Read Specific Rows
```json
{
  "resource": "row",
  "operation": "read",
  "documentId": { "mode": "list", "value": "Customer Database" },
  "sheetName": { "mode": "list", "value": "Customers" },
  "options": {
    "rowNumbers": [5, 10, 15],
    "valueRenderOption": "FORMATTED_VALUE"
  }
}
```

#### Insert New Row
```json
{
  "resource": "row",
  "operation": "create",
  "documentId": { "mode": "id", "value": "spreadsheet_id" },
  "sheetName": { "mode": "list", "value": "Orders" },
  "options": {
    "insertIndex": 2,
    "inheritFromBefore": true
  }
}
```

#### Update Row Data
```json
{
  "resource": "row",
  "operation": "update", 
  "documentId": { "mode": "list", "value": "Inventory" },
  "sheetName": { "mode": "list", "value": "Products" },
  "options": {
    "rowNumber": 15,
    "data": {
      "product_name": "Updated Product",
      "quantity": 100,
      "price": 29.99
    }
  }
}
```

#### Delete Rows
```json
{
  "resource": "row",
  "operation": "delete",
  "documentId": { "mode": "list", "value": "Task Manager" },
  "sheetName": { "mode": "list", "value": "Completed Tasks" },
  "options": {
    "startIndex": 10,
    "endIndex": 20
  }
}
```

### Column Resource Operations

#### Read Column Data
```json
{
  "resource": "column",
  "operation": "read",
  "documentId": { "mode": "list", "value": "Sales Data" },
  "sheetName": { "mode": "list", "value": "Q4 Results" },
  "options": {
    "columnRange": "A:C",
    "valueRenderOption": "UNFORMATTED_VALUE"
  }
}
```

#### Insert New Column
```json
{
  "resource": "column",
  "operation": "create",
  "documentId": { "mode": "id", "value": "spreadsheet_id" },
  "sheetName": { "mode": "list", "value": "Analysis" },
  "options": {
    "insertIndex": 3,
    "inheritFromBefore": false
  }
}
```

## Advanced Configuration Options

### Value Input Options

#### RAW Mode
```json
{
  "options": {
    "valueInputOption": "RAW"
  }
}
```
- Values stored exactly as provided
- No formula interpretation
- No automatic data type conversion
- Best for: Preserving exact text, preventing formula injection

#### USER_ENTERED Mode
```json
{
  "options": {
    "valueInputOption": "USER_ENTERED"
  }
}
```
- Values parsed as if typed in Google Sheets UI
- Formulas are interpreted and executed
- Automatic date/number recognition
- Best for: Interactive data entry simulation

### Value Render Options

#### FORMATTED_VALUE (Default)
```json
{
  "options": {
    "valueRenderOption": "FORMATTED_VALUE"
  }
}
```
- Returns formatted values according to cell formatting
- Respects number formats, date formats, currency
- Best for: Display purposes, reports, user-facing data

#### UNFORMATTED_VALUE
```json
{
  "options": {
    "valueRenderOption": "UNFORMATTED_VALUE"
  }
}
```
- Returns raw cell values without formatting
- Numbers as numbers, dates as serial numbers
- Best for: Data processing, calculations, analysis

#### FORMULA
```json
{
  "options": {
    "valueRenderOption": "FORMULA"
  }
}
```
- Returns actual formulas instead of calculated values
- Useful for formula analysis and replication
- Best for: Template copying, formula auditing

### Date/Time Rendering

#### SERIAL_NUMBER (Default)
```json
{
  "options": {
    "dateTimeRenderOption": "SERIAL_NUMBER"
  }
}
```
- Returns dates as Excel-style serial numbers
- Precise for calculations
- Example: 44562.0 for 2022-01-01

#### FORMATTED_STRING
```json
{
  "options": {
    "dateTimeRenderOption": "FORMATTED_STRING"
  }
}
```
- Returns dates as formatted strings
- Respects spreadsheet locale settings
- Example: "1/1/2022" or "01/01/2022"

### Range Specifications

#### Full Sheet Access
```json
{
  "options": {
    "range": "A:Z"  // All data in columns A through Z
  }
}
```

#### Specific Rectangle
```json
{
  "options": {
    "range": "B2:E10"  // Specific rectangular range
  }
}
```

#### Multiple Ranges
```json
{
  "options": {
    "ranges": ["A1:C10", "F1:H10", "Summary!A1:B5"]
  }
}
```

#### Named Ranges
```json
{
  "options": {
    "range": "DataRange"  // Previously defined named range
  }
}
```

## Resource Locator Patterns

### Document Selection Methods

#### By List (Recommended)
```json
{
  "documentId": {
    "mode": "list",
    "value": "Human Readable Spreadsheet Name"
  }
}
```
- Shows user-friendly names
- Includes modification dates
- Searchable interface
- Best for: User interaction, team collaboration

#### By URL
```json
{
  "documentId": {
    "mode": "url",
    "value": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
  }
}
```
- Direct URL input
- Automatic ID extraction
- URL validation
- Best for: Quick setup, URL sharing

#### By ID
```json
{
  "documentId": {
    "mode": "id",
    "value": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
  }
}
```
- Direct spreadsheet ID
- Most efficient for API calls
- No additional lookups required
- Best for: Performance-critical workflows

### Sheet Selection Methods

#### By List
```json
{
  "sheetName": {
    "mode": "list",
    "value": "Data Sheet"
  }
}
```
- Dynamic loading based on selected document
- Shows all available sheets
- Ordered by sheet index

#### By URL with GID
```json
{
  "sheetName": {
    "mode": "url", 
    "value": "https://docs.google.com/spreadsheets/d/abc123/edit#gid=123456"
  }
}
```
- Sheet-specific URL with gid parameter
- Automatic gid extraction
- Direct sheet linking

#### By Sheet ID
```json
{
  "sheetName": {
    "mode": "id",
    "value": "123456"
  }
}
```
- Numeric sheet ID (gid)
- Most reliable for API operations
- No name dependency

## Common Use Cases and Examples

### 1. Data Import/Export Pipeline

#### Import Data from External Source
```json
{
  "resource": "sheet",
  "operation": "append",
  "documentId": { "mode": "list", "value": "Data Warehouse" },
  "sheetName": { "mode": "list", "value": "Imports" },
  "options": {
    "valueInputOption": "USER_ENTERED",
    "insertDataOption": "INSERT_ROWS"
  }
}
```

#### Export Processed Data
```json
{
  "resource": "sheet",
  "operation": "read",
  "documentId": { "mode": "list", "value": "Reports" },
  "sheetName": { "mode": "list", "value": "Weekly Summary" },
  "options": {
    "range": "A1:H1000",
    "valueRenderOption": "FORMATTED_VALUE",
    "dateTimeRenderOption": "FORMATTED_STRING"
  }
}
```

### 2. Dynamic Report Generation

#### Create Report Spreadsheet
```json
{
  "resource": "spreadsheet",
  "operation": "create",
  "options": {
    "title": "Monthly Sales Report - {{ $now.format('MMMM YYYY') }}",
    "sheets": [
      {
        "properties": {
          "title": "Summary",
          "tabColor": { "red": 0.2, "green": 0.6, "blue": 1.0 }
        }
      },
      {
        "properties": {
          "title": "Details",
          "gridProperties": { "frozenRowCount": 1 }
        }
      }
    ]
  }
}
```

#### Populate Report Data
```json
{
  "resource": "sheet",
  "operation": "update",
  "documentId": { "mode": "id", "value": "{{ $('Create Report').first().json.spreadsheetId }}" },
  "sheetName": { "mode": "list", "value": "Summary" },
  "options": {
    "range": "A1:E20",
    "valueInputOption": "USER_ENTERED"
  }
}
```

### 3. Real-time Dashboard Updates

#### Read Current Metrics
```json
{
  "resource": "sheet",
  "operation": "read",
  "documentId": { "mode": "list", "value": "Live Dashboard" },
  "sheetName": { "mode": "list", "value": "Metrics" },
  "options": {
    "range": "A2:F2",
    "valueRenderOption": "UNFORMATTED_VALUE"
  }
}
```

#### Update Specific Metrics
```json
{
  "resource": "sheet",
  "operation": "update",
  "documentId": { "mode": "list", "value": "Live Dashboard" },
  "sheetName": { "mode": "list", "value": "Metrics" },
  "options": {
    "range": "B2",
    "valueInputOption": "RAW"
  }
}
```

### 4. Data Validation and Cleanup

#### Read Raw Data
```json
{
  "resource": "sheet",
  "operation": "read",
  "documentId": { "mode": "list", "value": "Customer Data" },
  "sheetName": { "mode": "list", "value": "Raw Import" },
  "options": {
    "range": "A:J",
    "valueRenderOption": "UNFORMATTED_VALUE"
  }
}
```

#### Write Cleaned Data
```json
{
  "resource": "sheet",
  "operation": "clear",
  "documentId": { "mode": "list", "value": "Customer Data" },
  "sheetName": { "mode": "list", "value": "Processed" },
  "options": {
    "range": "A:J"
  }
},
{
  "resource": "sheet",
  "operation": "append",
  "documentId": { "mode": "list", "value": "Customer Data" },
  "sheetName": { "mode": "list", "value": "Processed" },
  "options": {
    "valueInputOption": "USER_ENTERED"
  }
}
```

## Error Handling Patterns

### Permission Errors
**Error**: "The caller does not have permission"

**Solutions:**
- Verify spreadsheet sharing permissions
- Check OAuth2 credential scopes
- Ensure document is accessible to authenticated user
- Request appropriate access levels (view/edit)

### Range Validation Errors
**Error**: "Unable to parse range"

**Solutions:**
- Use valid A1 notation (A1:C10, A:C, 1:5)
- Verify sheet name exists and is correctly spelled
- Check for special characters in sheet names
- Use sheet ID mode for sheets with complex names

### Data Format Errors
**Error**: "Invalid values[0][1]: Invalid value"

**Solutions:**
- Validate data types before sending
- Use appropriate valueInputOption (RAW vs USER_ENTERED)
- Handle null/undefined values properly
- Implement data transformation before API calls

### Rate Limit Handling
**Behavior**: Automatic retry with exponential backoff

**Best Practices:**
- Monitor API quota usage
- Use batch operations for bulk data
- Implement circuit breaker patterns
- Cache frequently accessed data

## Performance Optimization

### Batch Operations
```json
{
  "resource": "sheet",
  "operation": "batchUpdate",
  "options": {
    "requests": [
      {
        "updateCells": {
          "range": "A1:C100",
          "rows": [/* bulk data */],
          "fields": "userEnteredValue"
        }
      }
    ]
  }
}
```

### Efficient Range Usage
```json
{
  "options": {
    "range": "A1:E1000"  // Specific range instead of A:Z
  }
}
```

### Selective Field Requests
```json
{
  "options": {
    "fields": "sheets(properties(title,sheetId))"  // Only required fields
  }
}
```

## Best Practices

### Configuration
1. **Use List Mode**: Start with list mode for user-friendly selection
2. **Validate Ranges**: Always validate A1 notation before deployment
3. **Handle Empty Data**: Prepare for empty cells and missing sheets
4. **Test Permissions**: Verify access levels match operation requirements

### Performance
1. **Batch Similar Operations**: Group related API calls together
2. **Use Specific Ranges**: Avoid full-sheet operations when possible
3. **Cache Metadata**: Store spreadsheet/sheet information when available
4. **Monitor Quotas**: Track API usage and implement appropriate limits

### Error Prevention
1. **Input Validation**: Validate all data before API calls
2. **Graceful Degradation**: Handle partial failures appropriately
3. **Clear Error Messages**: Provide actionable error information
4. **Retry Logic**: Implement intelligent retry strategies

### Data Integrity
1. **Use Appropriate Input Options**: Choose RAW vs USER_ENTERED based on needs
2. **Validate Schema**: Ensure data matches expected structure
3. **Handle Type Conversions**: Properly convert data types for intended use
4. **Backup Critical Operations**: Consider backup strategies for important data