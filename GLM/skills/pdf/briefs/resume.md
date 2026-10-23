## Resume / CV Template (ATS-Friendly)

Single-column, clean layout optimised for Applicant Tracking Systems (ATS). No graphics, no sidebars, no colour blocks - just well-structured text that parses perfectly by HR software.

**When to use this template:**
- Applying to corporate jobs through online portals
- Any scenario where the PDF will be machine-parsed before a human reads it
- When the recruiter explicitly asks for "a standard resume"

**When NOT to use (use Academic brief instead):**
- Creative/design industry positions → Academic brief (AltaCV-style)
- Academic CV with publications → Academic brief (Academic CV)

### Resume Design Rules
- **Target 1 page** unless user specifies otherwise
- **Margins**: `left=1.5cm, right=1.5cm, top=1.5cm, bottom=1.5cm`
- **No cover page** - content starts immediately
- **No TOC** - too short for table of contents
- **Font**: FreeSerif (English) or Noto Sans SC (Chinese)
- **Body font size**: 10-10.5pt; Name: 22-26pt; Section titles: 13-14pt
- **⚠️ Minimum font size: 12px (9pt) - HARD FLOOR.** No text in the entire resume may render smaller than 12px. This includes contact info, meta text, footnotes, and captions. Anything below 12px is unreadable in print and fails accessibility checks.
- **Section separator**: thin horizontal rule (`HRFlowable`)
- **Bullet style**: `•` with tight spacing

### Resume Line-Break Rules (Language-Aware)
- **English**: Prefer breaking at word boundaries (spaces, hyphens). If a long word must be split to avoid excessive whitespace, break at a valid syllable boundary and insert a hyphen (`-`) - this is standard typographic practice (e.g., `experi-\nence`, `develop-\nment`). ReportLab supports `wordWrap='CJK'` only for CJK content; for English use default paragraph wrapping with `allowWidows=0, allowOrphans=0`.
- **Chinese/CJK**: Break allowed between any two CJK characters. Never break between a CJK character and its adjacent punctuation (、。,)》 etc. must stay with the preceding character.
- **Mixed content** (e.g., "Python 开发工程师"): Break at CJK boundaries or English word boundaries. Never split an English word in a CJK paragraph unless hyphenated.
- **Contact line**: Email, phone, location separated by `|` or `·`. Each segment must stay on one line - if too long, move to next line at the separator, not mid-segment.
- **Dates and ranges**: "Jan 2022 - Present" must stay as one unit. Never break a date range across lines.

### Resume Page-Fill Rules (Anti-Blank-Space)
- **Goal: Fill ≥85% of the page height.** Content should reach at least the bottom quarter of the page. A resume that stops at 60% height with blank space below = FAIL.
- **Adaptive spacing strategy** (apply in order until page is ≥85% filled):
  1. Increase `spaceBefore` / `spaceAfter` on section headers (from 10pt up to 18pt)
  2. Increase `leading` (line height) on body text (from 14pt up to 18pt)
  3. Increase body `fontSize` by 0.5-1pt (from 10pt up to 11.5pt max)
  4. Add a "Professional Summary" or "Key Achievements" section if none exists
  5. Increase margins slightly (from 1.5cm up to 2cm) to reduce line width and push content downward
- **Never leave a visible blank area > 3cm at the bottom of the page.**
- **If content overflows to page 2**: do the reverse - reduce spacing, tighten leading (min 12pt), reduce fontSize (min 9pt / 12px), before removing content.

### Complete Resume Template

