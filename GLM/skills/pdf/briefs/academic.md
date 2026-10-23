# Brief: Academic Production

Scholarly documents via LaTeX/Tectonic: academic papers, theses, dissertations, mathematical manuscripts, IEEE/ACM submissions, academic CVs.

```
Academic request
  ├─ Paper / thesis / journal          → §Standard Paper Workflow
  │     Embed as needed during Phase 3:
  │     ├─ Heavy math (>3 equations)   → use §Scenario A preamble + environments
  │     ├─ Vector diagrams             → §Scenario B (simple→TikZ, complex→Playwright+CSS)
  │     └─ Algorithm pseudocode        → use §Scenario C template
  │
  └─ Standalone diagram for other brief → §Scenario B Path B (Playwright+CSS → PNG)
  │
  └─ Resume / CV
        ├─ Creative / tech / startup   → §Template A (AltaCV dual-column)
        └─ Academic position / PhD     → §Template B (Academic CV)
```

**No typesetting assets needed** - LaTeX templates handle their own design system. The `palette.md` color system does not apply to LaTeX documents.

---

## §Standard Paper Workflow

Six phases. Rules and guardrails are embedded in each phase where they apply.

### Phase 1 - BRIEF

Confirm with the user:
- Document type (journal article, thesis chapter, conference paper, technical report)
- Template requirement (IEEE, ACM, custom class, or plain `article`)
- Bibliography format (natbib superscript, numeric brackets, biblatex)
- Expected length → if >5 pages or 3+ complex elements (wide tables, block equations, TikZ), split into `\input{}` modules (~500 lines each)

**Recognising the document's personality:**

| Personality | Examples | Key concern |
|-------------|----------|-------------|
| Scholarly | Journal articles, conference proceedings | Academic conventions, bibliography accuracy |
| Utilitarian | Technical reports, manuals, specs | Information density + scannability |
| Persuasive | Proposals, pitch documents | Professional polish + 1-2 visual high-points |
| Expressive | Portfolios, brand guidebooks | Bold typographic choices |

### Phase 2 - SETUP

**Title Page (Cover) Rules:**
- **Academic route covers are generated with ReportLab** via `scripts/cover_render.py`, using templates **06–09** from `typesetting/cover.md`. Templates 06–08 replicate LaTeX title-page aesthetics (dark backgrounds, serif titles, symmetric layouts). **Template 09 (Institutional)** is for thesis proposals, dissertations, and formal institutional submissions (white bg + black border frame). Pure Python — **no HTML/Playwright/Chromium required.**
- **Pipeline:** Generate body PDF via Tectonic (no title page in `.tex`) → Generate cover PDF via `cover_render.py` (template 06/07/08/09) → Merge cover as page 1 via pypdf.
- **Template selection:** thesis proposals (开题报告), dissertations (毕业论文), institutional submissions → **default to Template 09**. arXiv/preprint → **06**; IEEE/ACM/English thesis → **07**; CJK journal / thesis with keywords → **08**.
- **NEVER use `\maketitle`** - it produces ugly default output with cramped spacing
- **NEVER use `\begin{titlepage}...\end{titlepage}`** - the cover is generated separately via ReportLab
- Title page is OPTIONAL - skip it for short documents (≤ 2 pages), letters, memos, or when content scanning is priority
- **`\tableofcontents` must be the FIRST page** of the body PDF (after merge, it becomes page 2)
- If no TOC, content starts on page 1 of the body PDF

**Cover Generation Pipeline (Academic route):**
```
1. Write .tex WITHOUT any title page
2. Run poster_validate.py check-tex on .tex file - fix table overflow / image width ERRORs
3. Compile with tectonic → body.pdf   (see §Tectonic preflight — ask before installing)
4. Render cover PDF via cover_render.py (template 06/07/08/09) from typesetting/cover.md
5. Merge: insert cover as page 1 of body PDF via pypdf
```

**Cover rendering:**
```bash
python3 "$PDF_SKILL_DIR/scripts/cover_render.py" 07 --out cover.pdf --content cover_content.json
```
Or from Python:
```python
import sys, os
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, "scripts"))
from cover_render import render_cover, detect_fonts
content = {
    "label": "博士学位论文 · DOCTORAL DISSERTATION",
    "title": "……",           # serif title (auto-wrap, ≤ 3 lines)
    "subtitle": "……",
    "authors": "……", "institution": "……",
    "keywords_lines": ["……", "……"],   # template 08 only
    "footer_left": "……", "footer_right": "2026 年 3 月",
}
# Template 09 (institutional) uses: institution, doc_type, title, fields=[[label,value],...], date
render_cover("07", content, "cover.pdf", fonts=detect_fonts())
```

**Merge cover + body:**
```python
from pypdf import PdfReader, PdfWriter, Transformation

A4_W, A4_H = 595.28, 841.89  # A4 in points

def normalize_page_to_a4(page):
    """Scale a page to A4 if its dimensions don't match."""
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 2 or abs(h - A4_H) > 2:
        sx, sy = A4_W / w, A4_H / h
        page.add_transformation(Transformation().scale(sx=sx, sy=sy))
        page.mediabox.lower_left = (0, 0)
        page.mediabox.upper_right = (A4_W, A4_H)
    return page

writer = PdfWriter()
cover_page = normalize_page_to_a4(PdfReader('cover.pdf').pages[0])
writer.add_page(cover_page)
for page in PdfReader('body.pdf').pages:
    writer.add_page(page)
with open('final.pdf', 'wb') as f:
    writer.write(f)
```

**→ Full cover templates: see PART 1 in `typesetting/cover.md` (templates 06–09).**

> **⚠️ Why a separate ReportLab cover (not `\begin{titlepage}`)?** LaTeX TikZ `remember picture, overlay` with `margin=0pt` frequently fails to fill the page (right/bottom edges show white). `cover_render.py` outputs an exact-A4, full-bleed cover in pure Python — pixel-exact and dependency-free — merged as page 1 via pypdf.

Write the preamble. Start from this foundation and customise per document:

