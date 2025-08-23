# Google Sheets Trigger - Usage Guide

## Overview
The Google Sheets Trigger monitors Google Sheets for data changes and automatically triggers workflows when rows are added, updated, or modified. It provides sophisticated change detection using Google Drive API revision tracking combined with flexible data processing capabilities.

## Configuration Options

### Authentication
```json
{
  "authentication": "triggerOAuth2",
  "credentials": {
    "googleSheetsTriggerOAuth2Api": {
      "id": "credential_id",
      "name": "Google Sheets OAuth2"
    }
  }
}
```

**Required Scopes:**
- `https://www.googleapis.com/auth/spreadsheets.readonly`
- `https://www.googleapis.com/auth/drive.readonly`

### Document Selection

#### From List (Recommended)
```json
{
  "documentId": {
    "mode": "list",
    "value": "spreadsheet_name"
  }
}
```

#### By URL
```json
{
  "documentId": {
    "mode": "url", 
    "value": "https://docs.google.com/spreadsheets/d/1abc123def456/edit"
  }
}
```

#### By ID
```json
{
  "documentId": {
    "mode": "id",
    "value": "1abc123def456ghi789"
  }
}
```

### Sheet Selection

#### From List
```json
{
  "sheetName": {
    "mode": "list",
    "value": "Sheet1"
  }
}
```

#### By URL with GID
```json
{
  "sheetName": {
    "mode": "url",
    "value": "https://docs.google.com/spreadsheets/d/1abc123/edit#gid=123456"
  }
}
```

#### By Sheet ID
```json
{
  "sheetName": {
    "mode": "id", 
    "value": "123456"
  }
}
```

## Trigger Events

### Row Added
Triggers when new rows are appended to the sheet.

```json
{
  "event": "rowAdded"
}
```

**Use Cases:**
- Form submissions
- New order processing
- Customer registration tracking
- Survey response handling

**Behavior:**
- Monitors row count changes
- Returns only newly added rows
- Uses index-based tracking
- Requires only view access

### Row Updated  
Triggers when existing row data is modified.

```json
{
  "event": "rowUpdate",
  "includeInOutput": "both",
  "options": {
    "columnsToWatch": ["status", "priority"]
  }
}
```

**Use Cases:**
- Task status changes
- Inventory updates
- Project milestone tracking
- Customer data modifications

**Behavior:**
- Requires edit access to document
- Compares revision data
- Can monitor specific columns
- Returns old and/or new versions

### Row Added or Updated
Combines both add and update detection.

```json
{
  "event": "anyUpdate",
  "includeInOutput": "new"
}
```

**Use Cases:**
- Complete data synchronization
- Comprehensive change auditing
- Real-time dashboard updates
- Data pipeline triggers

## Data Location Configuration

### Specify Range (A1 Notation)
```json
{
  "options": {
    "dataLocationOnSheet": {
      "values": {
        "rangeDefinition": "specifyRangeA1",
        "range": "A1:E100"
      }
    }
  }
}
```

**Examples:**
- `"A:Z"` - All columns, all rows
- `"A1:C10"` - Specific rectangular range
- `"B2:E"` - Columns B-E, starting from row 2
- `"A:A"` - Single column A

### Specify Range (Rows)
```json
{
  "options": {
    "dataLocationOnSheet": {
      "values": {
        "rangeDefinition": "specifyRange",
        "headerRow": 1,
        "firstDataRow": 2
      }
    }
  }
}
```

**Parameters:**
- `headerRow`: Row containing column headers (1-indexed)
- `firstDataRow`: First row containing actual data (1-indexed)

## Output Configuration

### Include in Output Options

#### New Version Only (Default)
```json
{
  "includeInOutput": "new"
}
```
Returns only the current/updated version of changed rows.

#### Old Version Only
```json
{
  "includeInOutput": "old" 
}
```
Returns the previous version of changed rows (useful for change tracking).

#### Both Versions
```json
{
  "includeInOutput": "both"
}
```
Returns both old and new versions in the output.

### Value Rendering Options

#### Unformatted Values (Default)
```json
{
  "options": {
    "valueRender": "UNFORMATTED_VALUE"
  }
}
```
- Raw cell values without formatting
- Numbers as numbers, dates as serial numbers
- Best for data processing and calculations

#### Formatted Values
```json
{
  "options": {
    "valueRender": "FORMATTED_VALUE"
  }
}
```
- Values formatted according to cell formatting
- Respects number formats, date formats, currency
- Best for display and reporting

#### Formula Values
```json
{
  "options": {
    "valueRender": "FORMULA"
  }
}
```
- Returns the actual formulas instead of calculated values
- Useful for formula analysis and replication

### DateTime Rendering

#### Serial Number (Default)
```json
{
  "options": {
    "dateTimeRenderOption": "SERIAL_NUMBER"
  }
}
```
Returns dates as Excel-style serial numbers (e.g., 44562.0).

