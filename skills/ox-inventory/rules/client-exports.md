# Client exports

Read-only and UI. Never grant or remove items here — a cheater controls this side.

## Reading the player inventory

```lua
local items     = exports.ox_inventory:GetPlayerItems()
local weight    = exports.ox_inventory:GetPlayerWeight()
local maxWeight = exports.ox_inventory:GetPlayerMaxWeight()
local count     = exports.ox_inventory:GetItemCount(itemName, metadata, strict)
local slots     = exports.ox_inventory:Search('slots', 'water')
```

Use these to decide what the UI shows, never to authorise an action:

```lua
-- Fine: hide a target option the player cannot use
canInteract = function()
    return exports.ox_inventory:GetItemCount('lockpick') > 0
end
```

The server still has to re-check that item before doing anything.

## Current weapon

```lua
local weapon = exports.ox_inventory:getCurrentWeapon()
if weapon then print(weapon.name, weapon.metadata.durability) end
```

## Opening inventories

```lua
exports.ox_inventory:openInventory(invType, data)
```

`invType` is one of: `player`, `shop`, `stash`, `crafting`, `container`, `drop`, `glovebox`, `trunk`, `dumpster`.

```lua
exports.ox_inventory:openInventory('stash', { id = 'police_evidence' })
exports.ox_inventory:openInventory('trunk', { id = plate, netid = netId })
```

## Secondary inventory key

```lua
exports.ox_inventory:setStashTarget('police_evidence')
-- clear it when the player leaves the zone
exports.ox_inventory:setStashTarget(nil)
```

## Tooltip and slot use

```lua
exports.ox_inventory:displayMetadata('durability', 'Condition')
exports.ox_inventory:useSlot(slot)
```