```latex
\documentclass{article}

\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{geometry}
\usepackage{amsmath}          % Load before hyperref

% hyperref - ALWAYS last among content packages
\usepackage[
    colorlinks=true,
    linkcolor=blue,
    citecolor=darkgray,
    urlcolor=blue,
    bookmarks=true,
    bookmarksnumbered=true,
    unicode=true
]{hyperref}

\geometry{a4paper, top=2.5cm, bottom=2.5cm, left=2.5cm, right=2.5cm}
% ⚠️ left and right MUST be equal - asymmetric margins cause off-center content

\usepackage[numbers,super,sort&compress]{natbib}
\bibliographystyle{unsrtnat}

\usepackage{tcolorbox}
\usepackage{colortbl}
\usepackage{booktabs}
\usepackage{enumitem}
\usepackage{tabularx}          % Auto-width columns (X type) - prevents table overflow
\usepackage{adjustbox}         % \adjustbox{max width=\columnwidth} for emergency table fitting
```

**Guardrails for SETUP:**
- `hyperref` must load after virtually every other package - option clashes are the #1 preamble bug
- When using a Scenario template (A/B/C) or Resume template, use that template's own preamble instead
- `babel` and `polyglossia` are incompatible - load only one
- CJK: `\usepackage{ctex}` - Tectonic auto-downloads fonts, zero manual setup
- System fonts via `\setmainfont{}`: probe first with `fc-list :lang=XX`
- **🔴 Margin symmetry:** `\geometry{left=X, right=X}` - left and right MUST be equal. Asymmetric margins = off-center content = critical bug
- **🔴 Minimum margins with fancyhdr:** When using `fancyhdr` for headers/footers, `geometry` margins must leave enough room. **Minimum: `top >= 2.0cm`, `bottom >= 1.8cm`**. Also set `\setlength{\headheight}{14pt}` in the preamble. Margins smaller than this cause headers/footers to be pushed outside the page boundary (negative y-coordinates), making them invisible in print.
- **🔴 Quotation marks (English):** NEVER use straight quotes `"..."`。English text must use LaTeX curly quotes: ` ``left quote'' ` for double, `` `single' `` for single. Straight `"` in LaTeX means right double quote only.
- **🔴 Quotation marks (Chinese — CRITICAL):** Chinese quoted text like "北漂" MUST use Unicode smart quotes "…" (U+201C/U+201D) directly in the `.tex` source. **NEVER use ASCII `"` for Chinese quotes** — LaTeX interprets `"` as a right double quote (`"`), so `"北漂"` renders as `"北漂"` (two right quotes, no left quote). The correct LaTeX source is: `"北漂"` (literal Unicode characters). `\usepackage{csquotes}` is a safety net but does NOT fix raw ASCII `"` in Chinese text.
  - **Scope:** This rule applies ONLY to Chinese-language body text. Do NOT replace `"` in English paragraphs (use ` ``...'' ` instead), `verbatim`/`lstlisting`/`minted` environments, `\texttt{}`/`\verb||`/`\url{}`/`\href{}{}` arguments, or BibTeX `.bib` field values.
- **🔴 Title page isolation:** Cover is generated via ReportLab (`cover_render.py`) and merged as page 1 via pypdf - isolation is inherent in the merge pipeline. `\tableofcontents` should be the first page of the `.tex` body. Verify: does TOC start on the page immediately after the cover in the merged PDF?
- **🔴 TOC requires a cover page:** Unless the user explicitly requests no cover, if the document has `\tableofcontents`, it MUST have a cover page. Structure: Cover (page 1) → TOC (page 2) → Content (page 3+). Do not generate a TOC without a preceding cover page. This rule is consistent with `briefs/report.md`.

**When no style is specified**, apply a measured, high-craft system:
1. **Contrast** - clear figure-ground separation
2. **Hierarchy** - size, weight, hue variation for reading order
3. **White space** - ample margins and leading
4. **Coherence** - one typeface family, one accent colour, one spacing rhythm

Add enrichment proactively when content benefits:
- Callout boxes, sidebars → `tcolorbox`
- Theorem/definition/proof → `amsthm` + `tcolorbox`
- Headers/footers → `fancyhdr`; chapter openers → `titlesec`

### Phase 3 - BUILD

Write LaTeX content: sections, equations, figures, tables, bibliography.

**→ Overflow prevention**: See `typesetting/overflow.md` for the LaTeX-specific patterns (tabularx, adjustbox, widowpenalty, etc.). Key rules:
- Tables: always use `tabularx` or `tabular*` with `\columnwidth` constraint - never plain `tabular` for 5+ columns
- Images: always `\includegraphics[max width=\columnwidth, max height=0.4\textheight]` or `adjustbox` - the `max height` prevents a single figure from occupying an entire page
- Orphans/widows: set `\widowpenalty=10000` and `\clubpenalty=10000`
- Long tables: use `longtable` with `\endhead` for header repetition on every page

**Embedding components**: If the document needs heavy math, diagrams, or algorithms, refer to the Scenario sections below and embed their templates/environments into your `.tex` file. Scenarios are not separate tasks - they are building blocks for Phase 3.

**Content density guidance (for textbooks, lecture notes, tutorials):**

Documents meant for learning should maintain a healthy balance of prose and formal elements. A page full of equations with no explanation reads like a reference manual, not a textbook.

Guidelines:
- Every equation/equation group should be **preceded** by a sentence explaining what it represents and **followed** by a sentence interpreting the result or stating its significance
- Every figure should have (a) a descriptive `\caption{}` and (b) at least one sentence in the surrounding text referencing it
- Every theorem/definition should be followed by an intuitive explanation or worked example before proceeding to the next theorem
- Avoid stacking 3+ formal elements (equations, figures, tables) with zero narrative text between them
- For worked examples: state the problem, show the solution steps, then summarize the key takeaway

**When high density is acceptable**: research papers (especially methods sections where equation groups naturally cluster), formula sheets, reference appendices, and conference papers with tight page limits. In these cases, prioritise completeness over readability padding.

**Source hygiene - catch these model-generation slips:**
- **Prohibited**: emoji glyphs (tofu), markdown `*asterisk*` formatting (compile errors)
- **Use instead**: `\textbf{bold}`, `\emph{emphasis}`

