# Book a Duffel offer

- Use this guide once the user picks a complete offer to book. [Uncertain results](recovery.md) covers what follows a timeout, an unknown outcome or a Link action.

## Prepare passengers and seats

- `seat-options --offer-id OFFER` returns bookable seats for each passenger with their `position` (window, aisle or middle), and the flag repeats for a short list of offers. A zero price means no added fee, and an omitted seat is unavailable. Adjacent seats share a row and section on the same side of the aisle.

- Choose at most one seat per passenger and segment. Repeat `--seat PASSENGER:SEGMENT:SEAT`, with one-based numbers, once per seat, such as `--seat 1:1:28B --seat 2:1:28C`; the CLI reads each flag as one seat.

- When the user picks an offer, run `seat-options` for it and propose a free seat for each traveler on each flight: their saved or stated preference, otherwise a window or aisle, with travelers who fly together side by side. When no free seat meets those needs or the seat map can't be read, mention seat choice once, with the cheapest suitable seat's fee or that the airline assigns seats at check-in, and keep the booking moving without waiting for a seat choice.

<!-- duffel-bags-only:start -->
- The fare's own bag allowance is on each flight row. When the user wants more checked bags than it includes, or asks to add one, `bag-options --offer-id OFFER` lists the bags the airline sells with that offer: each traveler's bags per journey, with type, weight limit, how many can be added and the price per bag. An empty list means Duffel sells no extra bags for it, so the airline's site is the place to add them after booking.

- Add each bag with `--bag BAG:QUANTITY` on `validate-booking` and `book`, using `bag` from that list, such as `--bag 1-1.1-checked-23kg:1`. Bag prices are added to the total the user approves, so the user should know each bag and its price before they approve.
<!-- duffel-bags-only:end -->

- When the user picks an offer, call `wallet.list_payment_methods` with `provider: "stripe-link"` and `wallet.get_user_info` in the same turn. Fill the trip email and phone from the conversation, `~/USER.md` and `wallet.get_user_info`. Use the user's own name for a passenger only when the conversation shows the user is flying; each other passenger needs their own legal name. Show the prefilled name, email and phone in your question so the user can correct a name that differs from their ID.

- Show the chosen trip in that same message, so the traveler can ask for changes before validation: each flight with its date, times and flight number, the cabin and fare brand, bags, change and refund terms, any proposed seats, and the total. Then ask for what is still missing: usually each traveler's birth date and gender (`m` or `f`), and each traveler's legal given and family name when not already known. If Link is `not_connected`, ask for what is still missing first, then end that message with Link's connection link (`next_action.markdown`, unchanged), so the user connects while answering.

- Validation also needs the adult with each lap infant, and passport details only when it asks. The CLI sets `title` from gender and gives every passenger the first passenger's email and phone, so ask for a title or a second contact only when the traveler wants one. Ask for a loyalty account number only when the user wants credit.

- All traveler details for this booking are for its `validate-booking` and `book` only. Keeping them out of memory, and out of replies apart from the prefilled name, email and phone shown for confirmation, protects the traveler's identity.

- Put passengers in `data.passengers` in search order:

```json
{
  "data": {
    "passengers": [{
      "given_name": "Legal given name",
      "family_name": "Legal family name",
      "born_on": "1990-01-01",
      "gender": "f",
      "email": "trip-contact@example.com",
      "phone_number": "+14155550123"
    }]
  }
}
```

- For a lap infant, add `"accompanying_adult": N` with the adult's one-based position. A required passport goes in the passenger's `identity_documents` array with `type: "passport"`, the number as `unique_identifier`, an uppercase two-letter `issuing_country_code` and `expires_on` as `YYYY-MM-DD`. Identity details come from the traveler, since an empty or invented document makes the booking fail or tickets the wrong person, and a traveler who has not been born cannot be ticketed. For an unborn traveler, booking waits until birth, and later fares, availability and seats are unknown until then.

- Offer loyalty credit once without letting it block the booking. When the user wants it, add the account to that passenger as `"loyalty_programme_accounts": [{"airline_iata_code": "UA", "account_number": "ACCOUNT_NUMBER"}]`, with one object per programme. Validation confirms whether the airline supports it, and the user decides whether to drop an account that fails.

- Leave out the fields the CLI owns, which are `id`, `infant_passenger_id`, `user_id`, `type`, `selected_offers`, `services`, `payment` and `payments`.

## Validate and book

```sh
/opt/hatch/bin/duffel validate-booking --offer-id OFFER --booking-json JSON
```

- Validation refreshes the offer and checks travelers, documents, seats and loyalty, without payment or approval. Ask for every `required_missing` and `invalid` item together and rerun until `ready_to_book: true`.

- Treat `selected_offer` as the current itinerary, price, bags and fare terms. Check each slice's `from` and `to` against the chosen airports, and stop if they differ.

- Pass the account holder's email and legal name on the first `validate-booking`, using what the user said and filling only missing fields from `wallet.get_user_info`, with `--customer-email`, `--customer-given-name` and `--customer-family-name`, so a first booking needs no extra round for its payment profile. Validation ignores them once a profile is stored. Pass the same three flags to `book` only when validation returned `customer_profile_stored: false`. This profile is the account holder, not a passenger, and it is created only after purchase approval.

- If Link connects before the traveler details arrive, confirm it in one line and wait for them. Once the details are in, validate and `book`; the approval card handles the card choice.

- Book once with the same booking JSON and seats, after Link is connected as [Link by Stripe](/opt/hatch/connectors/stripe-link/CONNECTOR.md) describes. Add `--payment-method-id ID` only for a card the user chose for this purchase. Otherwise, approval preselects the default card or a usable card if none is default. The user can change it there.

```sh
/opt/hatch/bin/duffel book --offer-id OFFER --booking-json JSON --seat 1:1:28B --seat 2:1:28C
```

- `book` revalidates before any payment request. Its single approval covers the itinerary, travelers, seats and fees, fare terms, total, the first-time profile, a one-time virtual card, 3DS and immediate ticketing. Any change to the flight, fare, date, passengers, services or total needs a fresh approval.

- Held orders, Duffel balance payment, inline cards and raw order APIs are not supported.

- If Link is not connected, explain the one-time virtual card and share its connection link. For an airline-site fallback, use `browser.browse` and follow `~/docs/chat/payments-and-purchases.md`. A card the user supplies for that booking may go to the browser task as text with `wallet: null`; the browser checkout still requires payment approval. This does not enable inline cards in the Duffel API. If neither supported route works, stop with the itinerary prepared and say that payment is blocked.

- Prefer one offer that covers the whole itinerary. Split it into separate bookings only with the user's agreement before the first `book`. Explain that each booking has its own approval, payment and terms, that later offers are not held, and that a later failure can leave earlier tickets booked.

- For a split trip, validate both tickets before booking either, so a price change or missing detail shows up before any purchase. Then book each ticket's `id` with its own `book`.
