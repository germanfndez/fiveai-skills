# QBCore Player Methods (Server Only)

The Player object represents a player on the **SERVER** with many useful methods.

## Getting Player Object

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end
```

## Money Management

### Player.Functions.AddMoney(moneyType, amount, reason)

Adds money to player account.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.AddMoney('cash', 1000, 'reward-for-mission')
Player.Functions.AddMoney('bank', 5000, 'paycheck')
Player.Functions.AddMoney('crypto', 10, 'crypto-mining')
```

**Money Types**:
- `cash` — Physical money
- `bank` — Bank account
- `crypto` — Cryptocurrency

### Player.Functions.RemoveMoney(moneyType, amount, reason)

Removes money from player account.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

if Player.Functions.GetMoney('cash') >= 500 then
    Player.Functions.RemoveMoney('cash', 500, 'bought-item')
else
    -- Not enough money
end
```

### Player.Functions.SetMoney(moneyType, amount, reason)

Sets money to exact amount.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.SetMoney('bank', 10000, 'admin-action')
```

### Player.Functions.GetMoney(moneyType)

Gets money amount for specific type.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

local cash = Player.Functions.GetMoney('cash')
local bank = Player.Functions.GetMoney('bank')
print('Cash:', cash, 'Bank:', bank)
```

## Job Management

### Player.Functions.SetJob(job, grade)

Sets player's job.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.SetJob('police', 1)      -- Police Officer
Player.Functions.SetJob('mechanic', 3)    -- Mechanic Boss
Player.Functions.SetJob('unemployed', 0)  -- Unemployed
```

### Player.Functions.SetJobDuty(onDuty)

Sets player's duty status.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.SetJobDuty(true)   -- On duty
Player.Functions.SetJobDuty(false)  -- Off duty
```

## Gang Management

### Player.Functions.SetGang(gang, grade)

Sets player's gang.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.SetGang('ballas', 2)  -- Ballas gang, grade 2
Player.Functions.SetGang('none', 0)    -- No gang
```

## Metadata Management

### Player.Functions.SetMetaData(meta, val)

Sets specific metadata value.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.SetMetaData('hunger', 100)
Player.Functions.SetMetaData('thirst', 100)
Player.Functions.SetMetaData('stress', 0)
Player.Functions.SetMetaData('armor', 100)
Player.Functions.SetMetaData('isdead', false)
Player.Functions.SetMetaData('inlaststand', false)
Player.Functions.SetMetaData('ishandcuffed', false)
Player.Functions.SetMetaData('callsign', 'PD-123')
```

### Player.Functions.GetMetaData(meta)

Gets specific metadata value.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

local hunger = Player.Functions.GetMetaData('hunger')
local thirst = Player.Functions.GetMetaData('thirst')
print('Hunger:', hunger, 'Thirst:', thirst)
```

## Item Management (qb-inventory)

### Player.Functions.AddItem(item, amount, slot, info)

Adds item to player inventory.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

-- Simple add
Player.Functions.AddItem('water_bottle', 5)

-- Add with specific slot
Player.Functions.AddItem('water_bottle', 1, 5) -- Slot 5

-- Add with custom info/metadata
Player.Functions.AddItem('id_card', 1, nil, {
    citizenid = Player.PlayerData.citizenid,
    firstname = Player.PlayerData.charinfo.firstname,
    lastname = Player.PlayerData.charinfo.lastname,
    birthdate = Player.PlayerData.charinfo.birthdate,
    gender = Player.PlayerData.charinfo.gender
})

-- Vehicle key example
Player.Functions.AddItem('vehiclekeys', 1, nil, {
    plate = 'ABC123'
})
```

### Player.Functions.RemoveItem(item, amount, slot)

Removes item from player inventory.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

-- Remove by item name
Player.Functions.RemoveItem('water_bottle', 1)

-- Remove from specific slot
Player.Functions.RemoveItem('water_bottle', 1, 5)
```

### Player.Functions.GetItemByName(item)

Gets item data by name.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

local item = Player.Functions.GetItemByName('water_bottle')
if item then
    print('Has water bottles:', item.amount)
    print('Item info:', json.encode(item.info))
end
```

### Player.Functions.GetItemBySlot(slot)

Gets item data from specific slot.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

local item = Player.Functions.GetItemBySlot(1) -- Check slot 1
if item then
    print('Slot 1 contains:', item.name, 'Amount:', item.amount)
end
```

### Player.Functions.GetItemsByName(item)

Gets all matching items (if item is split across slots).

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

