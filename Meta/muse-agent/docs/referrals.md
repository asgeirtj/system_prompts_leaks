# Referrals and invite codes

Muse invitations can include a share link and an invite code. Sharing an
invitation, joining Muse, and redeeming a code are separate steps. Opening a
link is not confirmation that a code was redeemed or a reward was credited.
An invitation does not give anyone access to the sender's chats or agent.

## Sharing an invitation

The mobile Invite button is at the top right of the chat header (a gift icon
on iOS) and opens the invite share sheet. The sender can share the invitation
provided there. An invitation supplied in chat carries the sender's exact
code; use the Invite button's share sheet for the link.

A generic Muse homepage or a guessed join URL is not a replacement for the
sender's supplied invite link. A code can be entered in the redemption form;
it is not necessary to turn a bare code into a URL to redeem it.

## Redeeming a code

On iPhone and Android, open the Muse app and go to **Settings > Redeem
token**. Enter the friend's invite code there. This option is available for
the first 48 hours after the user joins Muse. A confidential VM has no
redemption entry on any platform; see the note below.

On the Muse website at muse.ai, the entry is **Settings > General > Usage >
Redeem invite code** for accounts with redemption available. The recipient
enters the friend's code in that form and confirms. The entry disappears
after the account has confirmed redemption, including on another device.
Invitation sharing and code redemption have separate availability; seeing
an Invite button does not establish whether that account can redeem a code.

Settings in these directions belongs to Muse, not the phone's system
Settings or a messaging app such as WhatsApp.

## Offer terms and outcomes

The current invitation and redemption screen supply the applicable offer
terms, including reward amounts, remaining invitations, and other
eligibility conditions. A remembered offer for one account does not
establish another account's terms. A reward amount missing from the
invitation is unknown, not a promise of a particular number of tokens.

The redemption result establishes whether the code was accepted. A pending
result is not confirmed redemption or credited usage. The web form can report
an invalid, used-up, or revoked code, an already-redeemed account, an expired
redemption window, too many attempts, or a temporary failure. The displayed
result is the basis for explaining a refusal; a code's appearance alone does
not establish validity. Current subscription and usage questions use the
`subscription_status` skill; this document does not expose account balances
or provide a way for the agent to validate or redeem a code.

## Missing options or failed lookups

An unavailable page does not establish that a code is invalid, that redemption
requires a link, or that no code-entry field exists. On mobile, Redeem token
is only available during the first 48 hours after joining. On a confidential
VM the redemption entry is absent by design, on every platform; that missing
row is the expected state, not an account or rollout problem. A missing Settings
row alone does not establish the account's age or prove a rollout delay.
The user's platform, visible screen, and any displayed error help narrow down
what happened. Where those facts do not establish the answer, the cause is
unknown. Muse's Help & Support options are in `~/docs/client-surfaces.md`.
