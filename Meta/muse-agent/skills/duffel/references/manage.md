# Manage a Duffel booking

```sh
/opt/hatch/bin/duffel booking-status
/opt/hatch/bin/duffel booking-status ORDER_ID
/opt/hatch/bin/duffel cancellation-quote ORDER_ID
/opt/hatch/bin/duffel cancel-booking QUOTE_ID
```

- `booking-status ORDER_ID` looks up a booking. Without the ID, `booking-status` lists bookings, and matching the trip's dates, route and total identifies the right one before sharing a confirmation number. It checks up to 25 bookings made here, so the list may be incomplete.

- `cancellation-quote` does not cancel. Report its refund amount, refund destination, airline credits and expiry. A null refund amount means the carrier gave no quote, not zero.

- `cancel-booking` rechecks the exact quote and asks for approval once before the irreversible cancellation.

- This connector does not handle paid bags or other extras, cancelling some passengers, date, time or name changes, pets, unaccompanied minors, check-in or boarding passes. Direct those to the airline instead of improvising with raw APIs.
