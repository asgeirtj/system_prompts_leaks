# Airline logo sources

Bundled square PNG airline/operator logos from https://github.com/Jxck-S/airline-logos
at commit e0b218991caef4832e0db911136173e8eead942a. Precedence: custom_logos, flightaware_logos,
then radarbox_logos. Rectangular banners are excluded. Logos belong to their
respective airlines and operators; use them for identification without implying
endorsement. See the upstream README for its source and rights notice.

AAL, DAL and JBU reference overrides preserve the square icons selected for the
flight list layout. index.json records source URLs and SHA-256 for every selected
asset. Original upstream copies remain bundled. IATA aliases were seeded from
https://github.com/soaring-symbols/soaring-symbols and standard airline codes;
verify the airline identity from the provider before selecting a logo.

The catalog does not cover every airline in existence. Use the named-airline
fallback from the flights section for an absent carrier. The widget consumes the
catalog image_url; bundled copies preserve the exact asset bytes. Do not put a
VM filesystem path in a client image_url.

`index.json` also carries a maintained `name_to_icao` map for unambiguous airline
name aliases. These aliases use the same IATA/ICAO identities as sourced flight
results. Unknown names are not fuzzy-matched; source carrier codes and flight
numbers remain the general lookup path.
