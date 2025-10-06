# Word Document Handler (/mnt/skills/public/docx/SKILL.md)

---
name: Word Document Handler
description: Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction
when_to_use: "When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"
version: 0.0.1
---

# DOCX creation, editing, and analysis

## Overview

A user may ask you to create, edit, or analyze the contents of a .docx file. A .docx file is essentially a ZIP archive containing XML files and other resources that you can read or edit. You have different tools and workflows available for different tasks.

## Workflow Decision Tree

### Reading/Analyzing Content
Use "Text extraction" or "Raw XML access" sections below

### Creating New Document
Use "Creating a new Word document" workflow

### Editing Existing Document
- **Your own document + simple changes**
  Use "Basic OOXML editing" workflow

- **Someone else's document**
  Use **"Redlining workflow"** (recommended default)

- **Legal, academic, business, or government docs**
  Use **"Redlining workflow"** (required)

## Reading and analyzing content

### Text extraction
If you just need to read the text contents of a document, you should convert the document to markdown using pandoc. Pandoc provides excellent support for preserving document structure and can show tracked changes:
```bash
# Convert document to markdown with tracked changes
pandoc --track-changes=all path-to-file.docx -o output.md
# Options: --track-changes=accept/reject/all
```

### Raw XML access
You need raw XML access for: comments, complex formatting, document structure, embedded media, and metadata. For any of these features, you'll need to unpack a document and read its raw XML contents.

#### Unpacking a file
`python ooxml/scripts/unpack.py <office_file> <output_directory>`

#### Key file structures
* `word/document.xml` - Main document contents
* `word/comments.xml` - Comments referenced in document.xml
* `word/media/` - Embedded images and media files
* Tracked changes use `<w:ins>` (insertions) and `<w:del>` (deletions) tags

## Creating a new Word document

When creating a new Word document from scratch, use **docx-js**, which allows you to create Word documents using JavaScript/TypeScript.

### Workflow
1. **MANDATORY - READ ENTIRE FILE**: Read [`docx-js.md`](docx-js.md) (~500 lines) completely from start to finish. **NEVER set any range limits when reading this file.** Read the full file content for detailed syntax, critical formatting rules, and best practices before proceeding with document creation.
2. Create a JavaScript/TypeScript file using Document, Paragraph, TextRun components (You can assume all dependencies are installed, but if not, refer to the dependencies section below)
3. Export as .docx using Packer.toBuffer()

## Editing an existing Word document

When editing an existing Word document, you need to work with the raw Office Open XML (OOXML) format. This involves unpacking the .docx file, editing the XML content, and repacking it.

### Workflow
1. **MANDATORY - READ ENTIRE FILE**: Read [`ooxml.md`](ooxml.md) (~500 lines) completely from start to finish. **NEVER set any range limits when reading this file.** Read the full file content for detailed syntax, critical validation rules, and patterns before proceeding.
2. Unpack the document: `python ooxml/scripts/unpack.py <office_file> <output_directory>`
3. Edit the XML files (primarily `word/document.xml` and `word/comments.xml`)
4. **CRITICAL**: Validate immediately after each edit and fix any validation errors before proceeding: `python ooxml/scripts/validate.py <dir> --original <file>`
5. Pack the final document: `python ooxml/scripts/pack.py <input_directory> <office_file>`

## Redlining workflow for document review

This workflow allows you to plan comprehensive tracked changes using markdown before implementing them in OOXML. **CRITICAL**: For complete tracked changes, you must implement ALL changes systematically.

### Comprehensive tracked changes workflow

1. **Get markdown representation**: Convert document to markdown with tracked changes preserved:
```bash
   pandoc --track-changes=all path-to-file.docx -o current.md
```

2. **Create comprehensive revision checklist**: Create a detailed checklist of ALL changes needed, with tasks listed in sequential order.
   - All tasks should start as unchecked items using `[ ]` format
   - **DO NOT use markdown line numbers** - they don't map to XML structure
   - **DO use:**
     - Section/heading numbers (e.g., "Section 3.2", "Article IV")
     - Paragraph identifiers if numbered
     - Grep patterns with unique surrounding text
     - Document structure (e.g., "first paragraph", "signature block")
   - Example: `[ ] Section 8: Change "30 days" to "60 days" (grep: "notice period of.*days prior")`
   - Consider that text may be split across multiple `<w:t>` elements due to formatting
   - Save as `revision-checklist.md`

