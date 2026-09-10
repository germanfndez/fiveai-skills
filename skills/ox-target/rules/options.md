# Target option fields

Every `add*` function takes an array of option tables. Only `label` is effectively required; add `name` whenever you plan to remove the option later.

| Field | Type | Meaning |
|---|---|---|
| `label` | `string` | Text shown in the eye menu |
| `name` | `string` | Identifier used when removing the option |
| `icon` | `string` | Font Awesome 6 icon name, e.g. `fas fa-door-open` |
| `iconColor` | `string` | Icon color |
| `distance` | `number` | Max distance at which the option shows |
| `bones` | `string` or `string[]` | Restrict to a bone or bones (vehicles) |
| `offset` | `vector3` | Offset the targetable area, relative to model dimensions |
| `offsetAbsolute` | `vector3` | Offset relative to the entity world coords |
| `offsetSize` | `number` | Radius of the offset targetable area |
| `groups` | `string`, `string[]`, `table` | Group, groups, or group-grade pairs required to show |
| `items` | `string`, `string[]`, `table` | Item, items, or item-count pairs required to show |
| `anyItem` | `boolean` | Require only one item from `items` instead of all |
| `canInteract` | `function(entity, distance, coords, name, bone)` | Return `true` to show the option |
| `menuName` | `string` | Only shown while that menu is open |
| `openMenu` | `string` | Selecting this sets the current menu name |
| `onSelect` | `function(data)` | Client callback on selection |
| `export` | `string` | Export to call on selection |
| `event` | `string` | Client event to trigger |
| `serverEvent` | `string` | Server event to trigger |
| `command` | `string` | Console command to run |

## Gating: prefer the declarative fields

**Bad** — the option is visible to everyone and fails after the click:

```lua
onSelect = function()
    if not isPolice() then return lib.notify({ description = 'Not police' }) end
    TriggerServerEvent('evidence:collect')
end
```

**Good** — the option never appears:

```lua
{
    name = 'evidence_collect',
    label = 'Collect evidence',
    icon = 'fas fa-magnifying-glass',
    groups = { police = 2 },
    serverEvent = 'evidence:collect',
}
```

## onSelect data

`onSelect` receives one table:

```lua
onSelect = function(data)
    -- data.entity   number  the targeted entity handle
    -- data.coords   vector3 hit coords
    -- data.distance number
    -- data.zone     number  zone id, when the target is a zone
    print(data.entity, data.distance)
end
```

## Server-side validation is mandatory

`onSelect`, `event` and `command` run on the client. A cheater can trigger `serverEvent` directly with any payload. Re-check distance, job and items in the server handler:

```lua
RegisterNetEvent('evidence:collect', function()
    local src = source
    local ped = GetPlayerPed(src)
    if #(GetEntityCoords(ped) - vec3(441.7, -981.2, 30.6)) > 3.0 then return end
    -- grant reward
end)
```