```python
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Font Registration ──
pdfmetrics.registerFont(TTFont('FreeSerif', '/usr/share/fonts/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', '/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', '/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', '/usr/share/fonts/truetype/freefont/FreeSerifBoldItalic.ttf'))
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold', italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
# For Chinese resumes, also register Noto Sans SC:
# pdfmetrics.registerFont(TTFont('Noto Sans SC', '/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf'))
# pdfmetrics.registerFont(TTFont('Noto Sans SC Bold', '/usr/share/fonts/truetype/chinese/NotoSansSC-Bold.ttf'))
# registerFontFamily('Noto Sans SC', normal='Noto Sans SC', bold='Noto Sans SC Bold')

# ── Styles ──
# ACCENT must come from palette.generate (Step 2)
# Run: python3 "$PDF_SKILL_DIR/scripts/pdf.py" palette.generate --title "Resume" --mode minimal
ACCENT = colors.HexColor('<accent from palette>')  # Replace with palette output

name_style = ParagraphStyle(
    'ResumeName', fontName='FreeSerif', fontSize=24,
    leading=28, alignment=TA_CENTER, spaceAfter=2
)
contact_style = ParagraphStyle(
    'ResumeContact', fontName='FreeSerif', fontSize=10,
    leading=14, alignment=TA_CENTER, textColor=TEXT_MUTED,  # From palette --c-muted
    spaceAfter=8
)
section_title_style = ParagraphStyle(
    'ResumeSectionTitle', fontName='FreeSerif', fontSize=13,
    leading=16, spaceBefore=10, spaceAfter=4,
    textColor=ACCENT
)
job_title_style = ParagraphStyle(
    'ResumeJobTitle', fontName='FreeSerif', fontSize=11,
    leading=14, spaceAfter=1
)
job_meta_style = ParagraphStyle(
    'ResumeJobMeta', fontName='FreeSerif', fontSize=10,
    leading=13, textColor=TEXT_MUTED, spaceAfter=4  # From palette --c-muted
)
bullet_style = ParagraphStyle(
    'ResumeBullet', fontName='FreeSerif', fontSize=10,
    leading=14, leftIndent=14, bulletIndent=0,
    spaceBefore=1, spaceAfter=1
)
body_style = ParagraphStyle(
    'ResumeBody', fontName='FreeSerif', fontSize=10,
    leading=14, spaceAfter=2
)

# ── Helpers ──
def section_header(title):
    """Section title + thin rule separator."""
    return [
        Paragraph(f'<b>{title}</b>', section_title_style),
        HRFlowable(width='100%', thickness=0.8, color=ACCENT,
                    spaceBefore=0, spaceAfter=6),
    ]

def experience_entry(title, company, dates, location, bullets):
    """One work experience block."""
    elements = [
        Paragraph(f'<b>{title}</b>', job_title_style),
        Paragraph(f'{company}  |  {dates}  |  {location}', job_meta_style),
    ]
    for b in bullets:
        elements.append(Paragraph(f'• {b}', bullet_style))
    elements.append(Spacer(1, 4))
    return elements

def education_entry(degree, school, dates, details=None):
    """One education block."""
    elements = [
        Paragraph(f'<b>{degree}</b>', job_title_style),
        Paragraph(f'{school}  |  {dates}', job_meta_style),
    ]
    if details:
        elements.append(Paragraph(details, body_style))
    elements.append(Spacer(1, 4))
    return elements

def skills_row(categories):
    """
    Skills as compact label: value pairs.
    categories = [('Programming', 'Python, Java, C++'), ('Tools', 'Git, Docker')]
    """
    elements = []
    for cat, vals in categories:
        elements.append(Paragraph(f'<b>{cat}:</b>  {vals}', body_style))
    return elements

# ── Build Document ──
doc = SimpleDocTemplate(
    'resume.pdf', pagesize=A4,
    leftMargin=1.5*cm, rightMargin=1.5*cm,
    topMargin=1.5*cm, bottomMargin=1.5*cm,
    title='Resume - Your Name',
    author='Z.ai', creator='Z.ai'
)

story = []

# Header
story.append(Paragraph('<b>YOUR NAME</b>', name_style))
story.append(Paragraph(
    'email@example.com  |  +86 138-0000-0000  |  Shanghai, China  |  github.com/yourname',
    contact_style
))

# Summary
story.extend(section_header('PROFESSIONAL SUMMARY'))
story.append(Paragraph(
    'Results-driven software engineer with 5+ years of experience in backend systems, '
    'distributed computing, and cloud-native architectures. Led a team of 8 engineers '
    'delivering a real-time data pipeline processing 2M+ events/sec.',
    body_style
))

# Experience
story.extend(section_header('WORK EXPERIENCE'))
story.extend(experience_entry(
    'Senior Software Engineer', 'Tech Company Inc.', 'Jan 2022 - Present', 'Shanghai',
    [
        'Designed and deployed a microservices architecture serving 10M daily active users',
        'Reduced API latency by 40% through query optimisation and caching strategies',
        'Mentored 3 junior engineers; established code review standards adopted team-wide',
    ]
))
story.extend(experience_entry(
    'Software Engineer', 'Startup Co.', 'Jul 2019 - Dec 2021', 'Beijing',
    [
        'Built real-time recommendation engine using collaborative filtering (CTR +25%)',
        'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
    ]
))

# Education
story.extend(section_header('EDUCATION'))
story.extend(education_entry(
    'M.Sc. Computer Science', 'Tsinghua University', '2017 - 2019',
    'GPA: 3.8/4.0 | Thesis: Distributed Graph Processing on Heterogeneous Clusters'
))
story.extend(education_entry(
    'B.Eng. Software Engineering', 'Zhejiang University', '2013 - 2017'
))

# Skills
story.extend(section_header('SKILLS'))
story.extend(skills_row([
    ('Languages', 'Python, Java, Go, SQL, TypeScript'),
    ('Frameworks', 'Spring Boot, FastAPI, React, Kubernetes, Kafka'),
    ('Tools', 'Git, Docker, Terraform, AWS (EC2/S3/Lambda), PostgreSQL, Redis'),
]))

doc.build(story)
```

### Resume Checklist
- [ ] **1 page** (unless user says otherwise)
- [ ] **No cover page, no TOC**
- [ ] Tight margins (1.5cm all sides)
- [ ] Name prominent at top (22-26pt)
- [ ] Contact info single line, centered
- [ ] Section headers with consistent separator style
- [ ] Bullets concise - start with action verbs
- [ ] Quantified achievements (%, $, count)
- [ ] No photos, no icons, no colour blocks (ATS-safe)
- [ ] Font: only registered fonts (FreeSerif / Noto Sans SC)
- [ ] **⚠️ Minimum font size 12px (9pt)** - no text smaller than this anywhere
- [ ] **Line breaks are language-aware** - no mid-word English breaks, no CJK punctuation orphans, no date range splits
- [ ] **Page fill ≥85%** - no large blank area at bottom. If sparse, increase spacing/leading/font size adaptively

