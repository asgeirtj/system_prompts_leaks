# OOXML Editing Reference — Document Library API

**Important: Read this entire document before editing.** This is the primary reference for modifying existing .docx files.

## Document Library (Python) — Primary API

Use the `Document` class from `"$DOCX_SCRIPTS/document.py"` for all edits, tracked changes, and comments. It handles infrastructure automatically (people.xml, RSIDs, settings.xml, comments, relationships, content types).

**Working with Unicode and Entities:**
- Both entity notation and Unicode work for search: `contains="&#8220;Company"` ≡ `contains="\u201cCompany"`
- Both work for replacement too

### Setup

```bash
# Find the docx skill root
find /mnt/skills -name "document.py" -path "*/docx/scripts/*" 2>/dev/null | head -1
# Skill root = parent of scripts/

# Run with PYTHONPATH
PYTHONPATH=/mnt/skills/docx python your_script.py
```

```python
from scripts.document import Document, DocxXMLEditor

# Basic init (auto-creates temp copy, sets up infrastructure)
doc = Document('unpacked')

# Custom author/initials
doc = Document('unpacked', author="John Doe", initials="JD")

# Enable tracked changes
doc = Document('unpacked', track_revisions=True)

# Custom RSID (auto-generated if omitted)
doc = Document('unpacked', rsid="07DC5ECB")
```

### Finding Nodes

```python
# By text
node = doc["word/document.xml"].get_node(tag="w:p", contains="specific text")

# By line range
para = doc["word/document.xml"].get_node(tag="w:p", line_number=range(100, 150))

# By attributes
node = doc["word/document.xml"].get_node(tag="w:del", attrs={"w:id": "1"})

# By exact line number
para = doc["word/document.xml"].get_node(tag="w:p", line_number=42)

# Combined filters (disambiguation)
node = doc["word/document.xml"].get_node(tag="w:r", contains="Section", line_number=range(2400, 2500))
```

### Tracked Changes

**CRITICAL**: Only mark text that actually changes. Keep unchanged text outside `<w:del>`/`<w:ins>` tags.

**Method Selection**:
- Regular text → `replace_node()` with `<w:del>`/`<w:ins>`, or `suggest_deletion()` for whole elements
- Partially modify another's tracked change → `replace_node()` to nest changes
- Reject another's insertion → `revert_insertion()` (NOT `suggest_deletion()`)
- Reject another's deletion → `revert_deletion()`

```python
# Change one word: "monthly" → "quarterly"
node = doc["word/document.xml"].get_node(tag="w:r", contains="The report is monthly")
rpr = tags[0].toxml() if (tags := node.getElementsByTagName("w:rPr")) else ""
replacement = f'<w:r w:rsidR="00AB12CD">{rpr}<w:t>The report is </w:t></w:r><w:del><w:r>{rpr}<w:delText>monthly</w:delText></w:r></w:del><w:ins><w:r>{rpr}<w:t>quarterly</w:t></w:r></w:ins>'
doc["word/document.xml"].replace_node(node, replacement)

# Delete entire run
node = doc["word/document.xml"].get_node(tag="w:r", contains="text to delete")
doc["word/document.xml"].suggest_deletion(node)

# Delete entire paragraph
para = doc["word/document.xml"].get_node(tag="w:p", contains="paragraph to delete")
doc["word/document.xml"].suggest_deletion(para)

# Insert new content after a node
node = doc["word/document.xml"].get_node(tag="w:r", contains="existing text")
doc["word/document.xml"].insert_after(node, '<w:ins><w:r><w:t>new text</w:t></w:r></w:ins>')

# Add new numbered list item
target_para = doc["word/document.xml"].get_node(tag="w:p", contains="existing list item")
pPr = tags[0].toxml() if (tags := target_para.getElementsByTagName("w:pPr")) else ""
new_item = f'<w:p>{pPr}<w:r><w:t>New item</w:t></w:r></w:p>'
tracked_para = DocxXMLEditor.suggest_paragraph(new_item)
doc["word/document.xml"].insert_after(target_para, tracked_para)
```

### Handling Other Authors' Changes

```python
# Partially delete another author's insertion
node = doc["word/document.xml"].get_node(tag="w:ins", attrs={"w:id": "5"})
replacement = '''<w:ins w:author="Jane Smith" w:date="2025-01-15T10:00:00Z">
  <w:r><w:t>quarterly </w:t></w:r>
  <w:del><w:r><w:delText>financial </w:delText></w:r></w:del>
  <w:r><w:t>report</w:t></w:r>
</w:ins>'''
doc["word/document.xml"].replace_node(node, replacement)

# Reject insertion (wraps in deletion)
ins = doc["word/document.xml"].get_node(tag="w:ins", attrs={"w:id": "5"})
doc["word/document.xml"].revert_insertion(ins)

# Reject deletion (restores deleted content)
del_elem = doc["word/document.xml"].get_node(tag="w:del", attrs={"w:id": "3"})
doc["word/document.xml"].revert_deletion(del_elem)
```

### Comments

