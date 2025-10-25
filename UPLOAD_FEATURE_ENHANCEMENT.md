# CSV Upload Feature Enhancement

## Overview
Enhanced the CSV upload functionality in the admin interview guide editor with a modern modal popup, drag & drop support, and comprehensive validation with error highlighting.

## Features Implemented

### 1. **Modal Popup Interface**
- Beautiful modal dialog that opens when clicking "Upload CSV"
- Clean, user-friendly interface
- Proper dialog structure with title, content, and actions

### 2. **Drag & Drop Functionality**
- Drag and drop CSV files directly onto the upload area
- Visual feedback when dragging files over the drop zone
- Border color changes and hover effects
- Large cloud upload icon for better UX

### 3. **File Selection Options**
- Click to browse and select files
- Drag and drop files
- Accepts only `.csv` files
- Shows clear instructions about file format requirements

### 4. **Comprehensive Validation**
- **Header Validation**: Checks for required columns (Question, Answer, Category)
- **Row-by-Row Validation**: Validates each question individually
- **Field Requirements**: 
  - Question field must not be empty
  - Answer field must not be empty
  - Category field must not be empty
  - Question length must not exceed 500 characters
- **Real-time Error Detection**: Shows errors as soon as file is processed

### 5. **Visual Error Highlighting**
- **Color-Coded Preview**:
  - ✅ **Valid rows**: Green border and light green background
  - ❌ **Invalid rows**: Red border and light red background
- **Status Chips**: Each row shows a "Valid" or "Invalid" chip
- **Row Numbers**: Displays the CSV row number for easy reference
- **Error Messages**: Shows specific validation errors for each invalid row
- **Error Summary**: Displays total count of valid/invalid questions at the top

### 6. **Preview System**
- Shows preview of all parsed questions before import
- Displays:
  - Row number
  - Validation status (Valid/Invalid)
  - Question text
  - Category
  - Tags
  - Specific error messages for invalid rows
- Scrollable list for large CSV files
- Shows first 10 errors in summary (if more, shows count)

### 7. **Smart Import**
- Only imports valid questions
- Skips invalid rows automatically
- Shows count of questions that will be imported
- "Import X Valid Questions" button is disabled if no valid questions found
- Clears modal after successful import

### 8. **Processing States**
- **Initial State**: Shows drag & drop zone with upload button
- **Processing State**: Shows "Processing file..." with file name
- **Preview State**: Shows validation results and preview
- Smooth transitions between states

### 9. **Enhanced CSV Parsing**
- Handles quoted fields with commas
- Handles escaped quotes (`""`)
- Converts `\n` escape sequences to actual newlines
- Properly parses:
  - Order numbers
  - Tags (comma-separated)
  - References (comma-separated)
  - Code examples with newlines
  - Empty optional fields

## User Interface Components

### Upload Button
```tsx
<Button
  variant="outlined"
  startIcon={<UploadIcon />}
  onClick={() => setUploadModal(prev => ({ ...prev, open: true }))}
>
  Upload CSV
</Button>
```

### Drag & Drop Zone
- Large cloud upload icon (48px)
- "Drag and drop your CSV file here" heading
- "or" divider
- "Choose File" button
- Format instructions in small text

### Validation Summary
```
File: filename.csv
Total rows: 20 | Valid: 18 | Invalid: 2
```

### Error List
- Shows up to 10 errors with:
  - Row number
  - Field name
  - Error message
- Indicates if there are more errors

### Preview List
Each row shows:
- Valid/Invalid chip (color-coded)
- Row number from CSV
- Question text (or "(empty)" if missing)
- Category and tags
- Specific validation errors for invalid rows

## Validation Rules

### Required Fields
1. **Question**: Must not be empty
2. **Answer**: Must not be empty
3. **Category**: Must not be empty

### Optional Fields
- Order (defaults to sequential if not provided)
- Tags (can be empty)
- Code Example (can be empty)
- References (can be empty)

### Length Limits
- Question: Maximum 500 characters
- Other fields: No explicit limits

### CSV Format
```csv
Order,Question,Answer,Category,Tags,Code Example,References
1,"Question text","Answer text","Category","tag1, tag2","code\nexample","ref1, ref2"
```

## File Structure

### Modified File
- `/src/app/admin/interview-guides/[id]/page.tsx`

