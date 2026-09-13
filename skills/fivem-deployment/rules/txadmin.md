# txAdmin

## Role

txAdmin is the web-based server management layer bundled with the FXServer artifact. It is not a separate download: each artifact build ships a specific txAdmin version, so the txAdmin version a server runs is determined by the FXServer build it runs.

## Version pairing

| FXServer build | txAdmin |
|---|---|
| 35245 (recommended, 2026-09-13) | 8.1.1 |
| 35945 (latest, 2026-09-13) | 8.1.1 |
| 7290 (the stale `critical`/`optional` pin) | 7.0.0 |

The changelogs API returns the txAdmin version alongside each build. Read it there rather than assuming a pairing (see rules/artifacts.md).

## Artifact updates

Because txAdmin ships inside the artifact, updating txAdmin means updating the FXServer artifact — there is no way to move txAdmin forward while staying on an old build. Conversely, upgrading the artifact upgrades txAdmin, which may change the admin UI.

Updating is an artifact swap and a full restart:

1. Determine the target build from the changelogs API.
2. Stop the server.
3. Replace the artifact files with the target build's, keeping the server data directory and `server.cfg` untouched.
4. Start the server and read the console from the top for load-order and convar errors.
5. Confirm the reported build and txAdmin version match what was intended.

Artifacts cannot be hot-swapped. A restart is mandatory.

## Deployment recipes

txAdmin's setup flow can deploy a server from a recipe — a declarative file that downloads resources, imports SQL and writes a starting `server.cfg`. Recipes are a bootstrap convenience for a new server, not a maintenance tool: once a server is live, changes belong in `server.cfg` and the resources directory, not in re-running a recipe.

Do not quote txAdmin menu paths, button labels or console commands from memory — they change between major txAdmin versions. Describe the intent and let the user find it in their installed version.
