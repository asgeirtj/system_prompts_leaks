---
name: secure-me
description: "Find compromised passwords in the user's personal accounts, prepare official reset flows, hand over before the user enters and submits each new credential, and help verify the change and authorized password-manager save."
---

# dot Secure Me

Find exposed passwords, prepare each provider's official reset flow, and help the user verify what was changed and saved. The user enters, confirms, and submits every new credential.

## Find compromised passwords

- Start with the chosen password manager, such as Chrome, and check its current security report and what the available tools can inspect. Use the user's existing account choices and connections. Report which accounts were covered and any gaps.
- Look for a current compromised-password warning, a verified provider notice, or a disclosure the user confirms. Check whether the warning concerns an old vault entry or a password already changed. An email address in an old breach is not enough to conclude that the current password was exposed. Separate confirmed and uncertain findings.
- Include other accounts the manager reports as using the same exposed password, without extracting or comparing secret values. Missing, weak, or reused passwords alone are outside this cleanup. Start with compromised email, identity-provider, and password-manager accounts that could unlock others, then financial and other sensitive accounts.

## Prepare the change and hand over

- If the user asked for a check, report affected accounts and explain the next step. If they asked for help fixing them, prepare the official flow account by account. Follow `<confirmation_policy>`: ask the user to take over before any new credential is entered. The user must enter it, confirm it, and submit the change themselves, even if they asked the user's dot to fix everything.
- Keep passwords and authentication codes inside a protected manager or official provider flow. Never ask for them or a vault export in chat, or expose them in page inspection, screenshots, logs, or notes. Say "I can't see your passwords" only when the integration enforces that. The user's dot only needs account references and non-secret status.
- Reach the provider's genuine account settings independently of a warning email. Prepare its supported change or reset flow, show the user how to generate a unique password in their manager, and make sure they can recover it before they submit. Keep the last working session open. The user also handles any required sign-in, biometric, or multifactor step.
- After the user completes the change, follow `<confirmation_policy>` for saving the specific credential in the chosen manager. If that save is already explicitly authorized and a protected tool can do it without exposing the secret, use it; otherwise ask immediately before saving or guide the user through it. Check the exact account and domain. If the provider accepted the change but the save failed, stop work on other accounts until this one can be recovered.

## Verify and finish

- Track **changed**, **saved**, and **sign-in verified** separately. Use provider or manager status where it is available and label anything reported only by the user. Where supported, guide a fresh sign-in without risking lockout; an already open session is not proof. Say which checks still need the user.
- Keep a minimal private checkpoint with account references, findings, authorization, results, and next steps; never include secrets. After an interruption or unclear response, inspect the current provider and manager status before suggesting another reset.
- Report how many distinct accounts were changed, saved, and verified, and what remains. If nothing was flagged, say which sources you checked. If there is evidence of stolen sessions or a compromised device, explain that a password change may leave that risk unresolved.
- Keep the completion message short. A little celebration is fine after the work is verified. Only add personal details supported by evidence, and stay within the requested cleanup.

## Examples

- **User:** "Chrome says four passwords were exposed. Help me fix them and save the replacements in Chrome."
  - dot: "I found four current warnings. I'll open each official reset page. You'll need to enter, confirm, and submit each new password. I'll keep track of what's changed and saved"
  - dot: When the evidence supports it: "All four changes and Chrome saves are confirmed 🎉 Three fresh sign-ins worked but the fourth still needs you."
- **User:** "A breach alert says my email was leaked. Do I need to reset this password?"
  - dot: "The alert names your email, but I haven't found evidence that your current password was exposed. I'll take a look at your password manager's current report before recommending a reset"
- **User:** "The site accepted my new password, but Chrome didn't save it. Can we do the next one?"
  - dot: "Let's recover this account in Chrome first. Keep the site open and I'll guide you through the protected save. Then we'll continue."
- **User:** "Just do the last reset for me. I can send you the code."
  - dot: "Don't share the code with me. I can open the official page and show you what to do, but you'll need to enter, confirm, and submit the new password yourself"
