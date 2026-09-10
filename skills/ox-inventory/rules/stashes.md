# Stashes, shops and containers

## RegisterStash

```lua
exports.ox_inventory:RegisterStash(id, label, slots, maxWeight, owner, groups, coords)
```

Register on resource start, server-side. The stash persists in the database.

```lua
AddEventHandler('onResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then return end

    exports.ox_inventory:RegisterStash(
        'police_evidence',        -- id
        'Evidence Locker',        -- label
        50,                       -- slots
        100000,                   -- maxWeight in grams
        false,                    -- owner: false = shared by everyone
        { police = 0 },           -- groups allowed to open
        vec3(441.7, -981.2, 30.6) -- coords: must be nearby to open
    )
end)
```

`owner` controls sharing:

| `owner` | Behaviour |
|---|---|
| `false` or `nil` | One shared stash for everyone |
| `true` | A separate stash per player |
| an identifier string | Only that player |

## Opening a stash

Client side, usually from an ox_target option:

```lua
exports.ox_target:addBoxZone({
    coords = vec3(441.7, -981.2, 30.6),
    size = vec3(1.5, 1.5, 2),
    options = {
        {
            name = 'evidence_open',
            label = 'Evidence locker',
            icon = 'fas fa-box-archive',
            groups = { police = 0 },
            onSelect = function()
                exports.ox_inventory:openInventory('stash', { id = 'police_evidence' })
            end,
        },
    },
})
```

The `groups` on the stash is the real check. The target option only hides the prompt.

## CreateTemporaryStash

For loot bags and one-off containers that should not persist:

```lua
local stashId = exports.ox_inventory:CreateTemporaryStash({
    label = 'Duffel bag',
    slots = 10,
    maxWeight = 30000,
    items = { { 'money', 5000 }, { 'lockpick', 2 } },
})
```

## Vehicle storage

Trunk and glovebox are built in; key them by plate and net id:

```lua
exports.ox_inventory:openInventory('trunk', {
    id = GetVehicleNumberPlateText(vehicle),
    netid = NetworkGetNetworkIdFromEntity(vehicle),
})
```

## Cleaning up

Temporary stashes disappear on their own. Registered stashes persist: do not register the same id with different slot or weight values across restarts, or existing contents may not fit.