3. **Setup tracked changes infrastructure**:
   - Unpack the document: `python ooxml/scripts/unpack.py <office_file> <output_directory>`
   - Run setup script: `python skills/docx/scripts/setup_redlining.py <unpacked_directory>`
   - This automatically:
     - Creates `word/people.xml` with Claude as author (ID 0)
     - Updates `[Content_Types].xml` to include people.xml content type
     - Updates `word/_rels/document.xml.rels` to add people.xml relationship
     - Adds `<w:trackRevisions/>` to `word/settings.xml`
     - Generates and adds a random 8-character hex RSID (e.g., "6CEA06C3")
     - Displays the generated RSID for reference
   - **CRITICAL**: Note the RSID displayed by the script - you MUST use this same RSID for ALL tracked changes

4. **Apply changes from checklist systematically**:
   - **MANDATORY - READ ENTIRE FILE**: Read [`ooxml.md`](ooxml.md) (~500 lines) completely from start to finish. **NEVER set any range limits when reading this file.** Pay special attention to the section titled "Tracked Change Patterns".
   - **CRITICAL for sub-agents**: If delegating work to sub-agents, each sub-agent MUST also read the "Tracked Change Patterns" section of `ooxml.md` before making any XML edits
   - **Process each checklist item sequentially**: Go through revision checklist line by line
   - **Locate text using grep**: Use grep to find the exact text location in `word/document.xml`
   - **Read context with Read tool**: Use Read tool to view the complete XML structure around each change
   - **Apply tracked changes**: Use Edit/MultiEdit tools for precision
   - **Use consistent RSID**: Use the SAME RSID from step 3 for ALL tracked changes (IMPORTANT: RSID attributes go on `w:r` tags and are invalid on `w:del` or `w:ins` tags)
   - **Track changes format**: All insertions use `<w:ins w:id="X" w:author="Claude" w:date="...">`, deletions use `<w:del w:id="X" w:author="Claude" w:date="...">`

5. **MANDATORY - Review and complete checklist**:
   - **Verify all changes**: Convert document to markdown and use grep/search to verify each change:
```bash
     pandoc --track-changes=all <packed_file.docx> -o verification.md
     grep -E "pattern" verification.md  # Check for each updated term
```
   - **Update checklist systematically**: Mark items [x] only after verification confirms the change
   - **CRITICAL - Complete any incomplete tasks**: If items remain unchecked, you MUST complete them before proceeding
   - **Document incomplete items**: Note any items not addressed and specific reasons why
   - **Ensure 100% completion**: All checklist items must be [x] before proceeding

6. **Final validation and packaging**:
   - Final validation: `python ooxml/scripts/validate.py <directory> --original <file>`
   - Pack only after validation passes: `python ooxml/scripts/pack.py <input_directory> <office_file>`
   - Only consider task complete when validation passes AND checklist is 100% complete

## Converting Documents to Images

To visually analyze Word documents, convert them to images using a two-step process:

1. **Convert DOCX to PDF**:
```bash
   soffice --headless --convert-to pdf document.docx
```

2. **Convert PDF pages to JPEG images**:
```bash
   pdftoppm -jpeg -r 150 document.pdf page
```
   This creates files like `page-1.jpg`, `page-2.jpg`, etc.

Options:
- `-r 150`: Sets resolution to 150 DPI (adjust for quality/size balance)
- `-jpeg`: Output JPEG format (use `-png` for PNG if preferred)
- `-f N`: First page to convert (e.g., `-f 2` starts from page 2)
- `-l N`: Last page to convert (e.g., `-l 5` stops at page 5)
- `page`: Prefix for output files

Example for specific range:
```bash
pdftoppm -jpeg -r 150 -f 2 -l 5 document.pdf page  # Converts only pages 2-5
```

## Code Style Guidelines
**IMPORTANT**: When generating code for DOCX operations:
- Write concise code
- Avoid verbose variable names and redundant operations
- Avoid unnecessary print statements

## Dependencies

Required dependencies (install if not available):

- **pandoc**: `sudo apt-get install pandoc` (for text extraction)
- **docx**: `npm install -g docx` (for creating new documents)
- **LibreOffice**: `sudo apt-get install libreoffice` (for PDF conversion)
- **Poppler**: `sudo apt-get install poppler-utils` (for pdftoppm to convert PDF to images)
