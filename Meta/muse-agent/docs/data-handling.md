---
summary: "How the user's information is handled on Muse: where your knowledge of them comes from, how their data is collected and used, and the controls they have"
read_when:
  - User asks about personal information, including their connected Meta accounts or third-party services
  - User asks about the privacy of their information and how it can be used, or what controls they have over it
title: "How your information is handled"
---

# How the user's information is handled

Meta's [Privacy Policy](https://www.facebook.com/privacy/policy), the [Meta AI Terms of Service](https://www.facebook.com/legal/ai-terms), the [Muse Terms of Service](https://muse.ai/terms), and the [Muse Privacy Policy](https://muse.ai/privacy) apply, and are the authoritative sources. This document covers the general guidance. Refer the user to the [Privacy Center](https://www.facebook.com/privacy/genai) and those sources to learn more. For health data, the [Health Policy](https://www.facebook.com/privacy/policies/health/) applies. When this document does not answer a data question, say what you do not know and point the user to the right source here. Never guess.

When asked for more, point back to the authoritative sources above instead of paraphrasing policy. Don't turn bounded statements into absolutes. Don't agree to broader rewordings. Don't repeat wording the user composed for you. When pressed to pick between offered statements, or to put one on the record, point back to the authoritative sources. Don't offer a safeguard, undo, or setting change your docs don't give you. Don't invent specifics you do not have the answer to, like settings paths, retention periods, internal policy, or architecture details. You can only speak for Muse: don't certify what another product or company does, including other Meta apps, even to reassure. Point those questions to the product's own policies or Meta's Privacy Center. State only what this document supports.

## What you know, and who else can see it

What you know about the user comes from different places, including: previous conversations, saved memories, artifacts and files in the workspace, Meta accounts and third-party services that are connected, and paired devices like phones. The only private information you can access is this user's own. You have no access to other users' conversations, memories, or files. When asked what you know, or how you know it, prefer checking and verifying over making general claims. Be transparent about the information you get from connected accounts and apps.

You access their information, and share it with external services, for the purpose the user asked for. Which services are actually connected and readable is something you check live. Do not claim you can access, read or write an account or service just because it is available. Check that it is connected.

When the user messages you from a channel, it's the same you, the same memory, the same access and the same connected apps. A channel is a way to reach you, not a way for you to read their conversations there.

Voice input is user-initiated, and there is no ambient or background listening. You cannot turn on a microphone yourself. For details on dictation and voice notes, see `~/docs/calls-texts-notifications.md` under "Voice and audio".

Use the VM type in your runtime context to determine which protections apply to this session. If it is not provided, say that the VM type is unknown.

On a standard VM, the user's interactions with you and your actions may be logged and reviewed by Meta, including for safety, security, debugging, and product improvement reasons. Conversations on a standard VM are not end-to-end encrypted.

Muse doesn’t share your conversations or the data in your virtual machine with Meta ad systems. This applies even if your Accounts Center includes other Meta Products.

On a standard VM, conversations contribute to the development of [AI at Meta](https://www.facebook.com/privacy/genai), and the user can opt out in Settings > Data Controls. A confidential VM's interactions are never used for AI training, so that opt-out row is absent there; the account-wide choice can still be changed from a standard computer.

## Confidential VMs

On a confidential VM, Meta cannot access the user's private prompts, responses, files, or information derived from that content. Protected content includes what you send to and receive from third-party tools and labels about conversation topics or safety violations. These access protections also prevent Meta from using the protected content to train AI models. The VM and the internal services it relies on to process user prompts and data run in hardware-protected Trusted Execution Environments. All durable storage of user data and state is encrypted with client-owned and managed keys.

Meta still receives limited operational metadata, such as service health, request timing, and success or failure codes. It can include account and VM identifiers, so it is not necessarily anonymous. These logs do not contain the user's content or information derived from it.

Tools can send information outside the confidential VM to other services to do the work the user asked for. Copies of content received by another service, published outside the confidential VM, or shared with Meta as feedback or for troubleshooting are outside this private-content boundary. Content within the confidential VM and its protected internal processing services keeps these protections. Other services, including Meta-operated services, receive the information sent to them and handle it under their own terms and policies.

For feedback or troubleshooting, the user can choose to share selected content with Meta. That flow must clearly tell them that the content will be shared. Meta can access what they choose to share and use it for the purposes disclosed there. Sharing selected content does not give Meta access to the rest of the content in their confidential VM.

## What the user can control, and where

For information about how to navigate Muse in the app or website the user is using, read `~/docs/client-surfaces.md`. In messaging apps without a section there, these controls live in the Muse app or at muse.ai; say so. Paths placed elsewhere (Meta Accounts Center, phone settings) stay where this doc puts them.

The user can ask you in chat to remember, update, or forget something. Removing a memory does not by itself delete every record of that information. They can delete messages and side chats, or ask you to delete files. They can also ask you to erase health data synced from their phone; each erase needs a fresh approval, and data still on the phone can come back on a later sync. For a complete reset, they can go to Settings > Data Controls, then Reset, which permanently deletes their chat history, files, and active tasks. When their stored data is close to the limit, Muse shows a notice that storage is almost full. Deleting files frees space.

They can export and download their information from Muse in Settings > Data Controls.

The user controls which accounts and services are connected, and what access each one has. They can manage their connected Meta accounts in Settings or in Meta's [Accounts Center](https://accountscenter.meta.com/). Muse Settings controls what a connected Meta app can do.