**Table placement - prevent header orphans:**
- Short tables (≤15 rows): wrap in `\begin{table}[htbp]` - LaTeX keeps it together
- Long tables (>15 rows): use `longtable` with repeated header:
```latex
\usepackage{longtable}
\begin{longtable}{lll}
\toprule
Header 1 & Header 2 & Header 3 \\
\midrule
\endfirsthead
\toprule
Header 1 & Header 2 & Header 3 \\  % repeated on continuation pages
\midrule
\endhead
\bottomrule
\endfoot
Row 1 & data & data \\
Row 2 & data & data \\
\end{longtable}
```
- **Never** let a table header sit alone at the bottom of a page with no data rows following it

**Table width management - prevent column overflow (⚠️ CRITICAL):**

Tables overflowing the column width is the most common LaTeX layout bug in dual-column papers. The table looks fine in single-column preview but clips in IEEE/ACM two-column format.

**Prevention strategy (in priority order):**

1. **Use `tabular*` or `tabularx` to constrain width** (RECOMMENDED):
```latex
% tabular* - fixed total width, stretches inter-column space
\begin{table}[htbp]
\centering
\caption{Results.}\label{tab:results}
\begin{tabular*}{\columnwidth}{@{\extracolsep{\fill}} l cccc}
\toprule
Method & P@10 & R@10 & NDCG@10 & MRR \\
\midrule
Ours   & \textbf{0.082} & \textbf{0.054} & \textbf{0.043} & \textbf{0.029} \\
\bottomrule
\end{tabular*}
\end{table}

% tabularx - fixed total width, X columns auto-stretch
\usepackage{tabularx}
\begin{tabularx}{\columnwidth}{l X X X X}
...
\end{tabularx}
```

2. **Reduce font size inside table** (common in conference papers):
```latex
\begin{table}[htbp]
\centering
\small            % or \footnotesize for very wide tables
\caption{Comparison.}\label{tab:comp}
\begin{tabular}{lcccccccc}
...
\end{tabular}
\end{table}
```

3. **`\resizebox` as last resort** (scales the entire table to fit):
```latex
\begin{table}[htbp]
\centering
\caption{Full results.}\label{tab:full}
\resizebox{\columnwidth}{!}{%
\begin{tabular}{lcccccccc}
\toprule
...
\bottomrule
\end{tabular}
}
\end{table}
```

⚠️ `\resizebox` scales fonts too - verify the smallest text is still readable (≥ 6pt effective).

4. **Span both columns** for genuinely wide tables (8+ data columns):
```latex
\begin{table*}[t]   % table* spans full width in twocolumn
\centering
\caption{Cross-dataset results.}\label{tab:cross}
\begin{tabular}{lccccccccccc}
...
\end{tabular}
\end{table*}
```

**Decision checklist before writing any table:**
| Data columns | Single-column (`\columnwidth`) | Action |
|-------------|-------------------------------|--------|
| ≤ 4 | Fits comfortably | Normal `tabular` |
| 5-6 | Tight fit | `\small` + `tabular*{\columnwidth}` |
| 7-8 | Won't fit | `\footnotesize` + `tabular*`, or `\resizebox` |
| ≥ 9 | Definitely won't fit | Use `table*` (full width), or split into two tables |

**Never**: use a plain `tabular` with 8+ columns in a two-column paper without width constraint - it WILL overflow.

**⚠️ CRITICAL: `\resizebox{\columnwidth}` NOT `\resizebox{\textwidth}` in two-column layouts!**  
In dual-column documents (`twocolumn`, `sigconf`, etc.), `\textwidth` = **full page width** (both columns), while `\columnwidth` = **single column width**. Using `\resizebox{\textwidth}` inside a `table` (single-column float) scales the table to the full page width, causing it to overflow the column boundary by ~50%. **Always use `\resizebox{\columnwidth}` for single-column floats.** Only use `\resizebox{\textwidth}` inside `table*` (full-width float).

```latex
% ❌ WRONG in two-column layout
\begin{table}[t]
  \resizebox{\textwidth}{!}{% <-- \textwidth = full page, table overflows column!
    \begin{tabular}{lcccccccc} ... \end{tabular}}
\end{table}

% ✅ CORRECT for single-column float
\begin{table}[t]
  \resizebox{\columnwidth}{!}{% <-- \columnwidth = single column width
    \begin{tabular}{lcccccccc} ... \end{tabular}}
\end{table}

% ✅ CORRECT for full-width float
\begin{table*}[t]
  \resizebox{\textwidth}{!}{% <-- \textwidth OK here because table* spans both columns
    \begin{tabular}{lcccccccc} ... \end{tabular}}
\end{table*}
```

---

**Equation overflow prevention (⚠️ CRITICAL for dual-column papers):**

Long equations are the **#2 overflow source** after tables in dual-column papers. Column width in ACM `sigconf` is ~241pt; in IEEE `twocolumn` ~252pt. Many standard math expressions exceed this.

**Overflow patterns and fixes:**

| Pattern | Problem | Fix |
|---------|---------|-----|
| Two equations side-by-side with `\quad` | Combined width > column | Split into `align` with one equation per line |
| Deep fraction nesting (softmax, attention) | Denominator sum too wide | Use `\smash` + separate definition, or `split` |
| Long subscripts/superscripts with `\text{}` | `\text{collab}`, `\text{social}` are wide | Use short math abbreviations: `c`, `s`, or define `\newcommand` |
| `equation` with multiple terms separated by `\quad` | Horizontal overflow | Use `aligned` inside `equation`, or `align` |

**Rule M1 — Never put two independent equations on one line in dual-column:**
```latex
% ❌ WRONG — two full equations on one line, guaranteed overflow in sigconf
\begin{equation}
\mathbf{e}_u^{(l+1)} = \sum_{i} \frac{1}{\sqrt{|N_R(u)|\cdot|N_R(i)|}} \mathbf{e}_i^{(l)}, \quad
\mathbf{e}_i^{(l+1)} = \sum_{u} \frac{1}{\sqrt{|N_R(i)|\cdot|N_R(u)|}} \mathbf{e}_u^{(l)}
\end{equation}

% ✅ CORRECT — split into aligned or separate equations
\begin{align}
\mathbf{e}_u^{(l+1)} &= \sum_{i \in \mathcal{N}_R(u)} \frac{\mathbf{e}_i^{(l)}}{\sqrt{|\mathcal{N}_R(u)| \cdot |\mathcal{N}_R(i)|}}, \label{eq:collab_u} \\
\mathbf{e}_i^{(l+1)} &= \sum_{u \in \mathcal{N}_R(i)} \frac{\mathbf{e}_u^{(l)}}{\sqrt{|\mathcal{N}_R(i)| \cdot |\mathcal{N}_R(u)|}}. \label{eq:collab_i}
\end{align}
```

