# Data Folder Structure

This folder contains data files used by the application.

## Folder Structure

```
data/
├── guidelines/
│   ├── templates/     # CSV template files for importing questions
│   │   └── question_template.csv
│   └── exports/       # Exported CSV files containing questions
│       └── [guide_title]_questions.csv
```

## Guidelines

### Templates
- Contains CSV template files that users can download
- Templates include sample data and proper column structure
- Used for bulk question import functionality

### Exports
- Contains CSV files exported from the admin panel
- Files are named using the guide title with `_questions.csv` suffix
- Used for backup, sharing, or external processing of questions

## CSV Format

All CSV files follow this structure:

```csv
Order,Question,Answer,Category,Tags,Code Example,References
1,"Sample Question","Sample Answer","Concept","tag1, tag2","code example","reference1, reference2"
```

### Required Columns
- **Order**: Numeric order of the question
- **Question**: The question text (required)
- **Answer**: The answer text (required)
- **Category**: Question category (required)

### Optional Columns
- **Tags**: Comma-separated list of tags
- **Code Example**: Code examples or snippets
- **References**: Comma-separated list of references

## Usage

1. **Download Template**: Use `question_template.csv` as a starting point
2. **Import Questions**: Upload CSV files with the correct format
3. **Export Questions**: Download existing questions as CSV for backup/sharing
4. **Bulk Editing**: Edit CSV files externally and re-import

## Notes

- Text fields containing commas or quotes are automatically wrapped in double quotes
- Internal quotes are escaped by doubling them ("")
- Empty optional fields can be left blank or omitted
- Files are UTF-8 encoded for international character support
