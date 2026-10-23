# Route: Add Comments

> **Output rule — decide this before you modify anything.** Adding comments edits an existing  
> document, so by default write to a NEW sibling file (`<stem>_updated.docx`) and never touch the  
> input; overwrite in place ONLY if the user explicitly asks to edit their own file — then first copy  
> it to `<stem>_backup.docx` next to it (never `/tmp`).

## Method 1: python-docx (Recommended — Simple)

```python
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from datetime import datetime

def add_comment(paragraph, comment_text, author="GLM", initials="G"):
    """Add a comment to an entire paragraph."""
    # Create comment reference
    comment_id = str(hash(comment_text) % 10000)

    # Add to comments.xml (need to create if not exists)
    # ... complex XML manipulation required
    pass

# Simpler approach: use python-docx-ng or manipulate XML directly
```

**Note**: python-docx has limited native comment support. For reliable results, use the OOXML method.

## Method 2: OOXML Direct Manipulation (Reliable)

### Step 1: Unpack

```bash
IN="input.docx"; STEM="${IN%.docx}"     # deliverable will be "${STEM}_updated.docx"
mkdir work && cd work && unzip "../$IN"
```

### Step 2: Create/update word/comments.xml

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:comment w:id="1" w:author="Reviewer" w:date="2024-01-15T10:30:00Z" w:initials="R">
    <w:p>
      <w:r>
        <w:t>This section needs more detail.</w:t>
      </w:r>
    </w:p>
  </w:comment>
</w:comments>
```

### Step 3: Mark comment range in document.xml

```xml
<w:commentRangeStart w:id="1"/>
<w:r><w:t>Text being commented on</w:t></w:r>
<w:commentRangeEnd w:id="1"/>
<w:r>
  <w:rPr><w:rStyle w:val="CommentReference"/></w:rPr>
  <w:commentReference w:id="1"/>
</w:r>
```

### Step 4: Update relationships

In `word/_rels/document.xml.rels`, add:
```xml
<Relationship Id="rIdComments" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/>
```

### Step 5: Update Content_Types

In `[Content_Types].xml`, ensure:
```xml
<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>
```

### Step 6: Pack

```bash
# Pack to a NEW sibling file — never to the user's original path
zip -r "../${STEM}_updated.docx" . -x ".*"
```

## When to Use Each Method

| Scenario | Method |
|----------|--------|
| Add 1-2 simple comments | OOXML |
| Batch review (many comments) | OOXML with Python script |
| Comment on specific words | OOXML (precise range control) |
| Quick annotation | python-docx if available |