**Rule M2 — Wide fractions: use `split` or `multline`:**
```latex
% ❌ WRONG — softmax with long denominator
\begin{equation}
\alpha_{uv} = \frac{\exp(\text{LeakyReLU}(\mathbf{a}^{\top}[\mathbf{W}\mathbf{e}_u \| \mathbf{W}\mathbf{e}_v]))}{\sum_{k \in \mathcal{N}_S(u)} \exp(\text{LeakyReLU}(\mathbf{a}^{\top}[\mathbf{W}\mathbf{e}_u \| \mathbf{W}\mathbf{e}_k]))}
\end{equation}

% ✅ CORRECT — define numerator/denominator separately
\begin{equation}
\alpha_{uv} = \frac{\exp\bigl(f(\mathbf{e}_u, \mathbf{e}_v)\bigr)}{\sum_{k \in \mathcal{N}_S(u)} \exp\bigl(f(\mathbf{e}_u, \mathbf{e}_k)\bigr)},
\end{equation}
\text{where } f(\mathbf{e}_u, \mathbf{e}_v) = \text{LeakyReLU}\bigl(\mathbf{a}^{\top} [\mathbf{W}\mathbf{e}_u \| \mathbf{W}\mathbf{e}_v]\bigr).
```

**Rule M3 — Self-check: if `equation` body > 60 characters (excluding `\label`), it probably overflows dual-column:**  
This is a quick mental check. If the raw LaTeX math string is very long, it almost certainly won't fit in ~241pt. Use `align`, `split`, `multline`, or factor out sub-expressions.

**Rule M4 — Contrastive loss / InfoNCE: always use `multline` or `split`:**  
Contrastive losses with `\frac{\exp(...)}{\sum \exp(...)}` inside `\log` are notoriously wide. Always break them across lines:
```latex
\begin{multline}
\mathcal{L}_{\text{SSL}}^u = -\log \frac{\exp\bigl(\text{sim}(\mathbf{z}_u', \mathbf{z}_u'') / \tau\bigr)}
{\sum_{v \neq u} \exp\bigl(\text{sim}(\mathbf{z}_u', \mathbf{z}_v'') / \tau\bigr)}.
\end{multline}
```

---

**Algorithm overflow prevention (dual-column papers):**

Algorithm boxes with long `\KwInput` lines or verbose pseudocode frequently overflow column width.

**Rule A1 — Always set `\SetAlFnt{\small}` and limit line width:**
```latex
\SetAlFnt{\small}           % Smaller font inside algorithm
\SetAlCapFnt{\small}        % Smaller caption font
\SetAlCapNameFnt{\small}    % Smaller "Algorithm N:" prefix
```

**Rule A2 — Break long Input/Output lines:**
```latex
% ❌ WRONG — all parameters on one line
\KwInput{Interaction graph $\mathcal{G}_R$, social graph $\mathcal{G}_S$, embedding dimension $d$, number of GNN layers $L$, learning rate $\eta$, regularization $\lambda$, SSL weight $\gamma$, temperature $\tau$}

% ✅ CORRECT — break into multiple lines
\KwInput{Interaction graph $\mathcal{G}_R$, social graph $\mathcal{G}_S$\\\quad embedding dim $d$, GNN layers $L$, learning rate $\eta$\\\quad regularization $\lambda$, SSL weight $\gamma$, temperature $\tau$}
```

**Rule A3 — Use `algorithm*` for genuinely wide algorithms:**  
If the algorithm has many columns or very long lines that can't be shortened, use `\begin{algorithm*}` to span both columns.

**Rule A4 — Abbreviate variable names in pseudocode:**  
Use compact notation: `emb` not `embedding`, `lr` not `learning\_rate`, `reg` not `regularization`. Define abbreviations in the Input line.

---

**Clickable navigation - every reference must be a live link:**

Attach `\label{}` right after each numbered element, cite with `\ref{}`:

```latex
\section{Background}\label{sec:bg}
\begin{figure}[htbp]
    \includegraphics{...}
    \caption{Overview}\label{fig:overview}
\end{figure}
\begin{equation}\label{eq:energy}
    E = mc^2
\end{equation}

% All produce clickable hyperlinks:
Section~\ref{sec:bg}...
Figure~\ref{fig:overview}...
Equation~\eqref{eq:energy}...    % \eqref auto-wraps in parentheses
```

**Label conventions**: `sec:`, `fig:`, `tab:`, `eq:`, `lst:` - use `~` (non-breaking space) before `\ref`.

**Bibliography** (three approaches):

```latex
% Approach 1: natbib superscript (preferred academic)
\usepackage[numbers,super,sort&compress]{natbib}
This has been studied\cite{smith2023}.     % → studied^[1]
\bibliography{refs}

% Approach 2: natbib brackets
\usepackage[numbers]{natbib}
\cite{smith2023}   % [1]
\citet{smith2023}  % Smith (2023)

% Approach 3: biblatex
\usepackage[backend=biber,style=numeric-comp]{biblatex}
\addbibresource{refs.bib}
\printbibliography
```

**PDF metadata** (add before `\end{document}`):
```latex
\hypersetup{
    pdftitle={Document Title},
    pdfauthor={Author Name},
    pdfsubject={Topic},
    pdfkeywords={keyword1, keyword2}
}
```

**Table of Contents** (auto-clickable with hyperref):
```latex
\tableofcontents
\listoffigures      % optional
\listoftables       % optional
```

### Phase 4 - COMPILE

> ### 🟡 Tectonic preflight — ASK BEFORE INSTALLING (MANDATORY)  
> The LaTeX engine (Tectonic) is an **optional** dependency and may not be installed. Before compiling:  
> 1. Probe it: `python3 "$PDF_SKILL_DIR/scripts/pdf.py" env.check` (look at the `tectonic` line), or check for a `tectonic` binary on PATH / in `scripts/`.  
> 2. **If Tectonic is missing, do NOT auto-install.** Use the **AskUserQuestion** tool to ask whether to install it, and warn clearly: *installing Tectonic and downloading the LaTeX package/font set on first run can take several minutes to tens of minutes depending on network.*  
> 3. Only after the user confirms, install it (see `env_setup/setup.md` → optional Tectonic), then compile.  
> 4. If the user declines, offer the **Report route (ReportLab)** as a no-LaTeX alternative for non-math documents, or stop.

