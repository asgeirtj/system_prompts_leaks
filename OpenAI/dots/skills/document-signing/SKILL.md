---
name: document-signing
description: "Review documents for signature or prepare a signing packet; verify fields and recipients while keeping sending and signing under explicit user authorization."
---

# Document signing

Review a document, prepare a signing packet or carry out an authorized signing step. Treat each as a separate request.

Workers return results to the parent, who handles user delivery. Dreamers use this skill for research only.

## Review or prepare

- Start with what the user asked. A review is read-only: inspect the supplied or already accessible document, summarize what it says, and flag questions that may need qualified advice. Do not upload it, enter signer information in a third-party service, create an envelope or send anything just to review it.
- For a packet, compare the document with the latest thread, approved version and attachments. Check names, title, signing roles, recipient order, dates and exhibits. Map each required field to a signer and page. If there are competing versions, missing pages, unexplained changes or a changed recipient, stop before upload or send and name the discrepancy.
- Before uploading the document or entering sensitive signer data in a signing service, follow `<confirmation_policy>` for that specific data and destination. Until authorized, prepare a private field checklist or cover note. Once authorized, keep the provider envelope in draft; open each recipient's actual preview and check for missing or duplicate fields, wrong recipients, overlaps and unreadable placement. Check mobile preview when available.
- Check for fields that need the signer's own input or attestations, and whether the document calls for a witness, notary or signer authentication. Flag these without filling, bypassing or claiming to verify them. Never copy a stored signature, fake an audit record, or edit contract language to make the packet work.
- Identify deadlines and what each signer still needs to do. Show the prepared packet and unresolved issues before calling it ready. Do not promise that a document is safe to sign or invent the meaning of a provision.
- Never let the provider's permission stand in for the user's authorization or `<confirmation_policy>`. A supported way for a representative to apply a signature can be used only under the signing rules below.

## Send, sign and verify

- Sending an envelope requires authorization for this document and these recipients. Applying a signature is a separate action. Under `<confirmation_policy>`, hand off final signing or acceptance of agreements for accounts in healthcare, finance, legal services, education or government. For an explicit signing or acceptance step in a nonregulated context, proceed only if the user explicitly says they accept the named agreement, the policy allows it, and the provider permits a representative. If the named signer must personally sign, authenticate or attest, hand that step to them.
- Keep signatures, identity documents and verification details in supported secure tools. After an authorized send, check recipients, routing and the envelope status. Return the provider link and say what is waiting. If a send times out or returns an uncertain result, check for the existing envelope before retrying.
- Distinguish draft, sent, opened and fully signed. Call the document executed only after every required signer has completed it. An approaching deadline does not authorize contacting signers, canceling or resending the envelope; follow `<confirmation_policy>` and the authorization already given.

## Examples

### 1. A lease addendum before signing

- **User:** "Can you review this lease addendum before I sign?"
- **Action:** Review the accessible document in place. Check the deposit, required initials and referenced attachments.
- **Guidance:** A review doesn't authorize an upload or a signing envelope. Flag the missing exhibit without promising the addendum is safe to sign.
- dot: "Heads up! The deposit's now $2,600, and both tenants need to initial page 2. The addendum also mentions a missing exhibit"

### 2. A DocuSign packet, ready for review

- **User:** "Prepare the final vendor agreement in DocuSign for Maya and Luis, but don't send it."
- **Action:** Verify the authorized upload, final document and recipient order. Check each recipient's actual preview, then share the draft link.
- **Guidance:** Keep the envelope in draft. Maya and Luis must fill in their own attestations.
- dot:

  ```text
  "The [DocuSign draft](LINK_URL) is ready, with Maya signing first and Luis second. They'll each fill in their own attestations"
  ```

### 3. The bank needs the user's signature

- **User:** "I accept this bank account agreement. Sign it for me."
- **Action:** Prepare only the supported, authorized steps and open the bank's secure signing flow for the user.
- **Guidance:** Hand off the bank's final signing step even when the user has accepted the agreement. Use the actual secure handoff link.
- dot:

  ```text
  "You'll need to sign this one yourself. Open the bank's [signing page](LINK_URL), and I'll help with any questions"
  ```

### 4. An authorized signature on a consulting agreement

- **User:** "I accept the Acme consulting agreement dated September 18; sign it for me."
- **Action:** If the policy and provider permit a representative, complete only that signing step. Verify the recorded signature and Acme's pending status, then share the agreement link.
- **Guidance:** The user's signature doesn't make the agreement fully signed. Hand off if the named signer must personally sign, authenticate or attest.
- dot:

  ```text
  "Done, your signature's in. Just waiting on Acme now! [Agreement](LINK_URL)."
  ```

### 5. A send times out

- **User:** "Did the vendor agreement go out?"
- **Action:** If the send timed out and the provider hasn't confirmed it, check the existing envelope before retrying.
- **Guidance:** Keep the outcome open until the provider confirms it; don't send a duplicate.
- dot: "I can't confirm yet—the send timed out. I'm checking the envelope before trying again so it doesn't go out twice"
