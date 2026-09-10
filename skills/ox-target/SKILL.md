---
name: ox-target
description: "Trigger: ox_target, third-eye, targeting, interaction zone, qb-target migration. Add targetable entities, models, players and zones with exports.ox_target."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# ox_target

Third-eye targeting for FiveM. Replaces qb-target and bt-target. Supports ox_core, esx and qbx_core.

## Activation Contract

Load this skill when the user asks to make something interactable: "press E on this ped", "third eye", "target option", "add an interaction to this vehicle/door/prop", or when migrating from qb-target.

## Hard Rules

- Call every function through `exports.ox_target:<fn>(...)`. There is no global `ox_target` table.
- `onSelect` runs on the CLIENT. Never trust its arguments server-side: re-validate in the `serverEvent` handler.
- Always pass `name` on an option you intend to remove later. Removal is by name, not by index.
- `distance` defaults to the resource default; set it explicitly for anything above ~2.5m.
- Zone and entity functions are CLIENT-side only.
- Prefer `addLocalEntity` for entities you spawned yourself; use `addEntity` only for networked entities and expect the id to change on respawn.

## Decision Gates

| Target | Function |
|---|---|
| One entity you spawned locally | `addLocalEntity(entities, options)` |
| A networked entity (net id) | `addEntity(entities, options)` |
| Every instance of a model | `addModel(models, options)` |
| Every ped / vehicle / object / player | `addGlobalPed` / `addGlobalVehicle` / `addGlobalObject` / `addGlobalPlayer` |
| Everything, no filter | `addGlobalOption(options)` |
| A location, not an entity | `addBoxZone` / `addSphereZone` / `addPolyZone` |

## Execution Steps

1. Confirm `ox_target` is started AFTER `ox_lib` in `server.cfg`.
2. Pick the function from the Decision Gates table.
3. Build the options array. Read rules/options.md for every allowed field.
4. Gate visibility with `groups`, `items` or `canInteract` rather than checking inside `onSelect`.
5. Route the action: `onSelect` for client logic, `serverEvent` for anything that grants money, items or state.
6. Store the returned zone id if the zone must be removed later.

## Output Contract

Return runnable Lua using `exports.ox_target`. Include the `fxmanifest.lua` dependency lines when the resource is new. Never emit qb-target syntax.

## References

- rules/setup.md — install, fxmanifest, convars, framework support.
- rules/options.md — every field of the option table.
- rules/entities.md — entity, model and global targets.
- rules/zones.md — box, sphere and poly zones.
- rules/migration.md — qb-target to ox_target.

Upstream docs: https://overextended.dev/ox_target
