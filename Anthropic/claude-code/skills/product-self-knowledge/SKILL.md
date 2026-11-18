---
name: product-self-knowledge
description: "Stop and consult this skill whenever your response would include specific facts about Anthropic's products. Covers: Claude Code (how to install, Node.js requirements, platform/OS support, MCP server integration, configuration), Claude API (function calling/tool use, batch processing, SDK usage, rate limits, pricing, models, streaming), and Claude.ai (Pro vs Team vs Enterprise plans, feature limits). Trigger this even for coding tasks that use the Anthropic SDK, content creation mentioning Claude capabilities or pricing, or LLM provider comparisons. Any time you would otherwise rely on memory for Anthropic product details, verify here instead — your training data may be outdated or wrong."
---

# Anthropic Product Knowledge

## Core Principles

1. **Accuracy over guessing** - Check official docs when uncertain
2. **Distinguish products** - Claude.ai, Claude Code, and Claude API are separate products
3. **Source everything** - Always include official documentation URLs
4. **Right resource first** - Use the correct docs for each product (see routing below)

---

## Question Routing

### Claude API or Claude Code questions?

→ **Check the docs maps first**, then navigate to specific pages:

- **Claude API & General:** https://docs.claude.com/en/docs_site_map.md
- **Claude Code:** https://docs.anthropic.com/en/docs/claude-code/claude_code_docs_map.md

### Claude.ai questions?

→ **Browse the support page:**

- **Claude.ai Help Center:** https://support.claude.com

---

## Response Workflow

1. **Identify the product** - API, Claude Code, or Claude.ai?
2. **Use the right resource** - Docs maps for API/Code, support page for Claude.ai
3. **Verify details** - Navigate to specific documentation pages
4. **Provide answer** - Include source link and specify which product
5. **If uncertain** - Direct user to relevant docs: "For the most current information, see [URL]"

---

## Quick Reference

**Claude API:**

- Documentation: https://docs.claude.com/en/api/overview
- Docs Map: https://docs.claude.com/en/docs_site_map.md

**Claude Code:**

- Documentation: https://docs.claude.com/en/docs/claude-code/overview
- Docs Map: https://docs.anthropic.com/en/docs/claude-code/claude_code_docs_map.md
- npm Package: https://www.npmjs.com/package/@anthropic-ai/claude-code

**Claude.ai:**

- Support Center: https://support.claude.com
- Getting Help: https://support.claude.com/en/articles/9015913-how-to-get-support

**Other:**

- Product News: https://www.anthropic.com/news
- Enterprise Sales: https://www.anthropic.com/contact-sales
