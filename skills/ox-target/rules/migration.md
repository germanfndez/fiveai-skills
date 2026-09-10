# qb-target to ox_target

qb-target is archived. The concepts map 1:1 but the syntax differs.

## Function names

| qb-target | ox_target |
|---|---|
| `AddBoxZone` | `addBoxZone` |
| `AddCircleZone` | `addSphereZone` |
| `AddPolyZone` | `addPolyZone` |
| `AddTargetEntity` | `addLocalEntity` / `addEntity` |
| `AddTargetModel` | `addModel` |
| `AddGlobalPed` | `addGlobalPed` |
| `AddGlobalVehicle` | `addGlobalVehicle` |
| `AddGlobalObject` | `addGlobalObject` |
| `RemoveZone` | `removeZone` |

## Option keys

| qb-target | ox_target |
|---|---|
| `job` / `gang` | `groups` |
| `item` | `items` |
| `action` | `onSelect` |
| `type = 'server'` + `event` | `serverEvent` |
| `type = 'client'` + `event` | `event` |
| `targeticon` | `icon` |
| `options = { ... }` nested under `{ options = ..., distance = ... }` | options array passed directly; `distance` moves INTO each option |

## Shape change

qb-target wrapped options in an outer table with a shared `distance`. ox_target passes the array directly and puts `distance` on each option.

**qb-target:**

```lua
exports['qb-target']:AddBoxZone('shop', vec3(25.7, -1347.3, 29.5), 1.5, 1.5, {
    name = 'shop',
    heading = 0,
}, {
    options = {
        {
            type = 'server',
            event = 'shop:open',
            icon = 'fas fa-shopping-basket',
            label = 'Open shop',
            job = 'all',
        },
    },
    distance = 2.5,
})
```

**ox_target:**

```lua
exports.ox_target:addBoxZone({
    coords = vec3(25.7, -1347.3, 29.5),
    size = vec3(1.5, 1.5, 2),
    rotation = 0,
    options = {
        {
            name = 'shop_open',
            label = 'Open shop',
            icon = 'fas fa-shopping-basket',
            distance = 2.5,
            serverEvent = 'shop:open',
        },
    },
})
```

## Gotchas

- qb-target's `job = 'all'` has no equivalent: simply omit `groups`.
- qb-target sized boxes with `length`/`width` plus a separate `minZ`/`maxZ`; ox_target uses a single `size` vector3 where the third component is the height.
- qb-target's `AddCircleZone` used `useZ`; ox_target's sphere is always 3D.
- Add a `name` to every option. qb-target removed by label, ox_target removes by name.
