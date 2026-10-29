# Equation implementation reference

When the requested document or source contains mathematical equations, choose the equation representation deliberately. Never leave raw LaTeX in the document or approximate structured notation with plain text.

1. **Prefer native Word equations (OMML, such as `<m:oMath>` or `<m:oMathPara>`)** when the user
   asks for native or editable equations, when an existing DOCX already uses native equations, or
   when equations need to remain searchable, accessible, copyable, inline with prose, or easy to
   revise. Use native equations only through a tested OMML authoring path, and verify that Word and
   the final LibreOffice render preserve the notation correctly.
2. **Use the rendered MathJax fallback below** when native/editable math is not required and either
   no reliable OMML authoring path is available or a complex display equation needs predictable
   visual fidelity across renderers. This path produces an image, not a native Word equation. It is
   best for stable display equations where portability matters more than editability.

Do not silently rasterize an equation when the user explicitly requires native or editable Word
math. If no tested OMML path is available, explain that limitation rather than mislabeling an image
as native. When editing an existing DOCX, preserve its equation representation unless the request or
render QA gives a clear reason to change it.

### Rendered fallback: MathJax to high-resolution PNG

The standard artifact container includes Node.js, `mathjax-full`, `sharp`, and `python-docx`. Use  
MathJax to render LaTeX to SVG, then rasterize it to a high-resolution transparent PNG for reliable
insertion with `python-docx` and reliable LibreOffice rendering:

```javascript
"use strict";

const sharp = require("sharp");

let _mathjax;
let _adaptor;
let _doc;

function ensureMathJax() {
  if (_mathjax && _adaptor && _doc) return;
  const { mathjax } = require("mathjax-full/js/mathjax.js");
  const { TeX } = require("mathjax-full/js/input/tex.js");
  const { SVG } = require("mathjax-full/js/output/svg.js");
  const { liteAdaptor } = require("mathjax-full/js/adaptors/liteAdaptor.js");
  const { RegisterHTMLHandler } = require("mathjax-full/js/handlers/html.js");
  const { AllPackages } = require("mathjax-full/js/input/tex/AllPackages.js");

  _adaptor = liteAdaptor();
  RegisterHTMLHandler(_adaptor);
  const tex = new TeX({ packages: AllPackages });
  const out = new SVG({ fontCache: "local" });
  _doc = mathjax.document("", { InputJax: tex, OutputJax: out });
  _mathjax = mathjax;
}

function latexToSvgDataUri(latex, display = true) {
  ensureMathJax();
  const html = _adaptor.outerHTML(_doc.convert(latex, { display }));
  const a = html.indexOf("<svg");
  const b = html.indexOf("</svg>");
  let svg = a !== -1 && b !== -1 ? html.slice(a, b + 6) : html;
  svg = svg.replace(/<\?xml[^>]*>/g, "");
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svg)) {
    svg = svg.replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ');
  }
  svg = svg.replace(/(width|height)="([0-9.]+)(ex|em)"/g, (_m, attr, num) => {
    const px = Math.round(parseFloat(num) * 8.5);
    return `${attr}="${px}px"`;
  });
  svg = svg.replace(/currentColor/g, "#000000");
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

async function latexToPng(latex, outputPath, display = true) {
  const dataUri = latexToSvgDataUri(latex, display);
  const svg = Buffer.from(dataUri.split(",", 2)[1], "base64");
  await sharp(svg, { density: 300 }).png().toFile(outputPath);
}

latexToPng(
  String.raw`\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}`,
  "/mnt/data/equation.png",
).catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Insert the PNG at an intentional physical size without stretching it:

```python
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches

doc = Document()
paragraph = doc.add_paragraph()
paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
paragraph.add_run().add_picture("/mnt/data/equation.png", width=Inches(2.6))
doc.save("/mnt/data/output/equations.docx")
```

Use `String.raw` for LaTeX strings so JavaScript preserves backslashes. Choose `display=true` for
standalone equations and `display=false` for compact inline-style expressions. After using either
native OMML or the rendered fallback, run the normal `render_docx.py` workflow and inspect every
equation in the rendered page PNGs for missing glyphs, clipping, blur, poor sizing, or bad page
breaks.