```bash
python3 "$PDF_SKILL_DIR/scripts/pdf.py" convert.latex main.tex --runs 2
```

Default: 2 passes (resolves cross-references). Use `--runs 3` when bibliography back-references are needed. Add `--keep-logs` for debugging.

**NEVER invoke Tectonic directly** - always use the wrapper. It strips noise, surfaces errors, and reports PDF statistics.

### Phase 5 - PREFLIGHT

The wrapper classifies diagnostics into three tiers:

| Tier | Impact | Action |
|------|--------|--------|
| Errors | Build aborts | Fix before anything else |
| Layout defects | Overfull/underfull boxes, missing glyphs | Repair prior to delivery |
| Advisories | Other warnings | Assess individually; fix when feasible |

**Never acceptable**: shrugging off warnings with "they don't affect the final PDF."

**Navigation troubleshooting:**

| Symptom | Fix |
|---------|-----|
| `??` in text | Recompile with `--runs 2` |
| Links not coloured | Add `colorlinks=true` to hyperref |
| `[?]` beside citations | Check `.bib` path; rebuild |
| No PDF bookmarks | Set `bookmarks=true` |

### Phase 6 - DELIVER

Final PDF. Confirm page count, cross-references resolved, no `??` placeholders.

---

## §Scenario A: Math-Heavy Technical Documents

> Use standalone for a pure-math document, or embed the preamble additions + environments into a §Standard Paper Workflow document.

When the document has **more than 3 non-trivial equations** (matrices, aligned systems, integrals, summations), use this template instead of plain `article`.

**Decision rule**: If you find yourself writing `<super>` tags or KaTeX CDN includes for math, stop and switch here.

```latex
\documentclass[11pt,a4paper]{article}
\usepackage{amsmath,amssymb,amsthm}
\usepackage[margin=2.5cm]{geometry}
\usepackage{ctex}          % CJK support via Tectonic
\usepackage{booktabs}
\usepackage{hyperref}

\theoremstyle{definition}
\newtheorem{definition}{Definition}[section]
\newtheorem{theorem}{Theorem}[section]
\newtheorem{lemma}[theorem]{Lemma}

\title{Document Title}
\author{Author}
\date{\today}

\begin{document}

% ═══════════════════════════════════════════════════════
% NO TITLE PAGE IN .tex - Cover is generated separately
% via ReportLab (cover_render.py) and merged as page 1.
% Body PDF starts directly with TOC or content.
% ═══════════════════════════════════════════════════════

\tableofcontents
\newpage

% Aligned equation group
\begin{align}
  \nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
  \nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0\varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{align}

% Matrix
\[
  A = \begin{pmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{pmatrix}
\]

\end{document}
```

---

## §Scenario B: Diagram Generation for Academic Papers

> **Complexity-based routing**: Simple diagrams use TikZ natively (vector, font-consistent). Complex diagrams use Playwright+CSS → PNG → `\includegraphics` (models produce broken TikZ for complex branching logic).

### Decision: TikZ or Playwright+CSS?

| Criteria | → TikZ native | → Playwright+CSS → PNG |
|---|---|---|
| Node count | ≤6 | >6 |
| Topology | Linear chain, simple tree, layer stack | Branching, multi-path, feedback loops |
| Annotations | Minimal (labels only) | Side notes, legends, callout boxes |
| Math in nodes | Yes (LaTeX math rendering matters) | No (plain text labels) |
| Output | Vector (`tikzpicture` in document) | Raster PNG @2× (300dpi, publication-ready) |

### Path A: Simple Diagrams → TikZ Native

For ≤6 node linear/tree diagrams, embed `tikzpicture` directly or use standalone:

```latex
\documentclass[tikz,border=5pt]{standalone}
\usetikzlibrary{arrows.meta,positioning,calc,shapes.geometric}

\begin{document}
\begin{tikzpicture}[
  box/.style={draw, rounded corners=2pt, minimum width=2.4cm,
              minimum height=0.7cm, align=center, font=\small\sffamily},
  arr/.style={-{Stealth[length=4pt]}, thick, gray!70}
]
  \node[box, fill=blue!8]   (a) {Input};
  \node[box, fill=orange!8, right=1.2cm of a] (b) {Process};
  \node[box, fill=green!8,  right=1.2cm of b] (c) {Output};
  \draw[arr] (a) -- (b);
  \draw[arr] (b) -- (c);
\end{tikzpicture}
\end{document}
```

**Node text overflow prevention:**

When nodes contain multi-word labels (e.g. "CNN Spatial Encoder", "Multi-Head Attention"), text can overflow or overlap adjacent nodes. Prevent this:

```latex
% Use text width (not minimum width) to enable line wrapping inside nodes
box/.style={draw, rounded corners=2pt, text width=2.8cm,
            minimum height=0.7cm, align=center, font=\small\sffamily},

% For nodes with long labels, use explicit line breaks
\node[box] {CNN Spatial\\Encoder};
\node[box] {Multi-Head\\Attention};
```

Rules:
- Prefer `text width` over `minimum width` when labels exceed 2 words - it wraps text instead of clipping
- When 3+ nodes sit side by side, verify total width fits within `\columnwidth` (single-column) or `0.45\textwidth` (dual-column)
- If labels still overflow, use abbreviations or `\scriptsize` - never let text clip outside node borders
- Always `\resizebox{\columnwidth}{!}{...}` when embedding in dual-column papers (see TikZ in multi-column section below)

**TikZ standalone embedding (simple diagrams only):**

```bash
# 1. Compile TikZ standalone to PDF
python3 "$PDF_SKILL_DIR/scripts/pdf.py" convert.latex diagram.tex    # → diagram.pdf (tight-cropped)

# 2. Embed as vector in LaTeX
# \begin{figure}[t]
#   \centering
#   \includegraphics[width=\columnwidth]{diagram.pdf}  % vector, not PNG
#   \caption{System Architecture}\label{fig:arch}
# \end{figure}
```

