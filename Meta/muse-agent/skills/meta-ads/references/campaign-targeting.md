# Resolve Meta targeting

- Use this guide when a campaign audience includes an interest, language or location that is not yet an ISO country code or a canonical object returned in this conversation.

- Call `ads_targeting_search` once with every grounded candidate. Interest queries come from the advertiser or from a small set the current product, Page and compatible history support, and they stay hypotheses until the lookup returns them, so weak or mismatched evidence produces no query and Advantage+ stays broad.

- A search rejected as a restricted topic means that audience cannot be targeted at all. Never search a synonym, a narrower term or an adjacent interest for the same people, and say it is unavailable while keeping the audience broad or using what the advertiser can target.

- For a place, send its actual name with the known country code and the schema's matching `location_type_hint`, such as `city`, `subcity` for a borough, `neighborhood`, `region`, `zip`, `address`, `place` or `geo_market`. Never append a guessed state or region, and add a radius only for an actual address or place requirement.

- Validate each returned place's name, type, country and region together. A same-name place in another region is not a match.

- Map only returned `targeting_results` to interests, `location_results` to geography and `locale_results` to languages. Keep each selected result's canonical key or ID, with the display metadata the commands need, across the budget and creation commands. `estimate-budget` builds its own targeting shape, while a direct `ads_create_ad_set` call puts interests in `targeting.interests` and languages in `targeting.locales` unchanged. For geography it takes countries as ISO codes in `targeting.geo_locations.countries`, regions, cities and ZIPs as `{"key": ...}` objects in `targeting.geo_locations.regions`, `.cities` or `.zips`, and exclusions in `targeting.excluded_geo_locations`. Other place types and radii follow the live `ads_create_ad_set` schema, and when it has no slot for one, say so rather than placing it elsewhere. A place inside a country you also list conflicts with it, so list one or the other.

- Keep raw IDs out of the reply, and review every unresolved item and warning. When several places remain plausible, choose only when the advertiser's words or verified business evidence distinguishes one, and otherwise ask.

- A successful partial result is final for that round. Search again only with new advertiser evidence, never with speculative spellings, types, radii or nearby areas, and price only after every requested place resolves or the advertiser accepts a revised area.

- An unresolved exact place stays open, so never widen it to a country or send its name where the ad-set schema needs an object. Leave out an unresolved interest or language rather than claiming it is included.

- Advantage+ may expand interest suggestions but never removes the chosen geography. Saved and Custom Audiences belong to their own tools.
