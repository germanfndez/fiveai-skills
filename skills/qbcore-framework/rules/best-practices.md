# QBCore Best Practices

Based on official QBCore documentation: https://docs.qbcore.org

## Naming Conventions

### camelCase for variables and functions

```lua
local myVariable = 10
local playerCount = 0

local function calculateDistance(pos1, pos2)
    return #(pos1 - pos2)
end
```

### Local over Global

Always prefer local variables — they're faster and prevent scope pollution.

```lua
-- GOOD
local playerPed = PlayerPedId()
local playerCoords = GetEntityCoords(playerPed)

-- BAD (global variables)
playerPed = PlayerPedId()
playerCoords = GetEntityCoords(playerPed)
```

## Caching

Cache frequently accessed values to improve performance.

```lua
-- GOOD: Cache once
local playerPed = PlayerPedId()
local QBCore = exports['qb-core']:GetCoreObject()

CreateThread(function()
    while isActive do
        local coords = GetEntityCoords(playerPed)
        -- Use cached values
        Wait(1000)
    end
end)

-- BAD: Call every iteration
CreateThread(function()
    while isActive do
        local coords = GetEntityCoords(PlayerPedId())
        Wait(1000)
    end
end)
```

## Dynamic Wait Times

Optimize loops with dynamic wait times based on conditions.

```lua
-- GOOD: Dynamic wait
CreateThread(function()
    while true do
        local sleep = 2500  -- Default wait time
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)
        local inRange = #(pos - vector3(-829.11, 75.03, 52.73)) < 10.0

        if inRange then
            sleep = 0  -- Check more frequently when in range
            print('I am in range!')
        else
            print('I am out of range.')
        end

        Wait(sleep)
    end
end)

-- BAD: Fixed wait regardless of state
CreateThread(function()
    while true do
        Wait(0)  -- Always runs every frame
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)
        local inRange = #(pos - vector3(-829.11, 75.03, 52.73)) < 10.0
        
        if inRange then
            print('I am in range!')
        end
    end
end)
```

## Avoid Infinite Loops

Include exit conditions in loops.

```lua
-- BAD: True infinite loop
CreateThread(function()
    while true do
        Wait(1000)
        -- Runs forever
    end
end)

-- GOOD: Conditional loop
local isActive = true

CreateThread(function()
    while isActive do
        Wait(1000)
        -- Can be stopped by setting isActive = false
    end
end)

-- Stop the loop when needed
RegisterNetEvent('myResource:stop', function()
    isActive = false
end)
```

## Table Optimization

### Reuse Tables

```lua
-- GOOD: Reuse table
local reusableTable = {}

local function someFunction()
    for i = 1, 10 do
        reusableTable[i] = i
    end
end

-- BAD: Create new table each time
local function someFunction()
    for i = 1, 10 do
        local newTable = {}
        newTable[i] = i
    end
end
```

### Efficient Table Insertion

```lua
-- GOOD: Direct assignment
local myTable = {}
myTable[#myTable + 1] = value

-- BAD: Function call overhead
local myTable = {}
table.insert(myTable, value)
```

## Network Optimization

### Send Only Necessary Data

```lua
-- GOOD: Only send what's needed
TriggerServerEvent('myResource:buyItem', itemName, amount)

-- BAD: Send entire table with unnecessary data
TriggerServerEvent('myResource:buyItem', {
    item = itemName,
    amount = amount,
    playerCoords = GetEntityCoords(PlayerPedId()),
    playerHealth = GetEntityHealth(PlayerPedId()),
    -- Unnecessary data
})
```

## State Management

### Use State Bags or Events (Not Both)

```lua
-- CLIENT - OPTION 1: State Bags (Recommended)
local isLoggedIn = false
local PlayerData = {}

AddStateBagChangeHandler('isLoggedIn', nil, function(_, _, value)
    if value then
        isLoggedIn = true
        PlayerData = QBCore.Functions.GetPlayerData()
    else
        isLoggedIn = false
        PlayerData = {}
    end
end)

-- CLIENT - OPTION 2: Events (Alternative)
local isLoggedIn = false
local PlayerData = {}

AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    isLoggedIn = true
    PlayerData = QBCore.Functions.GetPlayerData()
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    isLoggedIn = false
    PlayerData = {}
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function(val)
    PlayerData = val
end)

-- ⚠️ DON'T USE BOTH STATE BAGS AND EVENTS FOR THE SAME PURPOSE
```

## Security

### Never Trust Client Data