**🚫 FORBIDDEN: Using TikZ standalone for Report or Creative briefs.** Those routes have no LaTeX compiler. See SKILL.md § "Diagram Generation Strategy".

### Path B: Complex Diagrams → Playwright+CSS → PNG

For >6 node diagrams with branching, annotations, or multi-path flows:

```bash
# 1. LLM generates diagram.html (CSS grid/flexbox nodes + SVG/CSS arrows)
# 2. Screenshot at 2× device scale factor for 300dpi print quality
python3 "$PDF_SKILL_DIR/scripts/pdf.py" convert.blueprint diagram.html --device-scale-factor 2 --output diagram.png

# 3. Embed in LaTeX
# \begin{figure}[t]
#   \centering
#   \includegraphics[width=\columnwidth]{diagram.png}
#   \caption{System Architecture}\label{fig:arch}
# \end{figure}
```

**Why not TikZ for complex diagrams?** Models frequently produce broken TikZ code for >6 node graphs with conditional branches, multi-path convergence, and side annotations. The compilation-debug cycle wastes time. Playwright+CSS handles any layout natively, and 2× screenshots at A4 width give ~300dpi - indistinguishable from vector at print resolution.

### Complex Diagram Decomposition

When a diagram exceeds **12 nodes, 3 subgroups, or fills more than 40% of page height**, decompose into table + simplified overview:

```latex
% Step 1: Table carries the details
\begin{table}[htbp]
\centering
\caption{System Pipeline - Detailed Phases}\label{tab:pipeline}
\begin{tabular}{llp{5cm}}
\toprule
Phase & Module & Key Tasks \\
\midrule
Data Collection & Crawler & Crawl reviews, scrape prices, API calls \\
Data Processing & ETL Pipeline & Clean, tokenize, label, validate \\
Model Training & Trainer & Fine-tune LLM, distributed 64-GPU \\
Evaluation & Benchmark & A/B test, offline metrics, human eval \\
\bottomrule
\end{tabular}
\end{table}

% Step 2: Simplified TikZ shows only the flow skeleton
\begin{figure}[htbp]
\centering
\begin{tikzpicture}[
  box/.style={draw, rounded corners=2pt, minimum width=2cm,
              minimum height=0.6cm, align=center, font=\small\sffamily, fill=blue!5},
  arr/.style={-{Stealth[length=4pt]}, thick, gray!60}
]
  \node[box] (a) {Collection};
  \node[box, right=0.8cm of a] (b) {Processing};
  \node[box, right=0.8cm of b] (c) {Training};
  \node[box, right=0.8cm of c] (d) {Evaluation};
  \draw[arr] (a)--(b); \draw[arr] (b)--(c); \draw[arr] (c)--(d);
\end{tikzpicture}
\caption{Pipeline overview (see Table~\ref{tab:pipeline} for details).}\label{fig:pipeline-overview}
\end{figure}
```

**Rule of thumb**: The diagram gives intuition at a glance; the table carries precision.

**Common TikZ patterns**:
- Flowcharts: `positioning` + `arrows.meta` libraries
- Neural network layers: `fit` library + nested nodes
- Timelines: single axis with `\draw` segments
- Tree diagrams: `child` syntax or `forest` package

**CRITICAL: TikZ in multi-column documents (IEEE, ACM)**

Never place `tikzpicture` directly in multi-column body text - it overflows. Always wrap:

```latex
% Single-column figure (fits one column)
\begin{figure}[t]
\centering
\resizebox{\columnwidth}{!}{%
\begin{tikzpicture}[...]
  ...
\end{tikzpicture}
}
\caption{Architecture.}\label{fig:arch}
\end{figure}

% Full-width figure (spans both columns)
\begin{figure*}[t]
\centering
\resizebox{0.85\textwidth}{!}{%
\begin{tikzpicture}[...]
  ...
\end{tikzpicture}
}
\caption{System pipeline.}\label{fig:pipeline}
\end{figure*}
```

Rules: `\resizebox{\columnwidth}{!}` constrains width; `figure*` for tall diagrams; every figure needs `\caption` + `\label`; prefer `[t]` placement in two-column mode.

---

## §Scenario C: Algorithm Pseudocode

> Use standalone for a single algorithm sheet, or embed the `algorithm` environment into a §Standard Paper Workflow document.

For formal algorithm descriptions (research papers, technical specs):

```latex
\documentclass[11pt,a4paper]{article}
\usepackage[margin=2.5cm]{geometry}
\usepackage[ruled,vlined,linesnumbered]{algorithm2e}

\begin{document}

\begin{algorithm}[H]
\SetAlgoLined
\KwIn{Training set $\mathcal{D} = \{(x_i, y_i)\}_{i=1}^N$, learning rate $\eta$}
\KwOut{Optimized parameters $\theta^*$}
Initialize $\theta$ randomly\;
\For{epoch $= 1$ \KwTo $T$}{
  \ForEach{mini-batch $B \subset \mathcal{D}$}{
    $\mathcal{L} \leftarrow \frac{1}{|B|}\sum_{(x,y)\in B} \ell(f_\theta(x), y)$\;
    $\theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}$\;
  }
}
\Return{$\theta$}\;
\caption{Stochastic Gradient Descent}
\end{algorithm}

\end{document}
```

---

## §Exam Paper Rules (LaTeX)

> **Load this section** when generating exam papers, quizzes, worksheets, or exercises with mathematical content via LaTeX.

### Critical Anti-Pattern: `\parskip` + Loose Numbering = Blank Lines After Question Numbers

**This is the #1 visual defect in LaTeX exam papers.** When `\parskip` is set (e.g. `0.5em`) and question numbers are separated from question text by a blank line in the `.tex` source, LaTeX treats them as separate paragraphs — the `\parskip` gap makes it look like an intentional blank line after every number.

```latex
% ❌ WRONG — blank line between number and text = new paragraph + parskip gap
\noindent\textbf{3.}

某工厂原计划生产1200件产品……

% ❌ ALSO WRONG — even without blank line, if \parskip is large
\noindent\textbf{3.}  % line break here
某工厂原计划生产1200件产品……  % LaTeX treats this as same paragraph, but confusing

% ✅ CORRECT — number and text on the SAME LINE, no break
\noindent\textbf{3.}\;某工厂原计划生产1200件产品……
```

