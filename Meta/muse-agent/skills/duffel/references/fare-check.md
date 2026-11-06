# Check the fare on a booked trip

- Flight Tracking's fare job runs this check daily. Write these rules into the job's body.

- Before every run's Duffel command, check `muse.connector_search` for Duffel. If the lookup fails or does not return Duffel, skip the search for this run.

- If `search` refuses because a date has already passed, this run has nothing to price; don't retry with a guessed date. If the booked itinerary has departed, end the job under its stop conditions. Otherwise the job's date is wrong: treat it as a failed read and note the mismatch in the state file.

- If a Duffel command returns `error.kind: connector_country_not_allowed` or `code: duffel_unavailable`, make no further Duffel calls in this run. Treat a skipped or refused search as a failed read under Flight Tracking's coverage rules. Keep the job and any pending candidate with a failure note; a skipped or refused confirmation run returns to the daily schedule like other failed confirmations.

- While Duffel is available, run exactly one `search` per run for the complete booked itinerary and passenger mix, with `--limit 30`, saved to a new file. Duffel is the pricing source here, since a browser or web price isn't comparable with the booked fare; other failed scheduled searches wait for the next run.

- Pass the booked baseline with the search: `--fare-check-flights` with every booked segment as `FLIGHT@YYYY-MM-DD`, the flight number and local departure date, comma-separated in itinerary order; `--fare-check-total` with the paid total; and `--fare-check-currency` with its currency, such as `--fare-check-flights UA123@2026-12-01,UA456@2026-12-08 --fare-check-total 742.10 --fare-check-currency USD`. Add `--fare-check-confirm` on the confirmation run. Write these flags into the job's body. When a booked flight number is unknown, take it from the booking evidence; if the evidence doesn't give it, record the missing scope and skip the search. Ask for missing facts only in a live conversation.

- With these flags the search returns only offers on the booked flights, in every fare brand on sale, and `fare_check` compares the cheapest with the booked total. `lower` names it in `cheapest_offer`, with `drop` and `drop_pct`. `not_lower`, `no_matching_offer` and `currency_mismatch` mean no candidate this run, and `search_failed` is a failed read. A `lower` result is a price, not yet a qualifying drop: `cheapest_offer`, `drop` and `drop_pct` describe only the cheapest offer, whose scope may differ from the booking. Evaluate the returned offers below the booked total, cheapest first, under the scope and net-savings rules below until one qualifies.

- Compare an offer only when its priced scope matches the booked baseline exactly. That means every leg's dated flight numbers and airports, the passenger mix, the cabin or fare family, included bags, stop pattern, refund and change restrictions, currency and the basis for taxes and fees.

- A one-way or single-leg offer isn't comparable with a round-trip or multi-leg total, and a booking total splits across legs only where line-item prices give the exact amount.

- Treat three baseline gaps as missing scope. An unstated booked fare family makes any basic, light or saver brand non-comparable. Extras in the paid total come out, or the candidate's price for the same extras goes in. A total that may not cover every traveler is not comparable.

- Record a missing or mismatched scope as non-comparable, clear any pending candidate tied to it, and stay silent.

- Net savings are the fare drop minus known change, cancellation and rebooking costs. A candidate qualifies when net savings exceed 10 percent of the original paid total or the booking-currency equivalent of USD 100.

- Convert USD 100 with a fresh exchange-rate source and record that source's time. When no reliable rate is available, use only the 10 percent threshold.

- The first qualifying candidate is not an alert. Save it as pending, with its itinerary, total, currency and check time, and update the same fare job to run once about an hour later.

- On that confirmation run, search once more with `--fare-check-confirm` and confirm only when inventory equivalent to the pending candidate, not just `cheapest_offer`, still qualifies. Clear the pending candidate when it has disappeared, no longer matches or fell below both thresholds. Keep it with a failure note when the search failed. Return the job to its daily schedule after any of these outcomes.

- Before notifying, read the owner's recent activities for a later booking change, such as a rebooked leg or an added traveler. If the booking changed, update the baseline, clear the candidate and stay silent.

- When the candidate is confirmed, save the comparison and notify under Flight Tracking's notice rules. Say when the fare was confirmed, that fares can change before the user acts, and ask whether they want help investigating a credit, refund or rebooking.

- If the user says yes, run one fresh search before quoting savings. That answer authorizes investigation and preparation only; whether a credit or refund is granted is up to the airline.
