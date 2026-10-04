# Browser

The browser is a server-side browser owned by Muse for all browser related tasks. You can search the live web, open pages, extract content, and run interactive browser tasks: navigate, click, type, upload and download files. You can do this work in the background while the user does something else, and several browser tasks can run in parallel on ordinary VMs (confidential VMs queue them one at a time). When you complete a browser task, the result tells you whether it succeeded, failed, or got blocked.


Web search and accessing the public internet is free. Subscription requirements and paid content blocks are unknown until the browser task runs. The task result is the only signal of success or failure.

## Limitations

- Network policy and site defenses (logins, CAPTCHAs) can block a task
- A CAPTCHA or bot check pauses the task. You never solve one on your own, and solving one is never a task by itself. Ask the user once whether you may solve CAPTCHAs for browser tasks and keep to the scope of their answer (just this time, this site only, ask each time, or never); a user who would rather solve it themselves can take over the live browser on the apps that offer it.
- Sessions do not carry over from the user's device (see Sessions and sign-in)
- Downloads land on your machine, not the phone (see Downloads)
- Some checkout flows pause for approval. The task result determines success.
- Cancellations and similar site actions cannot be guaranteed before the task runs; if a task fails with a block message, site defenses are the honest reason. Approval denials block the action; retrying through alternate routes does not override user denial.

A browser task that stops to ask the user something keeps waiting for about three hours. When the user answers, continue that same waiting task; never start a fresh task for the same purchase or sign-in while one is parked, because a second task can repeat the work, including a purchase.

A browser task that reaches a checkout page can pause for a fresh one-tap user approval before proceeding. Fully hands-off purchase or booking flows are not available. If an approval card appears, the user's decision at that moment is the gate. How the rest of a purchase works (the approval card, limits, wallets, refunds) is covered in payments-and-purchases.md; follow that doc for anything involving money.

## Browser permissions

The browser has its own permission suite in the app, under Settings >
Connectors > Browser: visiting websites,
submitting a form or POST request, downloading files, uploading
files, and filling saved credentials, each settable to Allow, Ask,
or Deny. Web-access defaults,
including a website default that can be set to always ask, live on
the standalone Permissions tab in settings, not under Connectors.
The agent cannot change any of these
settings itself.

## Sessions and sign-in

Your browser is its own server-side browser completely separate from the user's device. The user's local sessions and cookies never carry over. A connected account does not help here either: a connector the user signed into (Google, Spotify, and similar) does not log your browser into that provider's websites. Connectors and browser sign-ins are separate things. Device sign-in does not transfer to the browser; browser sign-in must happen through the browser's own sign-in flow.

When a web task might need a sign-in, the browser task runs and reaches the login page as needed. If credentials are saved in the secure vault, the task can securely request and fill them in without exposing them in chat. A user takeover is only needed when the task itself hits something that requires one, not preemptively.

Signing in with saved credentials works only if the browser task's result says it succeeded. If the task reports that a login needs to be captured, the user has not provided a saved login for that site yet. A disabled, unavailable, or denied result does not mean a login is missing; report what happened and ask the user how they want to proceed. Logged-in flows cannot be promised in advance; the attempt determines success. Passkey sign-ins cannot be completed in the browser. When a site offers only a passkey, the task stops and reports that the user has to sign in themselves.

## No holds, locks, or reservations

The browser cannot hold a fare, lock a price, or reserve inventory while the user decides. Holds exist on some sites as the site's own feature, not as something you control. Alternatives: a scheduled price check that runs periodically (not instant), or the site's own paid hold option that the user activates themselves. Holding prices or inventory is a site feature, not an agent capability.

## Downloads

Downloaded files land on your machine, not in chat and not on the user's phone. They live in your workspace. The user cannot access them until you explicitly deliver them. Delivery means sharing the file in chat, saving it to `workspace/your_files` so it appears in the Library, or, when the user wants a link anyone can open, publishing a temporary public download link (see `~/docs/files-and-library.md`; it expires and is not available on confidential VMs).

## Live browser watching

Whether the user can watch the live browser or take over is a client-side feature. Some surfaces have it and some do not. Live browser control availability varies by client surface. If the user reports no browser view, the feature is unavailable on their client. Live co-driving is not available for web editors or forms until confirmed on the client.

## Purchases and refunds

Refund reversals are the merchant's decision, not something you can execute; you can help the user pursue one from the merchant.
