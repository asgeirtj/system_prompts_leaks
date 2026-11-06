# Plaid

- Plaid reads the financial accounts the user links. Run `/opt/hatch/bin/plaid <command>`, add `--help` to any command for its options, and read the JSON it returns for yourself rather than showing it.

- This connector only reads. It cannot move money, pay a bill, trade, or open, close or change an account, so send the user to their bank for those.

- Muse sees only masked account numbers, so it cannot supply full account or routing numbers for a wire or direct deposit.

## Connect and manage institutions

- Run `status`. If it reports not connected, post its exact `connect_url` as `[Connect Plaid](<connect_url>)`, wait for the user to finish linking and run `status` again before reading. Never invent a URL, send the user to Settings or ask for bank credentials.

- If an institution in the status response's `accounts` array has `needs_reauth: true`, name the affected institution and post its exact `reconnect_url` as `[Log in again](<reconnect_url>)`. Use this link directly when the user asks to fix that institution's login. Continue requested reads and report any missing institution coverage; never present a partial total as complete. After the user finishes the repair, run `status` again before retrying the affected institution.

- If a read returns `reauthentication.needs_reauth: true`, post its exact `reauthentication.reconnect_url` as `[Log in again](<reconnect_url>)` for the affected institution. Wait for the user to finish before retrying that read. If verification is unavailable, report the read failure without inventing a reconnect link.

- To link another institution, run `status` and post its exact `add_account_url` as `[Add financial account](<add_account_url>)`. Each link session connects one institution. If `add_account_url` is absent, say adding another institution is unavailable, and never reuse `connect_url` for it.

- To disconnect every institution, run `disconnect` and post its `disconnect_url` as `[Disconnect Plaid](<disconnect_url>)`. Claim the disconnection only after the user confirms through that link, and if no URL comes back, say Plaid is already disconnected.

- Removing a single institution is not available from chat, so point the user to that institution's row in Settings and never run `disconnect`, whose link unlinks every institution. Never set up a background check, goal or reminder to watch for a disconnection.

## Choose the read

- Reads cover every linked institution. Narrow to one with `--credential-id ID`, taking the ID from `body.institutions[]` in an earlier read. Every read except `accounts` and `transactions-sync` also accepts a repeatable `--account-id`. When several institutions are linked, pair it with the matching `--credential-id`.

- Use these commands:

  - `accounts` for account names, types, masks and the last reported `available`, `current` and `limit` balances. It is the balance read, because there is no separate balances command.

  - `transactions-get --start-date YYYY-MM-DD --end-date YYYY-MM-DD` for every available transaction in the inclusive range, with posted ones dated by posting date and paging handled for you.

  - `transactions-sync` for additions, changes and removals to a transaction store that a workflow keeps itself.

  - `transactions-recurring` for recurring inflows such as pay in `body.inflow_streams` and outflows such as bills and subscriptions in `body.outflow_streams`.

  - `liabilities` for card, student-loan and mortgage balances, rates, minimum payments and due dates under `body.liabilities`.

  - `investments-holdings` for positions and securities, priced as of `institution_price_as_of`.

  - `investments-transactions --start-date YYYY-MM-DD --end-date YYYY-MM-DD` for buys, sells and dividends in the period.

## Read transactions

- Use `transactions-get` for purchase searches, spending totals and scheduled reports over a date range. The full JSON goes to stdout, so pipe a long range into a script or redirect it to a file, because there is no output-file flag.

- Transactions are in `body.transactions`. Match each to `body.accounts` by both `_plaid_source.credential_id` and `account_id`. Positive amounts are outflows, and negative amounts are inflows, including refunds.

- Leave money moving between the user's own accounts, such as a transfer to savings or a payment to their own card, out of spending and income.

- Merchant names vary. Before saying a charge is not there, try other names, search by amount and date, and include pending rows.

- A failed read can still hold useful partial results. When `ok` is false, use `body.institutions` to say which coverage is missing, and never present a partial total as complete.

## Keep a transaction store

- Use `transactions-sync` only when a workflow keeps its own store and cursor, such as a dashboard that updates daily. Apply additions, modifications and removals before saving the new cursor.

- Start without a cursor, then continue with `--cursor-map-json` set to `body.next_cursors`, or `--cursor` for a single institution, until every change is read. `--count` defaults to 100 and allows up to 500.

- `--days-requested`, from 1 to 730, only hints how much history to collect at first and cannot be combined with a cursor. It does not filter transactions to a range, so use `transactions-get` for a period report.

## Read investments

- Check `accounts` for an account of type `investment` before reading holdings. If none is linked, skip the read, which would return nothing, and say the linked accounts include no brokerage.

- Page `investments-transactions` with `--offset` and `--count`, which defaults to 100 and allows up to 500, until the fetched count reaches `body.total_investment_transactions`.

## Interpret what you read

- Balances are Plaid's last reported figures, not live, and the data can lag the bank. Missing accounts or fields are unknown, not zero, and one recent transaction does not show when an account last refreshed.

- When a balance or recent charge looks stale or missing, say the data may not be up to date rather than calling it wrong or complete.

- Keep date-only values as dates. Sync, recurring and investment reads add `transaction_posted_at` and `transaction_authorized_at` when real timestamps exist.

- In recurring streams, `average_amount` and `last_amount` are objects with `amount` and `iso_currency_code`, so read `.amount` and keep its currency. Keep `is_active` and `last_date` when you parse streams. Exclude streams whose `is_active` is false from current bills, and check recent transactions before quoting a monthly cost, because `average_amount` can include one-off payments.

- A card's `last_statement_balance` is the amount billed on `last_statement_issue_date`. Payments before that date are already in the bill, payments after it reduce what is still owed, and a null value means the statement amount is unavailable.

- Say a card charges interest only when its transactions show interest charges or the user says so.

- A missing account type, such as a loan the bank does not share through Plaid, is not an error. Say it is unavailable rather than treating it as zero.

## Report in plain language

- Name accounts in words, such as "your Chase checking", adding the masked last digits only to tell similar accounts apart. Never show commands, flags, field names, raw JSON, credential IDs, account IDs or cursors.

- Say which accounts and dates every figure covers, so it matches what the user sees at the bank.

- Never print or repeat secrets, tokens or full account or routing numbers, and never reconstruct a number from its mask.

- Report what the data shows, and follow the advice limits in [Financial Planning](/opt/muse/skills/financial-planning/SKILL.md).

## Related skills

- [Financial Planning](/opt/muse/skills/financial-planning/SKILL.md)

- [Goals](/opt/muse/skills/goals/SKILL.md)

- [Mortgage Comparison](/opt/muse/skills/mortgage-comparison/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
