# Campaign targeting resolution

Read this only when a campaign audience contains a creation-bound interest,
language, or location that is not already an ISO country code or canonical
object returned in this conversation.

Call `ads_targeting_search` once with all grounded candidates. Interest queries
may come from the advertiser or a small set directly supported by the current
product, Page, and compatible-history evidence. They are hypotheses until the
lookup returns them; weak or mismatched evidence produces no query and keeps
Advantage+ broad.

A search rejected as a restricted topic means that audience cannot be targeted
at all. Do not search a synonym, a narrower term or an adjacent interest for
the same people; say it is not available and keep the audience broad or use
what the advertiser can target instead.

For a place, send its actual name with the semantically correct
`location_type_hint` and known country code: city, subcity/borough,
neighborhood, region, ZIP, address/place, or market. Do not append a guessed
state or region, and add a radius only for an actual address/place requirement.
Validate returned name, type, country, and region together; a same-name place in
another region is not a match.

Map only returned `targeting_results` to interests, `location_results` to
geography, and `locale_results` to languages. Preserve each selected result's
canonical key or ID across the typed budget and campaign commands; include the
returned display metadata those commands require, and let them construct their
tool-specific targeting shapes. Keep raw IDs out of user-facing prose. Review
every unresolved item and warning. If several places remain plausible, choose
only when the advertiser's words or verified business evidence distinguishes
one; otherwise ask.

An unresolved exact place remains open—never widen it silently to a country or
send its name where the ad-set schema requires an object. Omit an unresolved
interest or language rather than claiming it is included. Advantage+ may expand
suggestions but does not remove the chosen geography. Saved and Custom
Audiences remain owned by their dedicated tools.
