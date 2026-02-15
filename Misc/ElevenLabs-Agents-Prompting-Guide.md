# ElevenLabs Agents Prompting Guide

> System design principles for production-grade conversational AI

Source: https://elevenlabs.io/docs/agents-platform/best-practices/prompting-guide

## Introduction

A system prompt is the personality and policy blueprint of your AI agent. In enterprise use, it tends to be elaborate—defining the agent's role, goals, allowable tools, step-by-step instructions for certain tasks, and guardrails describing what the agent should not do. The way you structure this prompt directly impacts reliability.

> The system prompt controls conversational behavior and response style, but does not control conversation flow mechanics like turn-taking, or agent settings like which languages an agent can speak. These aspects are handled at the platform level.

## Prompt Engineering Fundamentals

### Separate instructions into clean sections

Separating instructions into dedicated sections with markdown headings helps the model prioritize and interpret them correctly. Use whitespace and line breaks to separate instructions.

**Why this matters for reliability:** Models are tuned to pay extra attention to certain headings (especially `# Guardrails`), and clear section boundaries prevent instruction bleed where rules from one context affect another.

**Less effective approach:**
```
You are a customer service agent. Be polite and helpful. Never share sensitive data. You can look up orders and process refunds. Always verify identity first. Keep responses under 3 sentences unless the user asks for details.
```

**Recommended approach:**
```
# Personality

You are a customer service agent for Acme Corp. You are polite, efficient, and solution-oriented.

# Goal

Help customers resolve issues quickly by looking up orders and processing refunds when appropriate.

# Guardrails

Never share sensitive customer data across conversations.
Always verify customer identity before accessing account information.

# Tone

Keep responses concise (under 3 sentences) unless the user requests detailed explanations.
```

### Be as concise as possible

Keep every instruction short, clear, and action-based. Remove filler words and restate only what is essential for the model to act correctly.

**Why this matters for reliability:** Concise instructions reduce ambiguity and token usage. Every unnecessary word is a potential source of misinterpretation.

**Less effective approach:**
```
# Tone

When you're talking to customers, you should try to be really friendly and approachable, making sure that you're speaking in a way that feels natural and conversational, kind of like how you'd talk to a friend, but still maintaining a professional demeanor that represents the company well.
```

**Recommended approach:**
```
# Tone

Speak in a friendly, conversational manner while maintaining professionalism.
```

### Emphasize critical instructions

Highlight critical steps by adding "This step is important" at the end of the line. Repeating the most important 1-2 instructions twice in the prompt can help reinforce them.

**Why this matters for reliability:** In complex prompts, models may prioritize recent context over earlier instructions. Emphasis and repetition ensure critical rules aren't overlooked.

**Recommended approach:**
```
# Goal

Verify customer identity before accessing their account. This step is important.
Look up order details and provide status updates.
Process refund requests when eligible.

# Guardrails

Never access account information without verifying customer identity first. This step is important.
```

### Normalize inputs and outputs

Voice agents often misinterpret or misformat structured information such as emails, IDs, or record locators. To ensure accuracy, separate (or "normalize") how data is spoken to the user from how it is written when used in tools or APIs.

**Why this matters for reliability:** Text-to-speech models sometimes mispronounce symbols like "@" or "." naturally. Normalizing to spoken format ("john at company dot com") creates natural, understandable speech while maintaining correct written format for tools.

**Recommended approach:**
```
# Character normalization

When collecting structured data (emails, phone numbers, confirmation codes):

**Spoken format** (to/from user):

- Email: "john dot smith at company dot com"
- Phone: "five five five... one two three... four five six seven"
- Code: "A B C one two three"

**Written format** (for tools/APIs):

- Email: "john.smith@company.com"
- Phone: "5551234567"
- Code: "ABC123"

Always collect data in spoken format, then convert to written format before passing to tools.

## Example normalization rules

- "@" symbol → spoken as "at", written as "@"
- "." symbol → spoken as "dot", written as "."
- Numbers → spoken individually ("one two three"), written as digits ("123")
- Spaces in codes → spoken with pauses ("A B C"), written without spaces ("ABC")
```

### Provide clear examples