### New State Variables
```typescript
interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParsedQuestion extends Question {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

const [uploadModal, setUploadModal] = useState({
  open: false,
  isDragging: false,
  file: null as File | null,
  parsedData: [] as ParsedQuestion[],
  validationErrors: [] as ValidationError[],
  isProcessing: false,
});
```

### New Functions
1. `handleFileUpload(file: File)` - Main file processing function
2. `handleDragOver(e: React.DragEvent)` - Drag over handler
3. `handleDragLeave(e: React.DragEvent)` - Drag leave handler
4. `handleDrop(e: React.DragEvent)` - Drop handler
5. `handleConfirmUpload()` - Confirm and import valid questions
6. `handleCancelUpload()` - Close modal and reset state

## User Experience Flow

1. **User clicks "Upload CSV"** → Modal opens with drag & drop zone
2. **User drags file or clicks "Choose File"** → File is selected
3. **System processes file** → Shows "Processing..." state
4. **Validation completes** → Shows:
   - Summary (total, valid, invalid counts)
   - Error list (if any errors)
   - Preview of all rows with visual indicators
5. **User reviews results** → Can see which rows are valid/invalid and why
6. **User clicks "Import X Valid Questions"** → Valid questions added to form
7. **Success message shown** → Modal closes, questions appear in list

## Benefits

### For Users
- ✅ **Clear Feedback**: Know exactly which rows have issues
- ✅ **Visual Indicators**: Color-coded rows for quick scanning
- ✅ **Error Details**: Specific error messages for each problem
- ✅ **Flexible Input**: Both drag & drop and file browser
- ✅ **Safe Import**: Only valid data gets imported
- ✅ **Preview First**: Review before confirming

### For Developers
- ✅ **Maintainable Code**: Well-structured modal component
- ✅ **Type Safety**: Full TypeScript types
- ✅ **Reusable Validation**: Centralized validation logic
- ✅ **Extensible**: Easy to add more validation rules
- ✅ **Testable**: Clear separation of concerns

## CSV File Example

### Valid CSV (using flattened format)
```csv
Order,Question,Answer,Category,Tags,Code Example,References
1,"What is Node.js?","Node.js is a JavaScript runtime built on Chrome's V8 engine.",Core Concepts,"nodejs, basics","const http = require('http');\nconsole.log('Hello');",https://nodejs.org
```

### CSV with Errors
- Missing Question → Red highlight, shows "Question field is empty"
- Missing Answer → Red highlight, shows "Answer field is empty"
- Missing Category → Red highlight, shows "Category field is empty"
- Question too long → Red highlight, shows "Question exceeds maximum length"

## Technical Details

### Material-UI Components Used
- Dialog, DialogTitle, DialogContent, DialogActions
- Box, Typography, Button
- Alert, List, ListItem, ListItemText
- Chip (for status indicators)
- CloudUpload icon

### Event Handlers
- `onDragOver`, `onDragLeave`, `onDrop` for drag & drop
- `onChange` for file input
- `onClick` for buttons

### Styling Features
- Dynamic border colors based on drag state
- Hover effects on drop zone
- Smooth transitions (0.3s)
- Color-coded backgrounds for valid/invalid rows
- Responsive layout with maxWidth="md"
- Scrollable preview for large files

## Testing Recommendations

1. **Test with valid CSV**: All questions should import successfully
2. **Test with invalid rows**: Invalid rows should be highlighted in red
3. **Test with mixed data**: Some valid, some invalid - only valid should import
4. **Test drag & drop**: Should work on all modern browsers
5. **Test file browser**: Should filter to .csv files only
6. **Test empty file**: Should show appropriate error
7. **Test large files**: Preview should scroll properly
8. **Test special characters**: Quotes, commas, newlines should parse correctly

## Future Enhancements

Possible improvements:
- [ ] Export validation report
- [ ] Fix invalid rows in modal before import
- [ ] Bulk edit invalid rows
- [ ] Import history/undo
- [ ] Column mapping for different CSV formats
- [ ] Excel (.xlsx) file support
- [ ] Duplicate detection
- [ ] Auto-fix common issues (trim whitespace, etc.)

## Build Status
✅ Build successful - No TypeScript errors
✅ All components rendering correctly
✅ Modal functionality working as expected
