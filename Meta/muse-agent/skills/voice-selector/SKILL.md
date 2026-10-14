---
name: "voice_selector"
description: "Provides the static system voice catalog used by Jarvis. It does not define a user-facing workflow."
metadata: { "includeInPrompt": false, "voiceOnly": true }
---

# Voice Catalog Data

This directory exists only to ship `voice_source.json`, the system voice catalog
consumed by Jarvis. It does not define a user-facing voice workflow.

Do not use this skill to handle voice requests, choose voices, or create widgets.  
Follow the active agent instructions and use `muse.voice_options` for voice
selection and design.
