# Acme automation usage: evidence contract

**Grain:** Dated aggregate counts/rates, separate cohorts, and aggregate conversation flows.

**Queries:** installs, install_surfaces, signup_cohorts, roles, new_users, activation, activation_surfaces, activation_cohorts, time_to_skill, activity, activity_plans, activity_surfaces, activity_ratios, retention, first_conversation_flow. Exact fields and deterministic fixtures are in `fixtures/generate.mjs`. `fixture()` returns an independent copy.

## Required evidence

- Defined install and activation eligibility
- Numerators and denominators for combined rates
- Cohort observation cutoff and deduplicated flow population

## Exclusions

- Entity-level drilldown from aggregates
- Summing overlapping WAU populations

This fixture is synthetic, never an executed warehouse query or live market feed. Missing evidence is not zero. Rates require their eligible population; percentile aggregates require mergeable observations/distributions. Preserve independently scoped filters and the example's custom compositions. The catalog owns current approval status; semantic and rendered/interaction verification remain separately recorded.

## Population relationships

The synthetic installed base opens at 1,560 and reconciles daily with first installs and final removals. Current surface counts overlap by an explicit amount; install records can repeat, while signup-age groups and account plans are exclusive integer partitions. The onboarding-role panel is the latest snapshot: installed and L7-active counts reconcile to the latest global totals, while role-specific rates remain distinct.

DAU is within the installed base. WAU is bounded by the maximum and sum of the seven daily counts and by the current installed base. Weekly turns/conversations sum exactly seven daily facts; the first six observations have no complete trailing week and stay null, including derived ratios and plan/surface splits. Activity surfaces overlap and must not be added to obtain global WAU.

Activation denominators use the daily first-install facts. Weekly install-cohort curves share those eligible counts; later activation remains cumulative. Time-to-skill bins partition the matured D7-active population in this fixture, which models a non-index invocation for each such activation. That snapshot aggregate is independent of the date filter. New-user D1 rates include explicit installed/eligible counts. First-high-value-action retention cohorts differ from first-install cohorts; do not equate their denominators. The first-conversation flow remains a separate aggregate sample, not an entity-level roster or every conversation in the activity panel.

## Fixture profile

The deterministic Acme fixture covers June 2–August 21, 2026. Counts, rates, installed-base ledgers, trailing totals and cohort observations are recomputed from the profile in `fixtures/generate.mjs`. Largest-remainder allocation preserves integer partitions. Cohort maturity gaps and incomplete trailing weeks remain missing. Source tables use the `fixture.acme_` namespace; the semantic suite runs against this snapshot.
