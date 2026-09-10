# Defining items

Items live in `data/items.lua`, keyed by item name. An item that is not defined here cannot be added: `AddItem` fails and returns `invalid_item`.

## Fields

| Field | Type | Meaning |
|---|---|---|
| `label` | `string` | Display name |
| `weight` | `number` | Weight per unit |
| `stack` | `boolean` | Can stack in one slot (default `true`) |
| `close` | `boolean` | Close the inventory on use |
| `degrade` | `number` | Minutes until fully degraded |
| `decay` | `boolean` | Delete the item when durability hits 0 |
| `consume` | `number` | Count removed per use (default `1`) |
| `allowArmed` | `boolean` | Allow use while holding a weapon |
| `description` | `string` | Tooltip text |
| `client` | `table` | `export`, `event`, `status`, `anim`, `prop`, `disable`, `usetime`, `cancel`, `add`, `remove` |
| `server` | `table` | `export`, `event` |
| `buttons` | `table` | Extra context buttons: `label` plus `action` callback |

## Consumable example

```lua
['burger'] = {
    label = 'Burger',
    weight = 220,
    stack = true,
    close = true,
    client = {
        status = { hunger = 200000 },
        anim = { dict = 'mp_player_inteat@burger', clip = 'mp_player_int_eat_burger_fp' },
        prop = {
            model = 'prop_cs_burger_01',
            pos = { x = 0.02, y = 0.02, z = -0.02 },
            rot = { x = 0.0, y = 0.0, z = 0.0 },
        },
        usetime = 2500,
    },
},
```

## Item with server logic

Use `server.export` so the effect cannot be triggered by the client:

```lua
['lockpick'] = {
    label = 'Lockpick',
    weight = 160,
    stack = true,
    close = true,
    degrade = 60,
    server = {
        export = 'myresource.useLockpick',
    },
},
```

```lua
-- server/main.lua
exports('useLockpick', function(event, item, inventory, slot, data)
    if event ~= 'usingItem' then return end
    -- return false to cancel the use
end)
```

## Unique items via metadata

An item with differing metadata does not stack, which is how you get serial numbers or durability:

```lua
exports.ox_inventory:AddItem(source, 'phone', 1, {
    serial = GenerateSerial(),
    registered = os.time(),
})
```

Keep metadata small and stable. Volatile values (positions, timers) create a new stack on every write and will flood the player's slots.

## Buttons

```lua
['contract'] = {
    label = 'Contract',
    weight = 10,
    stack = false,
    buttons = {
        {
            label = 'Read',
            action = function(slot)
                local item = exports.ox_inventory:GetSlot(cache.serverId, slot)
                lib.alertDialog({ header = 'Contract', content = item.metadata.text })
            end,
        },
    },
},
```
