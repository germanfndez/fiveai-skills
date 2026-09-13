# Artifacts

## The lifecycle API

This is the authoritative machine-readable source for build state. Query it before recommending anything.

```
https://changelogs-live.fivem.net/api/changelog/versions/linux/server
https://changelogs-live.fivem.net/api/changelog/versions/win32/server
```

```sh
curl -s https://changelogs-live.fivem.net/api/changelog/versions/linux/server
```

## Fields

| Field | Meaning | Trust |
|---|---|---|
| `recommended` | The build Cfx currently recommends for production | Yes |
| `latest` | Newest published build | Yes |
| `critical` | Legacy field | No — stale-pinned |
| `optional` | Legacy field | No — stale-pinned |
| `support_policy` | Support policy metadata | Yes |
| `support_policy_eol` | Map of build number -> ISO EOL timestamp | Yes |

`critical` and `optional` are both pinned to build **7290** (txAdmin 7.0.0) and are not maintained. Do not surface them as advice. Read `recommended` and `latest` only.

## Snapshot (verified 2026-09-13)

| Channel | Build | txAdmin |
|---|---|---|
| `recommended` | 35245 | 8.1.1 |
| `latest` | 35945 | 8.1.1 |

These are a snapshot, not a constant. Re-read the API rather than quoting them.

## Rolling EOL

`support_policy_eol` currently holds **476** entries mapping a build number to the timestamp at which that build stops being supported. Builds expire continuously, not in batches.

Verified examples from that map on 2026-09-13:

| Build | EOL |
|---|---|
| 31123 | 2026-09-14 |
| 31248 | 2026-09-16 |
| 35245 | 9999-12-31T23:59:59 |

The `9999-12-31T23:59:59` sentinel on 35245 means the build does not expire while it holds the recommended slot. When a newer build becomes recommended, expect a real date to be assigned to the old one.

Read the EOL for the exact build a server runs:

```sh
curl -s https://changelogs-live.fivem.net/api/changelog/versions/linux/server \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['support_policy_eol'].get('35245'))"
```

## Picking a build

1. Production: take `recommended`.
2. Need a game DLC that just shipped: take `latest`, and accept that it is less tested.
3. Pinned to an older build for a dependency: look that build up in `support_policy_eol` and put the expiry date on the calendar.
4. A build whose EOL has already passed is out of support — plan the upgrade, do not wait for a break.

Always report the build number together with its EOL value. A build number alone is not an answer.
