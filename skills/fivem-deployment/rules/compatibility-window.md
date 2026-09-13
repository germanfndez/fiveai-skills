# Compatibility Window

## The October 15 2026 cutoff

From the Cfx forum post dated 2026-08-20, verbatim:

> "October 15 2026: The end of the compatibility window. Connections to older FXServer versions will no longer be possible."

The same post states: "As of today, FXServer version 35245 will become the new Recommended version for FiveM."

Source: https://forum.cfx.re/t/support-for-gta-online-the-kortz-center-heist-update-is-available-now/5422124

State the date. Never phrase it as "X days from now" — that goes stale the moment it is written.

## What breaks

After October 15 2026, clients can no longer connect to FXServer versions older than the supported range. This is a connection-level cutoff, not a warning banner: an unupgraded server becomes unreachable to players.

## Upgrade path

The advice in the post is to upgrade to FXServer **35245 or later** before October 15 2026.

1. Read `recommended` from the changelogs API (see rules/artifacts.md).
2. Confirm the current build number of the running server.
3. If it is below 35245, upgrade — this is not optional maintenance.
4. Restart the server fully. Artifact changes are not hot-reloadable.
5. Re-check that `sv_enforceGameBuild` is still valid for the new artifact (see rules/server-cfg.md).

## Deprecation: sv_replaceExeToSwitchBuilds

`sv_replaceExeToSwitchBuilds` is **fully deprecated as of build 35245**.

The client now always runs the latest stable GTAV executable and loads only the Title Update requested by `sv_enforceGameBuild`. There is no executable-swapping behavior left to enable.

Remove the convar from `server.cfg` when upgrading. Do not emit it in new configs, and do not suggest it as a fix for a build mismatch.
