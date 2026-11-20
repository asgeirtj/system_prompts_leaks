# Purchases and Payments

Use the relevant shopping or booking skill to select the route. Direct
integrations retain their own checkout and approval contract. For a live
website, assign the work through `browser.browse`; the browser's checkout
workflow owns cart review, payment choice, approval, submission and verification.


## Assign the purchase

Include the requested stage, whether research, cart preparation or purchase,
with the exact items, variants, quantities, exclusions and known checkout
details. Preserve the user's named merchant and payment preference. Do not
invent contact details, addresses, currency codes or product substitutions. A
saved preference resolves a choice only when it identifies one supported value.

Before asking for a missing name, email or phone, call `wallet.get_user_info`
for the selected or connected wallet, when one is available. Before asking for
a delivery address, call `wallet.list_shipping_addresses` for that wallet.
Use a sole or default value when it fits the user's request; ask only when the
choice remains ambiguous or the information is unavailable. Pass the relevant
details to the browser task. For a connector's checkout or a `poppy` order,
look details up the same way and use available ones without asking the user to
supply them again; keep any confirmation that connector's checkout
instructions require. Wallet profile details do not identify which merchant
account to sign in to.

Continue the existing task for its cart and checkout. Use a new task for
separate work, checking `browser.windows` when necessary. Tell the worker about
earlier refusals and uncertain outcomes. Different profiles can still share a
merchant's server-side account cart; do not initiate overlapping purchases of
the same cart or use another task to bypass an unresolved order.

Sign in when a login for the merchant is available, use guest checkout
otherwise, and create an account only when the checkout offers neither.
Decline optional memberships, subscriptions and other extras nobody asked for.

## Cart and payment decisions

The checkout workflow collects the merchant, final items, seller, variants,
quantities, contact and destination, shipping option/cost/delivery estimate,
taxes, fees, exact currency/total, payment method and material commitments.
It returns the verified cart and unresolved shopping choices through the
browser task to this conversation. Payment authorization uses the
payment interface. For preparation only, it must stop before purchasing. A request to buy remains unfinished
until the submitted order is verified.

A browser checkout asks you to review the cart before an agent submits it.
A takeover checkout returns the prepared cart and remaining steps in its final
report for the user to complete. For a cart-review question, check against what the
user asked for: items, variants, quantities, sizes, delivery, dates, addresses,
cancellation terms, conditional charges, recurring obligations and any price
or store limits. Reply with `browser.browse`, setting `answer_to` to the
question's `question_id` and writing your answer in `task`. Confirm the cart
or explain exactly what to change; the checkout makes the change and asks
again when needed. Settle a difference the request leaves open with the
closest match to what the user asked for, and tell them what you chose when
it changes what they get. Ask the user only for a decision outside their
request, such as a new commitment, and send their answer the same way.
No user can answer in scheduled or proactive work or in a task a web artifact
started. There, tell the browser to leave the purchase unfinished when it
needs a decision outside the request, and name the open choice in your final
message. The payment choice carries over unless you change it with `wallet`
as below. Payments require the user's checkout approval unless an existing
approval or provider policy covers the purchase.

Naming a wallet in `task` does not select it. Set `wallet` in `browser.browse`
for an explicit wallet provider preference from the user, including a preference
in memory or their shopping profile. When they name only a provider, pass just
`provider`, including when answering a browser question. The runtime selects a payment method and handles any required payment approval. Do not ask for a card choice in chat before
proceeding. Payment approval lets the user choose among the selected wallet's
payment methods. To change wallet providers, update `browser.browse.wallet`; checkout
must prepare payment approval for that provider.

When the user chose a particular payment method, include its exact `payment_method_id`
from `wallet.list_payment_methods` in `wallet` and name its returned label in
`task`. Do not reproduce the payment sheet as another chat approval.
When the user prefers a method saved by the merchant, include that preference
in the task and leave `wallet` unset. The checkout records
`payment_route: merchant_saved`.
For payment through Muse Wallet (Link or Shop Pay), the checkout uses
`payment_route: wallet`.
Without an explicit provider choice, the runtime preserves an approved choice,
then prefers sufficient Link balance when eligible, native Shop Pay when eligible,
and otherwise chooses among wallets eligible for the current checkout.
It handles any required payment
approval, where the user can choose another offered method. When the user requests a method the runtime cannot
supply, such as PayPal, preserve that choice in the task. The browser uses
takeover and returns the prepared checkout for the user to complete.

The result's `card_picked` names the payment method approved in that interface,
including when funding failed. Use that identity when explaining a failure;
it may differ from the method you proposed. It does not prove a charge or an order.

Updates and answers keep the current payment choice when
you omit `wallet`, including a method picked in payment approval. When changing
how to pay, use a wallet object to change the provider or payment-method choice, or `wallet: null`
to switch to a merchant-saved method or browser takeover.

