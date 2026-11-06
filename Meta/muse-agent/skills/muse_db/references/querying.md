# Query rules for `muse.db`

## Read scope

- Use schema-qualified table names from the [index](/opt/muse/skills/muse_db/references/schema.md). Submit one bounded, read-only `SELECT`. Non-recursive CTE names must begin with `hatch_cte_`, and recursive CTEs are rejected.

- PostgreSQL catalogs, migration bookkeeping, backup tables, credentials, Sentinel's approval store and per-artifact `app.db` files are outside this surface. External or opaque identifiers have no local owner unless a table guide names one.

- Credentials include access and refresh tokens, passwords, API keys and payment-instrument secrets. Those remain behind their credential service. Listed non-secret lifecycle records, such as spend-request state, can be queried.

## Protected content

- Private model reasoning and saved per-turn developer instructions are withheld. Tables carrying protected content are read through security-barrier views. Each affected table's guide lists the row filters and withheld columns.

- A withheld column fails as an unknown column. A filtered row is absent without error. Read the table's restrictions before interpreting either result as missing records. Where no such restriction is listed, check the query and source records rather than assuming redaction.

- Stored commentary is readable for diagnosis, but hidden from the user's chat. Its presence does not establish that the user received its contents.

- The tool uses a least-privilege database role with `SELECT` only on the catalog's allowed relations. The guide does not grant additional access.

## Allowed expressions

- Only the functions and casts below are accepted. If the tool rejects one, rewrite using this vocabulary rather than treating records as absent.

- Collection aggregates such as `json_agg`, `jsonb_agg`, `array_agg` and `string_agg` are unavailable because they can build an unbounded value before output limits apply. Select bounded rows directly.

- Alias projected columns to unique names when joining tables. Duplicate output names are rejected because JSON objects cannot preserve both values.

### Functions

`abs`, `age`, `array_length`, `array_position`, `array_to_string`, `avg`, `bit_and`, `bit_or`, `bool_and`, `bool_or`, `btrim`, `cardinality`, `ceil`, `ceiling`, `char_length`, `coalesce`, `concat`, `concat_ws`, `count`, `date_bin`, `date_part`, `date_trunc`, `dense_rank`, `encode`, `every`, `extract`, `first_value`, `floor`, `greatest`, `json_array_length`, `json_build_array`, `json_build_object`, `json_extract_path`, `json_extract_path_text`, `json_object_keys`, `json_typeof`, `jsonb_array_length`, `jsonb_build_array`, `jsonb_build_object`, `jsonb_extract_path`, `jsonb_extract_path_text`, `jsonb_object_keys`, `jsonb_typeof`, `lag`, `last_value`, `lead`, `least`, `left`, `length`, `lower`, `ltrim`, `make_interval`, `max`, `md5`, `min`, `mod`, `now`, `nth_value`, `ntile`, `nullif`, `octet_length`, `position`, `power`, `rank`, `regexp_match`, `regexp_replace`, `replace`, `reverse`, `right`, `round`, `row_number`, `rtrim`, `split_part`, `sqrt`, `strpos`, `substr`, `substring`, `sum`, `time_bucket`, `timezone`, `to_char`, `to_json`, `to_jsonb`, `trim`, `upper`.

### Cast spellings

`bigint`, `bool`, `boolean`, `bytea`, `char`, `character`, `character varying`, `date`, `decimal`, `double precision`, `float4`, `float8`, `int`, `int2`, `int4`, `int8`, `integer`, `interval`, `json`, `jsonb`, `numeric`, `real`, `smallint`, `text`, `time`, `timestamp`, `timestamp with time zone`, `timestamp without time zone`, `timestamptz`, `timetz`, `uuid`, `varchar`.