### Iron Rules

**Rule E1 — Question number + text = same paragraph (MANDATORY):**  
The question number (`\textbf{3.}`) and the question text MUST be on the same line in the `.tex` source, joined by `\;` or `\quad`. NEVER put a blank line or even a line break between them.

**Rule E2 — `\parskip` must be 0 or minimal for exam papers:**
```latex
% RECOMMENDED for exams: no parskip, control spacing explicitly
\setlength{\parskip}{0pt}          % No automatic paragraph spacing
\setlength{\parindent}{0pt}        % No indentation
% Use \vspace{} explicitly between questions for precise control
```
If `\parskip` is needed for other reasons, keep it ≤0.3em and be extra careful about blank lines in the source.

**Rule E3 — Use `enumitem` for structured numbering (PREFERRED):**  
Instead of manual `\noindent\textbf{1.}\;`, prefer `enumitem` with custom formatting:
```latex
\usepackage{enumitem}

% Section-level numbering: 一、二、三
% Question-level: use enumerate with custom label
\begin{enumerate}[label=\textbf{\arabic*.}, leftmargin=0pt, itemindent=2em,
                   labelsep=0.5em, itemsep=0.8em, parsep=0pt]
  \item 2024年巴黎奥运会共设有32个大项……
  \item 中国空间站"天宫"在距地面……
\end{enumerate}
```
This guarantees number and text are in the same paragraph (LaTeX `\item` handles it internally).

**Rule E4 — `tasks` environment for multi-column calculation items:**
```latex
\usepackage{tasks}
% 4-column oral calculation
\begin{tasks}[counter-format={(1)}, label-align=left,
              label-offset={0.5em}, label-width={2.5em},
              item-indent=3em, column-sep=2em](4)
  \task $\dfrac{3}{4}\times\dfrac{2}{9}=$ \underline{\hspace{2cm}}
  \task $\dfrac{5}{6}\div\dfrac{1}{3}=$ \underline{\hspace{2cm}}
\end{tasks}
```

**Rule E5 — Answer space reservation:**

| Question Type | LaTeX Implementation |
|--------------|---------------------|
| Fill-in-the-blank | `\underline{\hspace{2cm}}` inline |
| Short answer | `\vspace{2cm}` after question |
| Calculation | `\vspace{4cm}` (show-your-work space) |
| Proof / derivation | `\vspace{5cm}` |
| Drawing / graphing | TikZ grid or `\vspace{4cm}` |

**Rule E6 — Page breaks for exams:**
- `page-break-after: always` between major sections (一、二、三) is OK
- NEVER break within a single question (keep question + options + answer space together)
- Use `\needspace{5cm}` before long questions to prevent orphaning

### Complete Exam Preamble Template

```latex
\documentclass[12pt,a4paper]{article}
\usepackage[margin=2cm]{geometry}
\usepackage{ctex}               % CJK support
\usepackage{amsmath,amssymb}    % Math
\usepackage{enumitem}           % Structured lists
\usepackage{tasks}              % Multi-column exercises
\usepackage{tikz}               % Diagrams
\usepackage{graphicx}
\usepackage{array,tabularx}

\pagestyle{plain}
\setlength{\parindent}{0pt}     % No indent for exam papers
\setlength{\parskip}{0pt}       % ❗ ZERO parskip — control spacing via \vspace

% Utility commands
\newcommand{\blank}[1]{\underline{\hspace{#1}}}
\newcommand{\fn}[2]{\dfrac{#1}{#2}}

% Section header: 一、填空题（每空1分，共计10分）
\newcommand{\examsection}[1]{%
  \vspace{0.5cm}
  \noindent{\heiti #1}
  \vspace{0.3cm}
}
```

---

## §Resume / CV Templates

> **Skip this section** unless building a resume or CV.

Two templates available as separate files. Load the one you need:

| Template | Style | Best for | File |
|----------|-------|----------|------|
| **A: AltaCV** | Dual-column, sidebar, skill dots | Creative/tech/startup roles | `references/resume-altacv.tex` |
| **B: Academic CV** | Single-column, multi-page, publications | PhD apps, academic positions | `references/resume-academic.tex` |

**Route selection:**

| Scenario | Recommended |
|----------|-------------|
| Corporate job / ATS parsing | **Report brief** - ReportLab ATS-friendly template |
| Creative/tech/startup | **This brief** - Template A |
| Academic position / PhD | **This brief** - Template B |
| Chinese-only, simple format | **Report brief** - ReportLab (best CJK support) |

**Usage:**

1. Read the template file: `references/resume-altacv.tex` or `references/resume-academic.tex`
2. Replace placeholder content with user's information
3. Compile: `python3 "$PDF_SKILL_DIR/scripts/pdf.py" convert.latex resume.tex --runs 2`

**🔴 Resume Text Overlap Prevention:**

> AltaCV dual-column resumes are the #1 source of text overlap bugs. The sidebar and main column share vertical space but are positioned independently.

- **Column ratio sanity check:** `\columnratio{0.62}` means left column = 62%, right = 38%. If either column overflows, content bleeds into the other. Reduce ratio if left column has too much content.
- **Section spacing:** Always use `\medskip` or `\smallskip` between items - zero spacing causes lines to overlap
- **Skill dots:** Each `\cvskill` row has fixed height. If more than 8-10 skills, switch to a compact text list instead of dots
- **Experience entries:** Long descriptions in `\cvevent` can push content below the page. Use \textbf{max 3-4 bullet points per entry}
- **Two-page overflow:** If content exceeds 1 page, explicitly add `\newpage` and restart column layout. Do NOT let LaTeX auto-break the `paracol` environment - it misaligns columns on page 2
- **Compile twice:** Always `--runs 2` to resolve cross-references and stabilize column breaks

**🔴 Resume Minimum Font Size:**
- **Hard floor: 12px (9pt).** No text in the resume may render smaller than 12px, including footnotes, contact info, dates, and skill labels.

**🔴 Resume Line-Break Rules:**
- English: prefer breaking at word boundaries. Long words may be split at syllable boundaries with a hyphen (`-`) - standard typographic practice (e.g., `experi-\nence`).
- CJK: break between characters, but never separate punctuation from preceding character.
- Mixed content: respect both rules.
- Dates/ranges ("Jan 2022 - Present") must stay as one unit.

