# Server exports

All mutation happens here. `inv` accepts a player source, an identifier, or a stash id.

## AddItem

```lua
exports.ox_inventory:AddItem(inv, item, count, metadata, slot, cb)
```

Returns `success, response`. ALWAYS check it — the add fails when the inventory is full or over weight.

```lua
local success, response = exports.ox_inventory:AddItem(source, 'water', 1)

if not success then
    -- response explains why: 'inventory_full', 'invalid_item', ...
    return lib.notify(source, { type = 'error', description = 'No room' })
end
```

## RemoveItem

```lua
exports.ox_inventory:RemoveItem(inv, item, count, metadata, slot, ignoreTotal, strict)
```

Returns `success, response`.

```lua
if not exports.ox_inventory:RemoveItem(source, 'lockpick', 1) then return end
```

## CanCarryItem

```lua
local canCarry = exports.ox_inventory:CanCarryItem(inv, item, count, metadata)
```

Check BEFORE removing payment. The correct order for a purchase:

```lua
RegisterNetEvent('shop:buy', function(item, count)
    local src = source
    count = tonumber(count)
    if type(item) ~= 'string' or not count or count < 1 then return end

    local price = PRICES[item]
    if not price then return end

    if not exports.ox_inventory:CanCarryItem(src, item, count) then
        return lib.notify(src, { type = 'error', description = 'Not enough space' })
    end

    if not exports.ox_inventory:RemoveItem(src, 'money', price * count) then
        return lib.notify(src, { type = 'error', description = 'Not enough money' })
    end

    exports.ox_inventory:AddItem(src, item, count)
end)
```

## GetItem / GetItemCount

```lua
local item  = exports.ox_inventory:GetItem(inv, item, metadata, returnsCount)
local count = exports.ox_inventory:GetItemCount(inv, itemName, metadata, strict)
```

`strict = true` requires the metadata to match exactly rather than partially.

## GetSlot / SetMetadata

```lua
local slotData = exports.ox_inventory:GetSlot(inv, slot)
exports.ox_inventory:SetMetadata(inv, slot, metadata)
```

`SetMetadata` REPLACES the table. Read, mutate, write back:

```lua
local slot = exports.ox_inventory:GetSlot(source, 3)
if slot then
    slot.metadata.durability = (slot.metadata.durability or 100) - 10
    exports.ox_inventory:SetMetadata(source, 3, slot.metadata)
end
```

## Search

```lua
local slots = exports.ox_inventory:Search(inv, 'slots', 'water')
local count = exports.ox_inventory:Search(inv, 'count', { 'water', 'bread' })
```

## GetInventoryItems / ConfiscateInventory

```lua
local items = exports.ox_inventory:GetInventoryItems(inv, owner)
exports.ox_inventory:ConfiscateInventory(source)  -- clears and stores for later return
```
