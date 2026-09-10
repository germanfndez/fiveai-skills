# Hooks

Hooks let you observe or CANCEL an inventory action instead of polling. Server-side.

## registerHook

```lua
local hookId = exports.ox_inventory:registerHook(event, callback, options)
```

Returns a hook id. Returning `false` from the callback CANCELS the action and stops further hooks for that event.

```lua
local hookId = exports.ox_inventory:registerHook('swapItems', function(payload)
    -- payload carries the source, the item, and the source/target inventories
    if payload.fromInventory == 'police_evidence' and not isOnDuty(payload.source) then
        return false  -- block the move
    end
end, {
    itemFilter = { evidence_bag = true },
})
```

## Options

| Option | Effect |
|---|---|
| `print` | Log every time the hook runs |
| `itemFilter` | Table of item names; the hook only runs for those items |
| `inventoryFilter` | Array of patterns matched against the inventory ids |
| `typeFilter` | Table keyed by inventory type |

Filters run before your callback, so a narrow filter is much cheaper than an early `return` inside the callback.

## Removing hooks

Hooks registered by a resource are cleared when that resource stops. Remove one explicitly with its id:

```lua
exports.ox_inventory:removeHooks(hookId)
```

Calling `removeHooks()` with no argument clears every hook owned by the calling resource.

## When not to use a hook

A hook runs inside the inventory action and delays it. Do not put HTTP calls, long database work, or `Wait` inside a hook. Record what you need and process it afterwards.

For the current list of hook event names and their exact payload fields, check the upstream docs: https://overextended.dev/ox_inventory