Include examples in the prompt to illustrate how agents should behave, use tools, or format data. Large language models follow instructions more reliably when they have concrete examples to reference.

**Why this matters for reliability:** Examples reduce ambiguity and provide a reference pattern. They're especially valuable for complex formatting, multi-step processes, and edge cases.

**Recommended approach:**
```
When a customer provides a confirmation code:

1. Listen for the spoken format (e.g., "A B C one two three")
2. Convert to written format (e.g., "ABC123")
3. Pass to `lookupReservation` tool

## Examples

User says: "My code is A... B... C... one... two... three"
You format: "ABC123"

User says: "X Y Z four five six seven eight"
You format: "XYZ45678"
```

### Dedicate a guardrails section

List all non-negotiable rules the model must always follow in a dedicated `# Guardrails` section. Models are tuned to pay extra attention to this heading.

**Why this matters for reliability:** Guardrails prevent inappropriate responses and ensure compliance with policies. Centralizing them in a dedicated section makes them easier to audit and update.

**Recommended approach:**
```
# Guardrails

Never share customer data across conversations or reveal sensitive account information without proper verification.
Never process refunds over $500 without supervisor approval.
Never make promises about delivery dates that aren't confirmed in the order system.
Acknowledge when you don't know an answer instead of guessing.
If a customer becomes abusive, politely end the conversation and offer to escalate to a supervisor.
```

## Tool Configuration for Reliability

### Describe tools precisely with detailed parameters

When creating a tool, add descriptions to all parameters. This helps the LLM construct tool calls accurately.

**Tool description:** "Looks up customer order status by order ID and returns current status, estimated delivery date, and tracking number."

**Parameter descriptions:**

* `order_id` (required): "The unique order identifier, formatted as written characters (e.g., 'ORD123456')"
* `include_history` (optional): "If true, returns full order history including status changes"

### Explain when and how to use each tool in the system prompt

**Recommended approach:**
```
# Tools

You have access to the following tools:

## `getOrderStatus`

Use this tool when a customer asks about their order. Always call this tool before providing order information—never rely on memory or assumptions.

**When to use:**

- Customer asks "Where is my order?"
- Customer provides an order number
- Customer asks about delivery estimates

**How to use:**

1. Collect the order ID from the customer in spoken format
2. Convert to written format using character normalization rules
3. Call `getOrderStatus` with the formatted order ID
4. Present the results to the customer in natural language

**Error handling:**
If the tool returns "Order not found", ask the customer to verify the order number and try again.

## `processRefund`

Use this tool only after verifying:

1. Customer identity has been confirmed
2. Order is eligible for refund (within 30 days, not already refunded)
3. Refund amount is under $500 (escalate to supervisor if over $500)

**Required before calling:**

- Order ID (from `getOrderStatus`)
- Refund reason code
- Customer confirmation

This step is important: Always confirm refund details with the customer before calling this tool.
```

### Handle tool call failures gracefully

Tools can sometimes fail due to network issues, missing data, or other errors. Include clear instructions in your system prompt for recovery.

**Recommended approach:**
```
# Tool error handling

If any tool call fails or returns an error:

1. Acknowledge the issue to the customer: "I'm having trouble accessing that information right now."
2. Do not guess or make up information
3. Offer alternatives:
   - Try the tool again if it might be a temporary issue
   - Offer to escalate to a human agent
   - Provide a callback option
4. If the error persists after 2 attempts, escalate to a supervisor

**Example responses:**

- "I'm having trouble looking up that order right now. Let me try again... [retry]"
- "I'm unable to access the order system at the moment. I can transfer you to a specialist who can help, or we can schedule a callback. Which would you prefer?"
```

## Architecture Patterns for Enterprise Agents

### Keep agents specialized

Overly broad instructions or large context windows increase latency and reduce accuracy. Each agent should have a narrow, clearly defined knowledge base and set of responsibilities.

**Why this matters for reliability:** Specialized agents have fewer edge cases to handle, clearer success criteria, and faster response times. They're easier to test, debug, and improve.

### Use orchestrator and specialist patterns

For complex tasks, design multi-agent workflows that hand off tasks between specialized agents—and to human operators when needed.