**🔴 Resume Page-Fill:**
- Content must fill ≥85% of page height. If content is sparse, increase spacing (`\medskip` → `\bigskip`), increase font size slightly, or add sections (Summary, Awards, Projects). Never leave visible blank area > 3cm at page bottom.

**Template A customisation quick-reference:**

| What to change | How |
|---------------|-----|
| Column ratio | `\columnratio{0.62}` → e.g. `{0.55}` |
| Accent colour | `\definecolor{accent}{HTML}{3B82F6}` → any hex |
| Skill dot count | `\foreach \x in {1,...,5}` → `{1,...,4}` |
| Icons | [FontAwesome5 gallery](http://texdoc.net/pkg/fontawesome5) |
| Font family | Replace `roboto`/`lato` with any LaTeX font package |
| Page margins | `\geometry{margin=1.25cm,...}` |

**Template B customisation:**

| What to change | How |
|---------------|-----|
| Accent colour | `\definecolor{accent}{HTML}{1F4E79}` → any hex |
| Header text | `\fancyhead[L]` content |
| Section style | `\titleformat{\section}` block |

---

## Reference

### Package Catalogue

**Foundational**: `hyperref` · `geometry` · `listings` · `enumitem`

**Tabular**: `booktabs` · `longtable` · `multirow` · `array` · `colortbl`

**Visual & Charting**: `tikz` · `pgfplots` · `float` · `wrapfig` · `subfig` / `subcaption`

**International & Typography**: `fontspec` (XeLaTeX/LuaLaTeX) · `ctex`

**Mathematical**: `amsmath` · `amssymb` · `amsthm` · `natbib` · `biblatex` · `siunitx`

**Algorithmic & Domain-Specific**: `algorithm` + `algpseudocode` · `chemfig`

**Page Design**: `tcolorbox` · `fancyhdr` · `titlesec` · `tocloft` · `multicol` · `setspace` · `microtype` · `parskip` · `adjustbox` · `marginnote`

**Code Listings**: `listings` · `minted` (depends on Pygments)

### Scripts & Backends

| Script | Purpose |
|--------|---------|
| `pdf.py convert.latex` | Tectonic wrapper - log sanitisation, error highlighting, PDF metrics |

### Operational Notes

**CJK**: `\usepackage{ctex}` - Tectonic pulls font bundles on the fly, zero manual install.

**Cold-start**: First compilation downloads packages (1-5 min). Cached builds: 10-30s.

**Offline**: Cached packages in `~/.cache/Tectonic/` work offline. New packages require network.

**Tectonic vs TeX Live:**

| Dimension | Tectonic | Traditional pdflatex |
|-----------|----------|---------------------|
| Package acquisition | On-demand, transparent | Manual via `tlmgr` |
| Multi-pass compilation | Handled by engine | Explicit re-invocations |
| Disk footprint | Single binary | Full TeX Live ≈ 4 GB |

**Bundled binary note:** The `scripts/tectonic` binary shipped with this skill is a **macOS arm64 (Apple Silicon)** executable. It will NOT work on other platforms. If `pdf.py convert.latex` reports "tectonic command not found", run `python3 pdf.py status` to see platform-specific installation instructions, or install manually:

| Platform | Install Command |
|----------|----------------|
| macOS (Homebrew) | `brew install tectonic` |
| macOS (binary) | `curl -sSL https://drop-sh.fullyjustified.net \| sh` |
| Debian / Ubuntu | `apt install tectonic` (if available) or conda/binary |
| Arch Linux | `pacman -S tectonic` |
| Conda (any OS) | `conda install -c conda-forge tectonic` |
| Windows (scoop) | `scoop install tectonic` |
| Windows (choco) | `choco install tectonic` |

After installing, verify: `tectonic --version`. The `_find_tectonic()` function searches: `scripts/tectonic` → `~/tectonic` → system PATH.


---

> **⚠️ Legacy Note:** Academic covers previously used the ReportLab canvas *recipe* API (cover_recipe_A/B/C/D/L) and, later, HTML/Playwright templates. Both are **deprecated**. Academic covers now use the ReportLab **cover engine** `scripts/cover_render.py` (templates 06–09; see `typesetting/cover.md` and the pipeline near the top of this file). Do NOT hand-write cover canvas code or cover HTML.

### ⚠️ Post-Cover Generation Checks (Mandatory)

Render the cover with `cover_render.py`, merge as page 1, then run `pdf_qa.py` on the merged PDF:

```bash
# Step 1: Render cover (template 06/07/08/09) — pure ReportLab, no HTML
python3 "$PDF_SKILL_DIR/scripts/cover_render.py" 07 --out cover.pdf --content cover_content.json
# Step 2: Merge cover as page 1 of the Tectonic body (see the pypdf snippet near the top of this file)
# Step 3: PDF check on the merged file
python3 "$PDF_SKILL_DIR/scripts/pdf_qa.py" final.pdf --skip-cover --formulas

# MANDATORY: Post-generation pipeline
python3 "$PDF_SKILL_DIR/scripts/pdf.py" meta.brand final.pdf
python3 "$PDF_SKILL_DIR/scripts/pdf.py" pages.clean final.pdf -o final_clean.pdf
python3 "$PDF_SKILL_DIR/scripts/pdf.py" font.check final.pdf
python3 "$PDF_SKILL_DIR/scripts/pdf.py" toc.check final.pdf
```
- `poster_validate.py` checks: font fallback, overflow:hidden, @media screen, background color consistency, etc.
- `pdf_qa.py` checks: cover full-bleed, blank pages, CJK punctuation, overflow, margin symmetry, font embedding, metadata, formula overflow
- `meta.brand` writes Title/Author/Creator metadata
- `pages.clean` removes accidental blank pages
- `font.check` scans for missing glyphs (□ tofu)
- `toc.check` verifies TOC entries, page numbers, and links
- Any ERROR item → fix and regenerate

### Merging Cover with Body

```python
from pypdf import PdfReader, PdfWriter

def merge_cover_body(cover_path, body_path, output_path):
    writer = PdfWriter()
    for page in PdfReader(cover_path).pages:
        writer.add_page(page)
    for page in PdfReader(body_path).pages:
        writer.add_page(page)
    with open(output_path, 'wb') as f:
        writer.write(f)
```
