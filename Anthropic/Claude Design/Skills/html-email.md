# HTML email

Design an HTML email as ONE self-contained .html file that survives
real email clients. Email rendering is not browser rendering — Gmail,
Outlook, and Apple Mail each strip or mangle different things, and the
rules below are what reliably survives all three. When a rule here
conflicts with normal web-design instincts, the rule wins.

Layout and styling:
- Structure with nested <table role="presentation" cellpadding="0"
  cellspacing="0" border="0"> — no flexbox, no grid, no floats, no
  position. One centered wrapper table, max-width 600px, single-column
  flow (stacked rows beat side-by-side columns).
- Inline EVERY style on the element it styles. A <style> block in
  <head> may additionally carry only what can't inline (media queries,
  dark-mode tweaks) — several clients drop it entirely, so the email
  must read correctly from inline styles alone.
- No JavaScript anywhere (universally stripped). No external
  stylesheets. No web fonts — use email-safe stacks (Arial, Helvetica,
  Georgia, Verdana, Tahoma, 'Courier New') with generic fallbacks.
- Build the visual design out of colored table cells, borders, spacer
  cells, and type — not images. There is nowhere to host project
  images from here: a referenced project file will not exist for
  recipients. If imagery is essential, leave a clearly-marked
  placeholder cell with alt text and tell the user to swap in a hosted
  https URL before sending.
- Buttons are "bulletproof": a padded <td> with bgcolor and inline
  border-radius, the <a> filling it with display:block and inline
  color — never an image, never a styled <button>.

Client quirks that matter:
- Outlook (Word engine): give every table/cell explicit widths; set
  line-height with mso-line-height-rule:exactly; wrap Outlook-only
  fixes in <!--[if mso]> … <![endif]--> conditionals.
- Gmail clips messages beyond ~100KB of HTML — stay well under.
- Add <meta name="color-scheme" content="light dark"> and pick colors
  that survive dark-mode inversion (avoid pure #000/#fff backgrounds;
  test text on mid-tone fills).

Deliverability and accessibility:
- First element in <body>: a hidden preheader span (~85 chars) that
  previews next to the subject line.
- alt text on any image, lang on <html>, real <a href> links (no
  dead # anchors), and a footer with a plausible unsubscribe line and
  postal address for anything marketing-shaped.

Show the design at 600px; mention in your reply that the file is
send-ready HTML the user can drop into their email tool.