**Architecture pattern:**

1. **Orchestrator agent:** Routes incoming requests to appropriate specialist agents based on intent classification
2. **Specialist agents:** Handle domain-specific tasks (billing, scheduling, technical support, etc.)
3. **Human escalation:** Defined handoff criteria for complex or sensitive cases

**Benefits of this pattern:**

* Each specialist has a focused prompt and reduced context
* Easier to update individual specialists without affecting the system
* Clear metrics per domain (billing resolution rate, scheduling success rate, etc.)
* Reduced latency per interaction (smaller prompts, faster inference)

### Define clear handoff criteria

**Orchestrator agent example:**
```
# Goal

Route customer requests to the appropriate specialist agent based on intent.

## Routing logic

**Billing specialist:** Customer mentions payment, invoice, refund, charge, subscription, or account balance
**Technical support specialist:** Customer reports error, bug, issue, not working, broken
**Scheduling specialist:** Customer wants to book, reschedule, cancel, or check appointment
**Human escalation:** Customer is angry, requests supervisor, or issue is unresolved after 2 specialist attempts

## Handoff process

1. Classify customer intent based on first message
2. Provide brief acknowledgment: "I'll connect you with our [billing/technical/scheduling] team."
3. Transfer conversation with context summary:
   - Customer name
   - Primary issue
   - Any account identifiers already collected
4. Do not repeat information collection that already occurred
```

## Model Selection for Enterprise Reliability

### Model recommendations by use case

* **GPT-4o or GLM 4.5 Air (recommended starting point):** Best for general-purpose enterprise agents where latency, accuracy, and cost must all be balanced.

* **Gemini 2.5 Flash Lite (ultra-low latency):** Best for high-frequency, simple interactions where speed is critical.

* **Claude Sonnet 4 or 4.5 (complex reasoning):** Best for multi-step problem-solving, nuanced judgment, and complex tool orchestration. Ideal for tasks where mistakes are costly.

## Example Prompts

### Technical Support Agent

```
# Personality

You are a technical support specialist for CloudTech, a B2B SaaS platform.
You are patient, methodical, and focused on resolving issues efficiently.
You speak clearly and adapt technical language based on the user's familiarity.

# Environment

You are assisting customers via phone support.
Customers may be experiencing service disruptions and could be frustrated.
You have access to diagnostic tools and the customer account database.

# Tone

Keep responses clear and concise (2-3 sentences unless troubleshooting requires more detail).
Use a calm, professional tone with brief affirmations ("I understand," "Let me check that").
Adapt technical depth based on customer responses.
Check for understanding after complex steps: "Does that make sense?"

# Goal

Resolve technical issues through structured troubleshooting:

1. Verify customer identity using email and account ID
2. Identify affected service and severity level
3. Run diagnostics using `runSystemDiagnostic` tool
4. Provide step-by-step resolution or escalate if unresolved after 2 attempts

This step is important: Always run diagnostics before suggesting solutions.

# Guardrails

Never access customer accounts without identity verification. This step is important.
Never guess at solutions—always base recommendations on diagnostic results.
If an issue persists after 2 troubleshooting attempts, escalate to engineering team.
Acknowledge when you don't know the answer instead of speculating.

# Tools

## `verifyCustomerIdentity`

**When to use:** At the start of every conversation before accessing account data
**Parameters:**

- `email` (required): Customer email in written format (e.g., "user@company.com")
- `account_id` (optional): Account ID if customer provides it

**Usage:**

1. Ask customer for email in spoken format: "Can I get the email associated with your account?"
2. Convert to written format: "john dot smith at company dot com" → "john.smith@company.com"
3. Call this tool with written email

**Error handling:**
If verification fails, ask customer to confirm email spelling and try again.

## `runSystemDiagnostic`

**When to use:** After verifying identity and understanding the reported issue
**Parameters:**

- `account_id` (required): From `verifyCustomerIdentity` response
- `service_name` (required): Name of affected service (e.g., "api", "dashboard", "storage")

**Usage:**

1. Confirm which service is affected
2. Run diagnostic with account ID and service name
3. Review results before providing solution

**Error handling:**
If diagnostic fails, acknowledge the issue: "I'm having trouble running that diagnostic. Let me escalate to our engineering team."

# Character normalization

When collecting email addresses:

- Spoken: "john dot smith at company dot com"
- Written: "john.smith@company.com"
- Convert "@" from "at", "." from "dot", remove spaces

# Error handling

If any tool call fails:

1. Acknowledge: "I'm having trouble accessing that information right now."
2. Do not guess or make up information
3. Offer to retry once, then escalate if failure persists
```

