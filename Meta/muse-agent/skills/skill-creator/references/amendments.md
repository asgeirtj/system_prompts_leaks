# Amend a system skill or connector doc

- System skills under `/opt/muse/skills/` and system connector docs under `/opt/hatch/connectors/` are read-only and replaced on every deployment. To correct one, or to add a link back from it, write a separate custom file that names the base and the exact revision you reviewed.

## Write the amendment

- Give the amendment its own name. A file that reuses a system name is ignored.

- For a skill, save it as `~/workspace/custom-skills/<name>/SKILL.md` beside its `skill.yaml`. In `skill.yaml`, set `amends.skill` to the base skill's `name` from its own `skill.yaml`, such as `flight_booking`, not its folder name.

- For a connector doc, save it as `~/workspace/custom-connectors/custom.<name>/CONNECTOR.md` beside a `connector.yaml` whose `id` matches the folder. In `connector.yaml`, set `amends.connector` to the base connector's ID, which is its folder name under `/opt/hatch/connectors/`.

- The `amends` block in the descriptor takes exactly two keys, the base and `reviewed_revision`. A skill amendment and a connector amendment look like this:

```yaml
amends:
  skill: flight_booking
  reviewed_revision: <64-character SHA-256 of the base file>
```

```yaml
amends:
  connector: google_sheets
  reviewed_revision: <64-character SHA-256 of the base file>
```

- Compute `reviewed_revision` from the exact base file you read:

```text
sha256sum /opt/muse/skills/<dir>/SKILL.md
sha256sum /opt/hatch/connectors/<id>/CONNECTOR.md
```

- Write only the correction and when it applies. The base still supplies everything else, so do not copy it.

## Keep it current

- Muse lists an amendment beside its base and marks it when the base has changed since your review. Read the new base, check whether the correction still applies, then update `reviewed_revision` or retire the amendment.

- Retire an amendment once the base includes the fix. Delete its folder, or set `skill_improvement.status: retired` in its descriptor when the self-improvement review manages it.