#### Formatted String
```json
{
  "options": {
    "dateTimeRenderOption": "FORMATTED_STRING"
  }
}
```
Returns dates as formatted strings according to spreadsheet locale.

## Advanced Configuration

### Column Watching
Monitor only specific columns for changes:

```json
{
  "event": "rowUpdate",
  "options": {
    "columnsToWatch": ["status", "priority", "assignee"]
  }
}
```

**Benefits:**
- Reduces false positives
- Improves performance
- Focuses on relevant changes
- Prevents triggering on cosmetic changes

### Custom Range Monitoring
```json
{
  "options": {
    "dataLocationOnSheet": {
      "values": {
        "rangeDefinition": "specifyRangeA1",
        "range": "B2:G50"
      }
    }
  }
}
```

**Use Cases:**
- Monitor specific data sections
- Exclude header/footer areas
- Focus on critical data ranges
- Optimize processing for large sheets

## Common Use Cases

### 1. Form Response Processing
```json
{
  "event": "rowAdded",
  "options": {
    "dataLocationOnSheet": {
      "values": {
        "rangeDefinition": "specifyRange", 
        "headerRow": 1,
        "firstDataRow": 2
      }
    },
    "valueRender": "FORMATTED_VALUE"
  }
}
```

### 2. Task Management Updates
```json
{
  "event": "rowUpdate",
  "includeInOutput": "both",
  "options": {
    "columnsToWatch": ["status", "assignee", "due_date"],
    "valueRender": "FORMATTED_VALUE",
    "dateTimeRenderOption": "FORMATTED_STRING"
  }
}
```

### 3. Inventory Tracking
```json
{
  "event": "anyUpdate",
  "includeInOutput": "new",
  "options": {
    "dataLocationOnSheet": {
      "values": {
        "rangeDefinition": "specifyRangeA1",
        "range": "A1:F1000"
      }
    },
    "columnsToWatch": ["quantity", "status", "location"]
  }
}
```

### 4. Customer Data Synchronization
```json
{
  "event": "anyUpdate",
  "includeInOutput": "both",
  "options": {
    "valueRender": "UNFORMATTED_VALUE",
    "dateTimeRenderOption": "SERIAL_NUMBER"
  }
}
```

## Output Data Format

### Single Row Addition
```json
[
  {
    "id": "123",
    "name": "John Doe", 
    "email": "john@example.com",
    "status": "active",
    "created_date": "2023-12-01"
  }
]
```

### Row Update (Both Versions)
```json
[
  {
    "id": "123",
    "name": "John Doe",
    "status": "inactive", // old version
    "updated_date": "2023-11-30"
  },
  {
    "id": "123", 
    "name": "John Doe",
    "status": "active", // new version
    "updated_date": "2023-12-01"
  }
]
```

### Multiple Row Changes
```json
[
  {
    "id": "123",
    "name": "John Doe",
    "status": "active"
  },
  {
    "id": "124", 
    "name": "Jane Smith",
    "status": "pending"
  }
]
```

## Error Handling

### Permission Errors
**Error**: "User does not have sufficient permissions for file"

**Solution**: 
- Request edit access to the document for row update/any update events
- Use "Row Added" event if only view access is available
- Verify OAuth2 credentials include necessary scopes

### Sheet Name Validation
**Error**: "Sheet name is too long choose a name with 31 characters or less"

**Solution**:
- Keep sheet names under 31 characters
- Use sheet ID mode for sheets with long names
- Consider renaming sheets for better compatibility

### Range Validation
**Error**: "Not a valid range"

**Solution**:
- Use proper A1 notation (e.g., "A1:C10", "A:Z")
- Verify column letters and row numbers are valid
- Check that range exists within sheet bounds

### API Rate Limits
**Behavior**: Automatic retry with exponential backoff

**Best Practices**:
- Avoid extremely frequent polling
- Use column watching to reduce API calls
- Monitor API quota usage in Google Cloud Console

## Best Practices

### Configuration
1. **Start Simple**: Begin with basic row added monitoring
2. **Refine Gradually**: Add column watching and custom ranges as needed
3. **Test Thoroughly**: Verify trigger behavior in manual execution mode
4. **Document Setup**: Record configuration choices for team members

### Performance
1. **Use Column Watching**: Monitor only relevant columns
2. **Optimize Ranges**: Limit monitoring to necessary data areas
3. **Choose Appropriate Rendering**: Use unformatted values for processing
4. **Monitor API Usage**: Track quota consumption and optimize accordingly

### Error Prevention
1. **Verify Permissions**: Ensure appropriate access levels
2. **Validate Ranges**: Test range specifications before deployment
3. **Handle Empty Data**: Prepare for empty cells and missing headers
4. **Test Edge Cases**: Verify behavior with various data scenarios

### Workflow Design
1. **Error Handling**: Include error nodes for API failures
2. **Data Validation**: Validate incoming data before processing
3. **Logging**: Track trigger events for debugging and monitoring
4. **Fallback Logic**: Handle cases where expected data is missing