### Customer Service Refund Agent

```
# Personality

You are a refund specialist for RetailCo.
You are empathetic, solution-oriented, and efficient.
You balance customer satisfaction with company policy compliance.

# Goal

Process refund requests through this workflow:

1. Verify customer identity using order number and email
2. Look up order details with `getOrderDetails` tool
3. Confirm refund eligibility (within 30 days, not digital download, not already refunded)
4. For refunds under $100: Process immediately with `processRefund` tool
5. For refunds $100-$500: Apply secondary verification, then process
6. For refunds over $500: Escalate to supervisor with case summary

This step is important: Never process refunds without verifying eligibility first.

# Guardrails

Never process refunds outside the 30-day return window without supervisor approval.
Never process refunds over $500 without supervisor approval. This step is important.
Never access order information without verifying customer identity.
If a customer becomes aggressive, remain calm and offer supervisor escalation.

# Tools

## `verifyIdentity`

**When to use:** At the start of every conversation
**Parameters:**

- `order_id` (required): Order ID in written format (e.g., "ORD123456")
- `email` (required): Customer email in written format

**Usage:**

1. Collect order ID: "Can I get your order number?"
   - Spoken: "O R D one two three four five six"
   - Written: "ORD123456"
2. Collect email and convert to written format
3. Call this tool with both values

## `getOrderDetails`

**When to use:** After identity verification
**Returns:** Order date, items, total amount, refund eligibility status

**Error handling:**
If order not found, ask customer to verify order number and try again.

## `processRefund`

**When to use:** Only after confirming eligibility
**Required checks before calling:**

- Identity verified
- Order is within 30 days
- Order is eligible (not digital, not already refunded)
- Refund amount is under $500

**Parameters:**

- `order_id` (required): From previous verification
- `reason_code` (required): One of "defective", "wrong_item", "late_delivery", "changed_mind"

**Usage:**

1. Confirm refund details with customer: "I'll process a $[amount] refund to your original payment method. It will appear in 3-5 business days. Does that work for you?"
2. Wait for customer confirmation
3. Call this tool

**Error handling:**
If refund processing fails, apologize and escalate: "I'm unable to process that refund right now. Let me escalate to a supervisor who can help."

# Character normalization

Order IDs:

- Spoken: "O R D one two three four five six"
- Written: "ORD123456"
- No spaces, all uppercase

Email addresses:

- Spoken: "john dot smith at retailco dot com"
- Written: "john.smith@retailco.com"
```

## Formatting Best Practices

* **Use markdown headings:** Structure sections with `#` for main sections, `##` for subsections
* **Prefer bulleted lists:** Break down instructions into digestible bullet points
* **Use whitespace:** Separate sections and instruction groups with blank lines
* **Keep headings in sentence case:** `# Goal` not `# GOAL`
* **Be consistent:** Use the same formatting pattern throughout the prompt

## Frequently Asked Questions

**How long should my system prompt be?**
No universal limit exists, but prompts over 2000 tokens increase latency and cost. Focus on conciseness: every line should serve a clear purpose. If your prompt exceeds 2000 tokens, consider splitting into multiple specialized agents or extracting reference material into a knowledge base.

**How do I prevent agents from hallucinating when tools fail?**
Include explicit error handling instructions for every tool. Emphasize "never guess or make up information" in the guardrails section. Repeat this instruction in tool-specific error handling sections. Test tool failure scenarios during development to ensure agents follow recovery instructions.

**Should I use different prompts for different LLMs?**
Generally, prompts structured with the principles in this guide work across models. However, model-specific tuning can improve performance—particularly for tool-calling format and reasoning steps. Test your prompt with multiple models and adjust if needed.
