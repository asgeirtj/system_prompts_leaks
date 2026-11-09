---
name: insights
description: Generate a report analyzing your Claude Code sessions
disable-model-invocation: true
---

The user just ran /insights to generate a usage report analyzing their Claude Code sessions.

Here is the full insights data:
```yaml
{
  "project_areas": {
    "areas": [
      {
        "name": "{{NAME}}",
        "session_count": {{SESSION_COUNT}},
        "description": "{{DESCRIPTION}}"
      }
    ]
  },
  "interaction_style": {
    "narrative": "{{NARRATIVE}}",
    "key_pattern": "{{KEY_PATTERN}}"
  },
  "what_works": {
    "intro": "{{INTRO}}",
    "impressive_workflows": [
      {
        "title": "{{TITLE}}",
        "description": "{{DESCRIPTION}}"
      }
    ]
  },
  "friction_analysis": {
    "intro": "{{INTRO}}",
    "categories": [
      {
        "category": "{{CATEGORY}}",
        "description": "{{DESCRIPTION}}",
        "examples": [
          "{{EXAMPLE}}"
        ]
      }
    ]
  },
  "suggestions": {
    "claude_md_additions": [
      {
        "addition": "{{ADDITION}}",
        "why": "{{WHY}}",
        "prompt_scaffold": "{{PROMPT_SCAFFOLD}}"
      }
    ],
    "features_to_try": [
      {
        "feature": "{{FEATURE}}",
        "one_liner": "{{ONE_LINER}}",
        "why_for_you": "{{WHY_FOR_YOU}}",
        "example_code": "{{EXAMPLE_CODE}}"
      }
    ],
    "usage_patterns": [
      {
        "title": "{{TITLE}}",
        "suggestion": "{{SUGGESTION}}",
        "detail": "{{DETAIL}}",
        "copyable_prompt": "{{COPYABLE_PROMPT}}"
      }
    ]
  },
  "on_the_horizon": {
    "intro": "{{INTRO}}",
    "opportunities": [
      {
        "title": "{{TITLE}}",
        "whats_possible": "{{WHATS_POSSIBLE}}",
        "how_to_try": "{{HOW_TO_TRY}}",
        "copyable_prompt": "{{COPYABLE_PROMPT}}"
      }
    ]
  },
  "fun_ending": {
    "headline": "{{HEADLINE}}",
    "detail": "{{DETAIL}}"
  },
  "at_a_glance": {
    "whats_working": "{{WHATS_WORKING}}",
    "whats_hindering": "{{WHATS_HINDERING}}",
    "quick_wins": "{{QUICK_WINS}}",
    "ambitious_workflows": "{{AMBITIOUS_WORKFLOWS}}"
  }
}
```

Report URL: `file:///Users/asgeirtj/.claude/usage-data/report-2026-11-09-233458.html`  
HTML file: `/Users/asgeirtj/.claude/usage-data/report-2026-11-09-233458.html`  
Facets directory: `/Users/asgeirtj/.claude/usage-data/facets`

At-a-glance summary (for your context only — the user has not seen any output yet):

# Claude Code Insights

{{TOTAL_SESSIONS}} sessions total · {{ANALYZED_SESSIONS}} analyzed · {{MESSAGES}} messages · {{HOURS}}h · {{COMMITS}} commits  
{{START_DATE}} to {{END_DATE}}

## At a Glance

**What's working:** {{WHATS_WORKING}} See _Impressive Things You Did_.

**What's hindering you:** {{WHATS_HINDERING}} See _Where Things Go Wrong_.

**Quick wins to try:** {{QUICK_WINS}} See _Features to Try_.

**Ambitious workflows:** {{AMBITIOUS_WORKFLOWS}} See _On the Horizon_.

Respond with exactly the following, and nothing else. Do not add, omit, or reword any line:

Your shareable insights report is ready:  
`file:///Users/asgeirtj/.claude/usage-data/report-2026-11-09-233458.html`

Tip: you already use auto mode — run /auto-mode-setup once to teach it your environment and improve its decisions.

Want to dig into any section or try one of the suggestions?