local items = Player.Functions.GetItemsByName('water_bottle')
for slot, item in pairs(items) do
    print('Slot', slot, ':', item.amount, 'water bottles')
end
```

### Player.Functions.ClearInventory()

Clears entire player inventory.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.ClearInventory()
```

## Character Information

### Player.Functions.SetCreditCard(cardNumber)

Sets player's credit card number.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

local cardNumber = "4111111111111111"
Player.Functions.SetCreditCard(cardNumber)
```

### Player.Functions.GetCardSlot(cardNumber, cardType)

Gets slot of specific card.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

local slot = Player.Functions.GetCardSlot(cardNumber, 'visa')
```

## Position & State

### Player.Functions.Save()

Manually saves player data to database.

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.Save()
```

### Player.Functions.Logout()

Logs player out (triggers unload).

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

Player.Functions.Logout()
```

## Accessing Player Data

All PlayerData is accessible via `Player.PlayerData`:

```lua
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

-- Character info
local citizenid = Player.PlayerData.citizenid
local firstname = Player.PlayerData.charinfo.firstname
local lastname = Player.PlayerData.charinfo.lastname
local phone = Player.PlayerData.charinfo.phone
local birthdate = Player.PlayerData.charinfo.birthdate
local gender = Player.PlayerData.charinfo.gender -- 0 = male, 1 = female

-- Job info
local jobName = Player.PlayerData.job.name
local jobLabel = Player.PlayerData.job.label
local jobGrade = Player.PlayerData.job.grade.level
local jobPayment = Player.PlayerData.job.payment
local onDuty = Player.PlayerData.job.onduty
local isBoss = Player.PlayerData.job.isboss

-- Gang info
local gangName = Player.PlayerData.gang.name
local gangLabel = Player.PlayerData.gang.label
local gangGrade = Player.PlayerData.gang.grade.level
local gangBoss = Player.PlayerData.gang.isboss

-- Money
local cash = Player.PlayerData.money.cash
local bank = Player.PlayerData.money.bank
local crypto = Player.PlayerData.money.crypto

-- Metadata
local hunger = Player.PlayerData.metadata.hunger
local thirst = Player.PlayerData.metadata.thirst
local stress = Player.PlayerData.metadata.stress
local armor = Player.PlayerData.metadata.armor
local isDead = Player.PlayerData.metadata.isdead
local isHandcuffed = Player.PlayerData.metadata.ishandcuffed
local callsign = Player.PlayerData.metadata.callsign
local bloodtype = Player.PlayerData.metadata.bloodtype

-- Other
local source = Player.PlayerData.source
local license = Player.PlayerData.license
local name = Player.PlayerData.name
local cid = Player.PlayerData.cid
```

## Best Practices

1. **Always check if Player exists**:
   ```lua
   local Player = QBCore.Functions.GetPlayer(source)
   if not Player then return end
   ```

2. **Check before removing money**:
   ```lua
   if Player.Functions.GetMoney('cash') >= price then
       Player.Functions.RemoveMoney('cash', price, 'bought-item')
   else
       TriggerClientEvent('QBCore:Notify', source, 'Not enough money', 'error')
   end
   ```

3. **Always provide reasons for money operations**:
   ```lua
   -- GOOD
   Player.Functions.AddMoney('cash', 500, 'mission-reward')
   
   -- BAD (no reason, harder to debug/log)
   Player.Functions.AddMoney('cash', 500)
   ```

4. **Check if item exists before operations**:
   ```lua
   local hasItem = Player.Functions.GetItemByName('water_bottle')
   if hasItem then
       Player.Functions.RemoveItem('water_bottle', 1)
   end
   ```

5. **Cache Player object**:
   ```lua
   -- GOOD
   local Player = QBCore.Functions.GetPlayer(source)
   Player.Functions.AddMoney('cash', 100)
   Player.Functions.SetJob('police', 1)
   
   -- BAD (calls GetPlayer twice)
   QBCore.Functions.GetPlayer(source).Functions.AddMoney('cash', 100)
   QBCore.Functions.GetPlayer(source).Functions.SetJob('police', 1)
   ```

6. **Use appropriate money type**:
   ```lua
   -- Mission rewards → cash
   Player.Functions.AddMoney('cash', 500, 'mission-complete')
   
   -- Paychecks → bank
   Player.Functions.AddMoney('bank', 2000, 'paycheck')
   
   -- Mining/crypto → crypto
   Player.Functions.AddMoney('crypto', 5, 'crypto-mining')
   ```