```python
doc = Document('unpacked', author="Z.ai", initials="Z")

# Comment on a range
start = doc["word/document.xml"].get_node(tag="w:del", attrs={"w:id": "1"})
end = doc["word/document.xml"].get_node(tag="w:ins", attrs={"w:id": "2"})
doc.add_comment(start=start, end=end, text="Explanation of this change")

# Comment on paragraph
para = doc["word/document.xml"].get_node(tag="w:p", contains="text")
doc.add_comment(start=para, end=para, text="Comment here")

# Comment on newly created tracked change
node = doc["word/document.xml"].get_node(tag="w:r", contains="old")
new_nodes = doc["word/document.xml"].replace_node(
    node, '<w:del><w:r><w:delText>old</w:delText></w:r></w:del><w:ins><w:r><w:t>new</w:t></w:r></w:ins>')
doc.add_comment(start=new_nodes[0], end=new_nodes[1], text="Changed per requirements")

# Reply to comment
doc.reply_to_comment(parent_comment_id=0, text="I agree")
```

### Images

```python
from PIL import Image
import shutil, os

doc = Document('unpacked')
media_dir = os.path.join(doc.unpacked_path, 'word/media')
os.makedirs(media_dir, exist_ok=True)
shutil.copy('image.png', os.path.join(media_dir, 'image1.png'))

img = Image.open(os.path.join(media_dir, 'image1.png'))
width_emus = int(6.5 * 914400)  # 6.5" usable width
height_emus = int(width_emus * img.size[1] / img.size[0])

# Add relationship
rels_editor = doc['word/_rels/document.xml.rels']
next_rid = rels_editor.get_next_rid()
rels_editor.append_to(rels_editor.dom.documentElement,
    f'<Relationship Id="{next_rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>')
doc['[Content_Types].xml'].append_to(doc['[Content_Types].xml'].dom.documentElement,
    '<Default Extension="png" ContentType="image/png"/>')

# Insert
node = doc["word/document.xml"].get_node(tag="w:p", line_number=100)
doc["word/document.xml"].insert_after(node, f'''<w:p><w:r><w:drawing>
  <wp:inline distT="0" distB="0" distL="0" distR="0">
    <wp:extent cx="{width_emus}" cy="{height_emus}"/>
    <wp:docPr id="1" name="Picture 1"/>
    <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
      <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:nvPicPr><pic:cNvPr id="1" name="image1.png"/><pic:cNvPicPr/></pic:nvPicPr>
          <pic:blipFill><a:blip r:embed="{next_rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
          <pic:spPr><a:xfrm><a:ext cx="{width_emus}" cy="{height_emus}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
        </pic:pic>
      </a:graphicData>
    </a:graphic>
  </wp:inline>
</w:drawing></w:r></w:p>''')
```

### Saving

```python
doc.save()                    # Validates + copies back to the directory Document() was opened on
doc.save('modified-unpacked') # Save to different location
doc.save(validate=False)      # Skip validation (debug only)
```

> ⚠️ **A bare `doc.save()` writes back to whatever directory you passed to `Document()`.** That is safe  
> when you opened an *unpacked working copy* (the normal flow: `unzip` the input into `work_dir`, then  
> `Document('work_dir')`) — the user's `.docx` is a separate file and stays untouched. It is  
> **destructive** if you ever point `Document()` at a directory that is itself the deliverable or the  
> user's data. The real overwrite risk in this skill is the **pack** step, not `save()`: `zip` writes  
> to the path you name, so pack to `<stem>_updated.docx`, never to the user's original path.

### Direct DOM Manipulation

```python
editor = doc["word/document.xml"]
node = doc["word/document.xml"].get_node(tag="w:p", line_number=5)
parent = node.parentNode
parent.removeChild(node)

# General replacement (without tracked changes)
old = doc["word/document.xml"].get_node(tag="w:p", contains="original")
doc["word/document.xml"].replace_node(old, "<w:p><w:r><w:t>replacement</w:t></w:r></w:p>")

# Chained insertions
node = doc["word/document.xml"].get_node(tag="w:r", line_number=100)
nodes = doc["word/document.xml"].insert_after(node, "<w:r><w:t>A</w:t></w:r>")
nodes = doc["word/document.xml"].insert_after(nodes[-1], "<w:r><w:t>B</w:t></w:r>")
```

## Schema Compliance Quick Reference

- **Element ordering in `<w:pPr>`**: `<w:pStyle>` → `<w:numPr>` → `<w:spacing>` → `<w:ind>` → `<w:jc>`
- **Whitespace**: `xml:space='preserve'` on `<w:t>` with leading/trailing spaces
- **RSIDs**: 8-digit hex only (0-9, A-F)
- **trackRevisions**: Add `<w:trackRevisions/>` after `<w:proofState>` in settings.xml
- **`<w:del>`/`<w:ins>` placement**: At paragraph level, containing complete `<w:r>` elements. Never nest inside `<w:r>`.

## Validation Rules

The validator ensures document text matches the original after reverting GLM's changes:
- **Never modify text inside another author's `<w:ins>` or `<w:del>` tags**
- **Use nested deletions** to remove another author's insertions
- **Every edit must be tracked** with `<w:ins>` or `<w:del>` tags
