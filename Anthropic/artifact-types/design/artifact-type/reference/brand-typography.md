# Anthropic brand typography

Source: the design team's anthropic-design skill `typography.css`  
(2025-12-11). Font FILES are deliberately not bundled here (see  
README.md); author the named family first with honest fallbacks —
where Anthropic fonts aren't installed, the fallback stack renders.

## Stacks (use verbatim in inline styles)

- Sans (UI text, labels, body):  
  `'Anthropic Sans', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- Serif (display headings, editorial voice):  
  `'Anthropic Serif', Georgia, 'Times New Roman', Times, serif`
- Mono (code):  
  `'Anthropic Mono', 'JetBrains Mono', 'SF Mono', Monaco, 'Courier New', monospace`

Both Anthropic Sans and Serif are variable weight 300–800.

## Scale (from the brand type system)

| Role | Family | Size | Weight | Line height |
|------|--------|------|--------|-------------|
| Display (hero) | Serif | 38px | 330 | 1.2 |
| Title | Serif | 28px | 500 | 1.3 |
| Heading | Serif | 24px | 500 | 1.3 |
| UI XL | Sans | 20px | 400 | 1.4 |
| Body | Sans | 16px | 400 | 1.5 |
| Small/labels | Sans | 14px | 400 | 1.4 |
| Caption | Sans | 12px | 400 | 1.35 |

Letter-spacing stays 0; the brand look is set by the warm palette,
generous whitespace, and serif display over sans body — not by
tracking tricks. Headings in Serif at moderate weights (330–500),
never faux-bold. Avoid the overused AI-default families (Inter,
Roboto, Arial, Fraunces) as primary choices when the brand look is
wanted — Arial/Helvetica appear only inside the fallback stacks.
