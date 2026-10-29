# Writing quality

## Contents

- [Editorial review for documents](#editorial-review-for-documents)
- [Professional writing failure modes](#professional-writing-failure-modes-supplied-text)
- [Documents for human readers and author voice](#documents-for-human-readers-and-author-voice-image-transcription)

## Editorial review for documents

Review the writing before final formatting, and repeat the relevant checks after substantial revisions. Use the examples below to identify the problem and rewrite the actual document. Apply a suggested rewrite only when the source and section support its meaning. Do not borrow dates, roles, results, or other facts from an example.

### Read headings as an outline

Read the document title and section headings together without the body text. They should identify the subject, scope, and organization of the document. Check that each heading describes what its section actually contains. Reconsider a vague heading's framing before polishing individual words, and keep a good existing heading when it already does the job.

| Wording to improve | Clearer wording when supported by the section |
| --- | --- |
| Performance that frames the choice | 2025 and 2026 Performance Metrics |
| From oversight to trusted execution | AI Policy Approval Process |
| Reported outcomes with limits | Pilot Results and Study Limitations |

Use a plain subject label for background, definitions, or process descriptions. Use a factual finding as a heading only when the section establishes that finding. Follow the title and heading rules in `SKILL.md`, including the requirement for no punctuation.

### Use paragraphs to explain relationships

Give each paragraph a clear point and explain how its facts or actions relate. The document should make sense without a presenter supplying missing connections. Use complete sentences and vary their length naturally. When a sentence bundles actions, explain their sequence or dependency when the source supports it.

For example, the fragments "Policy approval required. Legal approves the policy. Publication follows approval." become "Legal must approve the policy before publication." The rewrite preserves the actor and approval condition while making their relationship clear.

Use lists for distinct items readers need to identify, follow, or compare. Keep a useful list of three items when all three matter. Avoid adding filler to complete a trio or repeatedly using the same three-part rhythm. Do not invent an owner, sequence, or causal link to make vague source material sound more concrete.

### Unpack compressed labels and unnecessary compounds

Replace dense modifiers and abstract labels with natural phrases that state the intended meaning. Rewrite the phrase rather than simply deleting its hyphens.

| Compressed wording | Clearer wording |
| --- | --- |
| Approval-ready evidence pack | Evidence required for approval |
| Decision-enabling insights | Findings relevant to the decision |

Use the first rewrite for a section listing approval requirements. If the original phrase describes a completed packet, preserve that status with "Evidence ready for approval." A clearer label must still express the intended meaning.

Preserve official names, defined terms, and established technical vocabulary when precision requires them. Explain an unfamiliar term on first use when the audience needs it, then use it consistently. Keep ordinary grammatical hyphens when they clarify meaning.

### Preserve the claim when simplifying

Check the rewrite against the source. Keep numbers attached to their units, comparison baseline, and time period. Preserve conditions and uncertainty, including the distinction between "may," "should," and "must." Keep recommendations separate from findings and associations separate from causal claims.

| Source wording | Edit to avoid | Safer wording or action |
| --- | --- | --- |
| Costs may fall if volume increases | Higher volume lowers costs | Costs may fall with higher volume |
| Transit use recovered to 79 percent of its previous level | Transit use increased by 79 percent | Transit use reached 79 percent of its previous level |
| A structurally lower level of commuting | A permanent drop in commuting | Retain the structural claim or explain the underlying change using the source; do not infer permanence |

When the original is ambiguous, consult the source or retain the uncertainty. Do not silently choose a stronger interpretation, add a result, or remove a qualification to make the prose sound decisive.

### Use punctuation and voice in context

Prefer active voice when the actor is known and relevant. Use passive voice when the action or result deserves emphasis or the source does not identify the actor. Do not invent an actor solely to eliminate a passive construction.

Use punctuation in body text to make relationships and qualifications clear. Revise repeated punctuation used to manufacture emphasis or rhythm. Apply these checks in context rather than banning every instance of a construction. The separate rule against punctuation in document titles and headings still applies.

## Professional writing failure modes (supplied text)

Professional Writing Failure Modes 

We have classified common AI-slop style failure modes into a few key buckets. Please treat all of these as contextual signals, not forbidden tokens. Penalize a pattern when it is conspicuous, repeated, unearned, or harmful to the requested writing; do not reject an otherwise strong response because of ONE isolated phrase or punctuation mark.  
Flag when: The underlying claim is understandable, but it is packaged as a stock formula, slogan, staged cadence, canned emotional phrase, or strained metaphor, instead of clear analysis. This includes repeated colons, semicolons, or em dashes used to manufacture rhythm or emphasis rather than clarify meaning.  
Examples of bad writing:
- Inflated contrast: "This isn't just a calendar - it's a gateway to a more intentional life." or "Data access is not a background detail. It's the heart of the user experience."
- Overuse of odd words that don't make sense: "Proceed only when five readiness gates are green" to refer to criteria for a diligence deck
- Overusing parallelism/semicolons: "The old request drew a boundary around hotspots; the new request removes that map layer" or "Early restrictions were zone-based; the late-December version removes the map as the control surface". This is bad bc also very unclear what the control surface means in this case.
- Unnecessary usage of em-dashes: "Purpose: isolate what changed – and what deliberately stayed in place – under Osaka Prefecture's Red Stage emergency response." Don't use repeated punchy contrast or interruption built from em dashes if plain sentences would read better.
- Stock formula: "The tool not only saves time, but also transforms how teams collaborate" or "faster, smarter, and more intuitive."
- Slogan-like transition or fragment: "From paper-bound practicals to a shared digital workspace" or "One team. One vision. Limitless possibilities." or "Win the close. Keep the evidence." or "Pipeline is flat. Spend isn't." or "EBITDA is not cash. Bridge it" or ""this is not just another X. The better framing is Y" or "It's not X it's Y".
- Overusing colons: "Universities: reinforce guidance. Students: reduce social activity. Everyone: keep the year end quieter."
- Staged cadence or punctuation: "Different sectors, same behavioral logic: reduce optional contact where consequences are highest."
- Canned empathy: "I completely understand how frustrating and overwhelming this situation must feel."
- Synthetic balance without a real tradeoff: "While remote work offers flexibility, it also presents unique challenges."
- Mannered parallelism or punctuation: "The problem is clear: priorities are shifting; timelines are slipping; confidence is fading — and the moment for action is now."
- Inflated significance: turning mundane facts into claims about legacy, identity, broader trends, pivotal moments, or an "evolving landscape."
- Promotional or travel-guide tone: unrequested salesy praise, destination-copy atmosphere, or reflexive adjectives such as "vibrant," "rich," "renowned," "groundbreaking," or "nestled."
- Vague authorities and synthetic consensus: unsupported appeals such as "experts argue," "observers note," "scholars say," or "several sources suggest."
- Canned endings: generic "challenges," "legacy," or "future outlook" conclusions that do not arise naturally from the content.
- Repeated rhetorical triads: habitual sets of three adjectives, abstract nouns, clauses, or examples that make the prose feel manufactured.
- Overlong parallel enumerations: a common GPT tic is to pile up rhythmic catalogues of who/what/where clauses, examples, or abstract nouns to simulate exhaustiveness or momentum after the point is clear. Penalize conspicuous accumulations unless the task genuinely needs the list.
- Repeated negative parallelism: "not X, but Y," "not only X, but also Y," "not just X, but Y," or "no X, no Y, just Z."
- Dense clusters of AI-associated vocabulary: for example "delve," "pivotal," "robust," "tapestry," "underscore," "showcase," "foster," "intricate," "landscape," "testament," and "vibrant."
- Mechanical bold-label bullet lists: repeated bullets of the form "**Label:** explanation" when that structure is not useful or requested.  
Do not flag: A construction that states concrete distinctions, gives a clear warning, or quotes an identified source. Example: "The bug is in the parser, not the tokenizer"  
Do not flag parallel structure or punctuation that clearly separates a real list, contrast, or logical relationship. Example: "The red light means stop, and the green light means go."  
Flag when: The reader cannot tell what changed, why the benefit follows, what evidence supports the claim, or what reason drove the decision. The specific rationale cannot be recovered because evidence, causality, actors, or observable meaning are missing.  
Examples of bad writing:
- Empty abstraction: "This unlocks value, fosters alignment, and drives meaningful impact." or "Labor costs push it; few have it; so it grows faster." or "Breadth plus intelligence, not the original module, is where growth now comes from"
- Unclear meaning: ""Everyday computer work gets the same agentic loop" <-- what does this mean, what is this agentic loop?
- Tacked-on benefit: "The interface centralizes key information, ensuring a seamless user experience."
- Inflated significance or unnamed authority: "This represents a profound shift" or "Research consistently shows that this approach improves outcomes." without sources to exclude it 
- Informal language: "Data Center is doing the heavy lifting" is incoherent vs "Most revenue growth comes from data centers", or "The next guide resets the bar higher" should probably be "Q2 projected revenue is $91B"
- Process instead of reason: "After several rounds of cross-functional review, we aligned on the next phase."
- Sometimes models can oversimplify statements, turning something like "Where to draw the line on speed investments" into "Where to draw the line" which completely loses the meaning, or turning "When faster shipping drives growth rather than simply increasing costs" into "When faster shipping drives growth" which is oversimplifying things.  
Do not flag: Claims supported by a concrete result, source, constraint, or approval requirement. Examples: "The change removes one approval step," "The 12 June accessibility audit found 14 missing labels," and "Legal and Security must approve the exception before release."  
Revision move: Name the observable change, source, deciding constraint, or actual tradeoff.  
Flag when: The sentence can be shorter and clearer without losing necessary meaning or a real qualification. The rationale is clear but the wording is unnecessarily long, indirect, compressed, bureaucratic, jargon-heavy, or hedged.  
Examples of bad writing:
- Corporate or bureaucratic phrasing: "Stakeholders should be informed of the operational implications associated with this transition."
- Overcomplicated sentence structure: 
  - "The clean end state is therefore not "CCA replaces every product." It is: shared primitives provide durable identity and lifecycle; CCA provides portable agent execution; each surface becomes an orientation onto that shared graph." —> should be rewritten simply to, ""CCA provides a portable agent execution capability that every surface can reuse, alongside shared identity and lifecycle primitives."
  - "The most important improvement over the earlier proposals was not the third mode. It was the unified sidebar...they would no longer behave like separate apps with separate navigation." → should be rewritten simply to, ""The unified sidebar meant that modes would determine how new threads start, but with shared navigation."
- Compressed abstraction: "The practical event ceiling remains anchored to both a headcount cap and a percentage cap."
- Indirect comparison: "The update reads as a broader continuation of requests rather than a list of named restricted zones."
- Overly hedging: "It may potentially be worth considering whether the team could possibly delay the launch."
- Unnecessary verbosity: "At this point in time, it would be advisable for the team to begin the process of reviewing the draft."
- Unexplained jargon: "The workflow operationalizes a cross-functional enablement layer for downstream value realization". Similarly, instead of slop like "Restrained color vs. visual noise: a simple navy-and-gray palette feels calm and credible.", one should say something like "We moved to a more simple color palette (navy and gray, no loud colors)".
- "Prioritize promise-date clarity and reliability before network acceleration: customers rank on-time delivery above sheer speed." → this should be rephrased to "Prioritize dependable two-to-three day delivery and accurate promise dates.  
Do not flag: Accurate technical terms, legal conditions, or explained uncertainty. Examples: "The API returns 429 when the client exceeds the rate limit," "The estimate is preliminary because two regions have not reported," and "The vendor may terminate only after giving 30 days' written notice."  
Revision move: Use concrete subjects and verbs. Keep the shortest accurate wording and only the uncertainty markers that correspond to real unknowns.  
Flag when: Setup, repetition, or formatting delays the point or makes the document harder to scan.  
Examples of bad writing:
- Generic scene-setting: "In today's fast-paced digital landscape, effective communication is more important than ever."
- Restating the request: "When it comes to improving employee onboarding, there are several strategies to consider."
- Meta-announcement: "Below is a polished and comprehensive rewrite tailored to your needs."
- Redundant conclusion: "In conclusion, adopting these strategies can help organizations achieve their goals."
- Excessive structure: A two-sentence answer split across six headings and twelve bullets.

Do not flag: Framing that narrows scope, corrects the request, explains an omission, or helps readers navigate reference material. Examples: "This memo covers the two launch decisions due Friday" and "Each API endpoint uses Request, Response, and Errors headings for lookup."  
Revision move: Start with the answer or decision. Delete generic setup and repeated recaps. Use the lightest structure that helps the reader act or find information.




Other basic guidelines
- Produce direct, natural prose that Strunk and White would give an A+.
- Lead with the point.
- Prefer concrete nouns and strong verbs.
- Omit needless words, repeated conclusions, and redundant framing.
- Use direct sentences with natural variation in length.
- Remove throat-clearing, inflated claims, vague abstractions, generic headings, and ornamental transitions.
- Remove canned AI phrasing, especially constructions such as "not just X, but Y," "the better framing is," and unnecessary contrast pairs.
- Keep useful nuance. Do not turn careful writing into overconfident writing.
- Preserve deliberate warmth, humor, informality, and domain-specific terms.
- Do not invent facts, context, commitments, or evidence.
- Do not mention the editorial framework in the output unless the user asks.



Requirements for good writing

Score above 80 when:
- Most importantly: There is literally NO writing slop (where slop is defined as those buckets above!) and any expert professional would believe that this is human-written. If there is ANY writing slop at all, this should score below 60%. 
- The response answers the task directly and leads with the conclusion or decision.
- Each major claim names a concrete subject and states an observable result, comparison, or constraint.
- Claims are supported by evidence, e.g. a number, source, example, approval requirement, or stated basis.
- Facts, interpretation, recommendation, and uncertainty are distinguished; caveats are local and specific.
- Every heading and bullet adds new information, and the amount of structure fits the task.
- The reader can tell what the finding changes for a decision, owner, or next action.



## Documents for human readers and author voice (image transcription)

# DOCX: Read, Create, Edit, Redline, and Comment

Use this skill to create or edit DOCX files in the container. Review the rendered result.

## **Important: documents are for human readers**

Follow user instructions first. Preserve the style of an existing document or supplied reference.

1. Read the request and source files. Identify the author, the recipient, and what the document must help the recipient understand or do.
2. Decide what kind of document is needed: a letter, memo, report, proposal, procedure, form, or another requested format. Choose the structure for that use.
3. Read the supplied writing examples and inspect their layout. Follow the relevant tone, sentence patterns, headings, and use of prose, lists, and tables. Keep the task's facts; do not borrow facts from a style example.

### **Important: write in the author's voice**

– **Strongly prefer writing directly in the author's voice, using "I" or "we" when natural and appropriate to the document.** Unless the request specifies another role, write as the user or the person or team they represent, directly to the intended recipient.  
– Present the update, recommendation, or request yourself. Do not narrate what the author or their organization might say.  
– Match the tone, language, and sentence structure of natural human writing in similar documents and situations. Use supplied writing examples as the primary reference when available, and keep the voice appropriate to the author, audience, and purpose.  
– Keep the speaker's tone appropriate and consistent: an analyst writing to peers, managers, or investors should sound appropriate to that relationship.  
– Do not invent the author's experience, authority, or commitments.
