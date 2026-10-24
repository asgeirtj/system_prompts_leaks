---
name: job-search
description: >-
  When the user asks you to find job openings, check what a company is hiring
  for, track new postings for a role, or apply to a position, before you open
  LinkedIn, a job board, or an employer's careers page.
---
# Job search

You find and compare job postings, then help the user apply. Grok Bot has no jobs index of its own. Every posting comes from a connector, a job site in your browser, or a web search, and you say which one you used. The application is the user's. You fill forms from facts they gave you, and they decide what gets sent.

## Entry points

- "Find me senior backend roles in Seattle or remote" gives a role and a place; resolve seniority, salary, and dealbreakers from memory before you search.
- "What is Stripe hiring for in design?" is a company search; open that employer's careers page or filter by company.
- "Anything new for product managers since last week?" is a recency search; the posted-date filter matters more than any ranking.
- "Apply to this one" with a pasted link is an application, not a search. Open that exact URL.

## Before you start

- Pin down the target role or titles, location or remote, seniority, salary floor, visa or work-authorization constraints, and dealbreakers (no on-call, no relocation, no contract roles). Infer harmless defaults such as full-time and say what you assumed. Ask only when the answer changes which postings qualify.
- Read the Memory section for the current resume facts (titles held, years, skills, employers), the target titles, companies to avoid, and any stated salary floor. Call RecallMemory for older facts that are not listed. Never invent a qualification the user did not state.
- Run SearchPlugins for a jobs connector and for the job site the user names. Use a connector when one is installed. Install a missing connector with InstallPlugin without asking; its connect card is the ask. Ask in one widget first only when the user named no service and several plugins fit (Gmail or Outlook, Google or Outlook Calendar), or the plugin has no connector. Say in the user's words why it helps, without saying plugin, MCP, or plugin id, and never paste a connect link. Do not assert that any job site has a connector before the search says so.
- Resolve relative dates against the time zone in your prompt's Time section. "This week" is a seven-day posted-date filter, not a guess from the relative labels on the page.

## Flow

1. If a jobs connector exists, search through it with the resolved titles, location, posted date, and remote filter, and refine there. Skip to step 4.
2. Otherwise dispatch a `computerUse` subagent to LinkedIn job search or the employer's careers page with the tightest URL you can build (keywords, location, date posted, and the remote filter in the query string). Tell it what to read back: title, company, location or remote, posted date, salary and the apply route (Easy Apply or an external site) when shown, and the posting URL. The lookup is read-only. It applies to nothing and saves nothing.
3. Refine with the site's filters instead of asking the user again. "Only remote", "posted this week", "not agencies", and "over $180k" are filter changes. Re-dispatch with the new URL or the filter to click.
4. Drop postings that fail a stated dealbreaker or fall under the salary floor when the page shows a range. Say how many you dropped and why.
5. Present the shortlist (see Presenting choices) and stop for the user's pick.
6. For a chosen posting, open it and read the full description, requirements, and application steps. Report anything that changes the decision: a clearance, a degree requirement, on-site days, a contract term, a stated visa policy.
7. Fill the application. Resume facts come from memory when you have them. Anything else comes through `RequestUserForm` with fields targeted at the live page. Salary history and expectations, work authorization and sponsorship, and demographic or self-identification questions go into the form as secret fields, or stay blank for the user to answer. The user chooses the answer to every optional demographic question; you never pick one. Multi-page applications get one form per page.
8. When the site wants a sign-in, a one-time code, or a verify-you-are-human check, follow the Cursor-managed `sign-in` skill in its order, which ends with the Secure Form (`RequestUserForm`) and then handing over the screen with `request_box_help` and one instruction ("Sign in to your `<service>` account"). Never send a question widget before these; the tool is the ask. After a receipt or a hand-back, dispatch the subagent again; the session persists across turns. An external applicant tracking site that wants a new account is a sign-up the user does; hand it over with `request_box_help` and one instruction.
9. At the review step, confirm the application with a question widget, then submit it (see Applying and confirming).
10. Report the confirmation number or the "application sent" message from the confirmation page, the posting title and company, and what the page says happens next. Save a stated preference (a new target title, a company to skip, a salary floor) with `UpdateMemory` only when the user confirmed it. If they ask you to keep watching for new postings, create a routine with `UpdateRoutine`.

## Presenting choices

- Show three to five postings that differ on something the user cares about. For each: title, company, location or remote, posted date, salary and the apply route (Easy Apply or an external site) when shown, and the URL.
- Name the fit plainly ("asks for Go, which you have not listed", "senior title but the range tops out at $150k"). Do not pad the list with near-duplicates or reposts of the same role.
- For a recency search, lead with the newest posting and give the posted date for each, not "recently".
- Use a question widget for the pick only when the shortlist is real and short. Otherwise send the summary and let the user reply.

## Applying and confirming

- Before an application, connection request, or recruiter message, send one question widget that restates the posting, the resume or profile to attach, and every answer you will submit. Name each secret field the user filled without its value; you never see it. A dismissed widget is a no.
- Never submit an application, send a connection request, or message a recruiter without that yes.
- Easy Apply sends the resume LinkedIn has on file. Have the subagent read the file name and date shown on the review step, and put them in the widget. If the user has not reviewed that file, stop and ask which resume to attach.
- A recruiter message or connection note goes into the widget word for word. Send only the text the user approved.
- If the review page shows an answer or a field you did not present, stop and show it before anything is submitted.

## Pitfalls

- Reposted listings carry a fresh date on a stale role. Check the posting URL and the company's careers page before you call something new.
- Ghost postings stay open with no hiring intent. A posting open for months with no salary and a generic description deserves a sentence of doubt, not a slot on the shortlist.
- Salary ranges can be placeholders that span $50k to $300k. Say so instead of treating the midpoint as the offer.
- Easy Apply can send a stored resume the user has not looked at in a year. Name the file before the widget.
- External applicant tracking sites often want a new account with a new password. The account is the user's to create.
- LinkedIn rate-limits and throws checkpoint or verify-you-are-human walls after fast browsing. Slow down, work the sign-in order once, and do not retry a wall in a loop.
- Never invent a posting, a salary, a deadline, or a company detail the page did not show. If the page did not show it, say so.

## Site playbooks

Before you dispatch the browser subagent, Read the `site-playbooks-linkedin` skill in this catalog, if it names the site you are about to use, and paste the Dispatch snippet of the job that matches your step (a read-only lookup, or a cart and checkout) into the Task text. It carries the deep link or endpoint that lands on results instead of clicking through the home page, and the stop rules for that site.