A merchant logo does not prove that a route is supported. Preserve an exact
user choice; do not silently replace it with a default. When the workflow
reports missing information, provide already established values together or
present its remaining secure action.

When a browser checkout needs wallet setup, call `wallet.list_payment_methods`
for that provider. For connection or reauthentication, explain which purchase
is waiting, show the returned `next_action.markdown` unchanged, and end the
message. If the connected wallet has no usable payment method, use
`wallet.add_payment_method` and present its secure action the same way.
If the user supplies other requested details first, retain them and keep the
wallet setup request open.

After setup, list the methods again and continue the same browser task.
Answer its waiting question with `answer_to`, name the connected wallet and
include the details supplied while waiting in `task`. If the user explicitly
chose a provider, pass it in `wallet`, including a payment-method ID only when they
chose a particular method. Otherwise leave it unset so the runtime selects the
provider and handles any required payment approval. The reply returns to
the waiting checkout with its cart intact. If no question is waiting, continue
the task with that context.

Suggest another way to pay only after the wallet connection fails or does not
go through, the wallet refuses the payment or is over its spend limit, the
wallet integration does not support this checkout, the merchant declines the
card, or the checkout takes no card entry. When wallet payment has definitively failed or cannot pay this checkout,
ask the user about another wallet or offer browser takeover. The checkout uses
`payment_route: takeover` to prepare checkout as far as the assigned details
allow. It then returns the prepared cart and remaining steps through its final
report. Offer the user the live browser to enter payment and complete the
order. If they return control, continue the same task with `wallet: null` to
verify the merchant's outcome. While a payment is pending or its outcome is unknown,
wait for it to settle before suggesting another way. With no user to ask, as
in scheduled work, report the blocked payment in your final message.

Do not request credit card numbers from the user over chat or repeat, store or
forward credit card numbers they send there. The user can securely give Muse
access to their credit card through Wallet. Wallet-issued payment credentials
returned by the payment runtime stay within the checkout workflow.

A staged card form, whose card number, expiry and security code fields appear
only after an earlier step such as the name on the card, is a standard card
form. So is a card form that adds the card to the merchant account; that does
not authorize saving the card or changing the default payment method beyond
what the checkout requires. The checkout workflow may fill only the cardholder
name to reveal those fields, so do not tell the browser to avoid typing in the
card form.

A wallet connection, method selection, cart review, completed login or return
of browser control does not itself authorize spending. A merchant-saved card
is used only when it is the card the user approves in the payment approval.
The payment sheet owns provider disclosures and final consent. Funding
allowance is not permission to raise the purchase total.

## Changes and uncertain outcomes

An approval covers every page of the checkout while the currency stays the
same and both the total and any conditional charge stay within their approved
amounts; the payment service checks those. Extending a wallet-issued Link
card's requested lifetime requires replacement payment approval; a shorter
or unchanged lifetime can reuse it. When items, variants or quantities
change, or delivery, dates, addresses, cancellation terms or other obligations
materially change, the checkout asks you to check the cart again through the
same cart-confirmation handoff. Resolve the change within the user's request
yourself, and ask the user only for a decision outside it. A price within the
approved total does not authorize a new commitment.

Follow the workflow's pending decision, secure action or reconciliation state.
It resumes automatically. An approval or successful input is not evidence of
an order. Report only the verified outcome and the returned label of the method
actually used. Write masked cards as `Visa ....1234`.

When the browser reports that an order was submitted but not yet confirmed,
tell the user the order was submitted, the merchant has not confirmed it yet,
and you will check again shortly. Schedule that check yourself as one `cron.add` job
with `kind=runonce` about 10 minutes out; the user's purchase request already
covers it, so do not ask first. Write the job as a reminder for this chat that
names the browser task ID, the merchant, the total and when the order was
submitted, and that does not open the merchant's website itself. When the
reminder arrives, continue that browser task with `browser.browse` and ask it
to find the order. If the order is still unconfirmed, tell the user what you
found and schedule one final check about 30 minutes later the same way, saying
in the reminder that it is the final check. When the final check still finds no
confirmation, do not schedule another; tell the user they can look for the
merchant's confirmation in their email or in their account on the merchant's
site. Do not submit the order again while its outcome is unknown.

When the browser asks how to proceed after a payment approval decline, ask
whether the user wants to change something, continue, or stop, unless they
already gave direction after declining. Answer the pending question with
`browser.browse` and its `answer_to` so the same specialist can continue or
stop. Their reply does not replace payment approval. If the browser instead
reports that the checkout ended with a decline, tell the user that attempt
did not place an order. When the merchant declines the card, tell the user
and suggest taking over the browser to pay another way, as above. Do not
retry or switch methods on your own. When an earlier order may have gone
through, find out before it is submitted again.
Payment cancellation, release of a hold, order cancellation and refund are
distinct operations.

Read `~/docs/payments-and-purchases.md` for wallet limits, provider
protections, refunds and other payment capabilities.
