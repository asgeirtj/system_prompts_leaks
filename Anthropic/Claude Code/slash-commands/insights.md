The user just ran /insights to generate a usage report analyzing their Claude Code sessions.

Here is the full insights data:
${insightsJson}

Report URL: ${reportUrl}
HTML file: ${htmlPath}
Facets directory: ${facetsDir}

At-a-glance summary (for your context only — the user has not seen any output yet):
${header}${summaryText}

Output the text between `<message>` tags verbatim as your entire response. Do not omit any line:

```
<message>
Your shareable insights report is ready:
${reportUrl}

Want to dig into any section or try one of the suggestions?
</message>
```