```lua
-- BAD: Client controls price
RegisterNetEvent('shop:buyItem', function(itemName, price)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    Player.Functions.RemoveMoney('cash', price) -- CLIENT CONTROLS PRICE!
end)

-- GOOD: Server validates price
RegisterNetEvent('shop:buyItem', function(itemName)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    
    local price = Config.Items[itemName].price -- Server controls price
    if Player.Functions.GetMoney('cash') >= price then
        Player.Functions.RemoveMoney('cash', price, 'bought-' .. itemName)
        Player.Functions.AddItem(itemName, 1)
    else
        TriggerClientEvent('QBCore:Notify', src, 'Not enough money', 'error')
    end
end)
```

### Validate Everything Server-Side

```lua
RegisterNetEvent('garage:takeVehicle', function(plate)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    
    -- Validate player owns this vehicle
    local result = MySQL.Sync.fetchScalar('SELECT 1 FROM player_vehicles WHERE plate = ? AND citizenid = ?', {
        plate,
        Player.PlayerData.citizenid
    })
    
    if result then
        -- Player owns vehicle, spawn it
        spawnVehicle(src, plate)
    else
        -- Cheater trying to spawn vehicle they don't own
        print(('Player %s tried to spawn vehicle %s they don\'t own'):format(src, plate))
    end
end)
```

## Error Handling

Always check for nil and handle errors.

```lua
-- GOOD
local Player = QBCore.Functions.GetPlayer(source)
if not Player then
    print('ERROR: Player not found for source:', source)
    return
end

local item = Player.Functions.GetItemByName('water_bottle')
if not item then
    print('Player does not have water bottle')
    return
end

if item.amount >= 1 then
    Player.Functions.RemoveItem('water_bottle', 1)
end
```

## Performance Measurement

Use `os.clock()` to measure code performance.

```lua
local start = os.clock()
-- Code to measure
expensiveFunction()
print('Execution time:', os.clock() - start, 'seconds')
```

## Folder Structure

Organize your resource properly:

```
my-resource/
├── fxmanifest.lua
├── config.lua
├── client/
│   ├── main.lua
│   └── utils.lua
├── server/
│   ├── main.lua
│   └── events.lua
└── shared/
    ├── config.lua
    └── functions.lua
```

## QBCore Specific Best Practices

1. **Cache QBCore object once**:
   ```lua
   -- Resource start
   local QBCore = exports['qb-core']:GetCoreObject()
   
   -- NOT in every function
   ```

2. **Check for Player before operations**:
   ```lua
   local Player = QBCore.Functions.GetPlayer(source)
   if not Player then return end
   ```

3. **Use callbacks for client-to-server data requests**:
   ```lua
   -- SERVER
   QBCore.Functions.CreateCallback('shop:canAfford', function(source, cb, itemName)
       local Player = QBCore.Functions.GetPlayer(source)
       if not Player then return cb(false) end
       
       local price = Config.Items[itemName].price
       cb(Player.Functions.GetMoney('cash') >= price)
   end)
   
   -- CLIENT
   QBCore.Functions.TriggerCallback('shop:canAfford', function(canAfford)
       if canAfford then
           -- Show buy menu
       end
   end, 'bread')
   ```

4. **Always provide reasons for money operations**:
   ```lua
   Player.Functions.AddMoney('cash', 500, 'mission-reward')
   Player.Functions.RemoveMoney('bank', 1000, 'bought-house')
   ```

5. **Cache Player object when using multiple times**:
   ```lua
   -- GOOD
   local Player = QBCore.Functions.GetPlayer(source)
   local money = Player.Functions.GetMoney('cash')
   local job = Player.PlayerData.job.name
   
   -- BAD (calls GetPlayer multiple times)
   local money = QBCore.Functions.GetPlayer(source).Functions.GetMoney('cash')
   local job = QBCore.Functions.GetPlayer(source).PlayerData.job.name
   ```

6. **Use GetPlayerData on client**:
   ```lua
   -- CLIENT
   local PlayerData = QBCore.Functions.GetPlayerData()
   local job = PlayerData.job.name
   
   -- Update when job changes
   RegisterNetEvent('QBCore:Client:OnJobUpdate', function(JobInfo)
       PlayerData.job = JobInfo
   end)
   ```

## Resource Optimization Checklist

- [ ] Use `local` for all variables unless they must be global
- [ ] Cache frequently accessed values (PlayerPedId, QBCore object, etc.)
- [ ] Use dynamic Wait times based on conditions
- [ ] Avoid infinite loops (add exit conditions)
- [ ] Minimize database queries (batch when possible)
- [ ] Don't create threads unnecessarily
- [ ] Validate all client data server-side
- [ ] Check for nil before using objects
- [ ] Use descriptive variable/function names
- [ ] Add comments for complex logic
- [ ] Send only necessary data in events
- [ ] Reuse tables instead of creating new ones
- [ ] Use direct table assignment over table.insert
- [ ] Profile code with os.clock() if performance is critical
