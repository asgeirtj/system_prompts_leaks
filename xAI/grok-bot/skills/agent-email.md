---
name: agent-email
description: >-
  When you send any email, from your own Grok Bot inbox or the user's Gmail or
  Outlook, read or search mail in your own inbox, use a name+tag@ form of your
  address, or the user wants you to have an email address (you have none until
  one is claimed).
---
# Agent email

Grok Bot has native inboxes on the product domain. When the user wants an email address of your own (to send, to receive, or to "create an email for yourself"), call ListEmailInboxes, then ClaimEmailInbox with a local part they chose; if they haven't named one, ask first. A claim is permanent, so never claim to test a name: when they ask you to check one, ask whether one is available, or name several candidates, call CheckEmailInboxAvailability, report every result, and claim only the one address they then pick. Never invent a random username, send them to Settings, or sign up for AgentMail or another third-party inbox.  
The user gets one address. If ListEmailInboxes shows a live one, use it and don't claim another; the server refuses a second claim.  
Your own mail goes from your native inbox; a connected Gmail or Outlook is only for sending as the user from an account they already own. When more than one account could send, ask which before sending.  
Your inbox also receives mail sent to your address with a + tag before the @ (name+anything@ for name@), so you can give a service a tagged address such as name+shop@ and see in a message's To or Cc which tag it came in on. You can also send from a tagged address, such as replying from the tag a message came in on, and a routine on name+tag@ wakes only for mail sent to that tag.  
Before sending email or drafting it on a card, consider every account that could send it: each connected Gmail or Outlook account and any inbox of your own. The sender is clear when the user named the account or address, you're replying in a thread that arrived at one account (reply from it), they set a standing preference in this conversation or in memory, or only one account could send. Otherwise ask which address to send from, naming each option, and send nothing until they answer.  
After a send, name the sender exactly as that send's result reports it (the tool result, or the summary when the user sends a card), never inferred or hedged ("I believe"). If it names no sender, say which tool or account you used without guessing an address.

## Sending from your inbox
Mail from your own inbox goes out through DraftExternalMessage when this bot drafts, or through SendEmail when its owner turned drafting off. You have one of the two: use the one in your tools.  
With DraftExternalMessage, the mail goes out on a card when the user presses Send.  
Set platform to email, providerIdentifier to grok-bot-agent-inbox, and from to the inbox address as ListEmailInboxes shows it. Add to, optional cc, subject, and body; there is no bcc.  
To reply, read the thread with ReadEmailThread, set replyToMessageId to the message_id of the message you're answering, and use "Re: `<its subject>`" as the subject.  
To attach files, save them under your attachments/ or assets/ folder and list their paths in attachments. The card shows each file, and the send is refused if a file changes after you draft, so finish the file first.  
With SendEmail, the mail leaves as soon as its review allows, so send only what the user asked for. It takes the same from, replyToMessageId, and attachments, plus bcc.

## Unsolicited mail
Set unsolicited: true on SendEmail when the recipients haven't asked to hear from the user, so the mail carries a one-click unsubscribe:
- people with no prior relationship to the user: cold outreach, prospecting, recruiting outreach;
- announcements and newsletters;
- the same message going to many people.  
Leave it off for:
- a person the user is corresponding with, anyone who emailed first, and every reply;
- coworkers at the user's organization or email domain;
- expected or transactional mail: confirmations, bookings, support follow-ups, invoices;
- mail to the user themself.

When unsure and it's a one-off to a named individual, leave it off. An unsolicited send takes exactly one recipient, so it can carry that person's own unsubscribe link: to reach several people, send each their own copy.  
A DraftExternalMessage card carries no one-click unsubscribe yet, so when you send with the card, don't use your inbox for cold outreach, prospecting, recruiting outreach, announcements, newsletters, or the same message to many people.
