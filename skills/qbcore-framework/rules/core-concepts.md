# QBCore Core Concepts

## Framework Architecture

QBCore is a **comprehensive framework** that provides:
- Player management and character system
- Job and gang systems
- Economy with multiple account types
- Inventory and vehicle management
- Extensive UI components
- Database integration (oxmysql)

## Getting QBCore Object

### Client Side

```lua
-- Local scope (recommended)
local QBCore = exports['qb-core']:GetCoreObject()

-- Global scope (in early-loaded file)
QBCore = exports['qb-core']:GetCoreObject()

-- Wait for core to be ready
CreateThread(function()
    while not QBCore do
        Wait(100)
    end
    
    -- QBCore is now available
    print('QBCore loaded')
end)
```

### Server Side

```lua
-- QBCore is immediately available on server
local QBCore = exports['qb-core']:GetCoreObject()

-- Or global in early-loaded file
QBCore = exports['qb-core']:GetCoreObject()
```

## PlayerData Structure

**Available on CLIENT via `QBCore.PlayerData`**:

```lua
QBCore.PlayerData = {
    citizenid = "ABC12345",           -- Unique citizen ID
    cid = 1,                          -- Character ID
    license = "license:abc...",       -- Rockstar license
    name = "John Doe",                -- Steam/FiveM name
    money = {                         -- Money accounts
        cash = 5000,
        bank = 25000,
        crypto = 0
    },
    charinfo = {                      -- Character information
        firstname = "John",
        lastname = "Doe",
        birthdate = "1990-01-01",
        gender = 0,                    -- 0 = male, 1 = female
        nationality = "American",
        phone = "555-1234",
        account = "US01QBUS00000000000"
    },
    job = {                           -- Job data
        name = "police",
        label = "Law Enforcement",
        payment = 150,
        onduty = true,
        isboss = false,
        grade = {
            name = "officer",
            level = 1
        }
    },
    gang = {                          -- Gang data
        name = "none",
        label = "No Gang",
        isboss = false,
        grade = {
            name = "none",
            level = 0
        }
    },
    metadata = {                      -- Player metadata
        hunger = 100,
        thirst = 100,
        stress = 0,
        armor = 0,
        health = 200,
        inside = {
            house = nil,
            apartment = {}
        },
        isdead = false,
        inlaststand = false,
        ishandcuffed = false,
        tracker = false,
        injail = 0,
        jailitems = {},
        status = {},
        phone = {},
        fitbit = {},
        commandbinds = {},
        bloodtype = "A+",
        dealerrep = 0,
        craftingrep = 0,
        attachmentcraftingrep = 0,
        currentapartment = nil,
        jobrep = {
            tow = 0,
            trucker = 0,
            taxi = 0,
            hotdog = 0
        },
        callsign = "NO CALLSIGN",
        fingerprint = "XX123456789",
        walletid = "QB-12345678",
        phonedata = {
            SerialNumber = "1234567890",
            InstalledApps = {}
        }
    },
    position = {                      -- Player position
        x = 0.0,
        y = 0.0,
        z = 0.0,
        heading = 0.0
    },
    items = {}                        -- Player inventory (if using qb-inventory)
}
```

## Player Object (Server)

**Available on SERVER only** — represents a player with data and methods:

### Getting Player Object

```lua
-- By source (server ID)
local Player = QBCore.Functions.GetPlayer(source)
if not Player then return end

-- By citizenid
local Player = QBCore.Functions.GetPlayerByCitizenId(citizenid)

-- By phone number
local Player = QBCore.Functions.GetPlayerByPhone(phone)
```

### Player object contains PlayerData plus methods:

```lua
Player.PlayerData = {
    -- Same structure as client PlayerData
    citizenid = "...",
    cid = 1,
    source = 1,
    license = "...",
    name = "...",
    money = {},
    charinfo = {},
    job = {},
    gang = {},
    metadata = {},
    position = {},
    items = {}
}

-- Plus many methods (see player-methods.md)
Player.Functions.AddMoney(type, amount, reason)
Player.Functions.RemoveMoney(type, amount, reason)
Player.Functions.SetJob(job, grade)
Player.Functions.AddItem(item, amount, slot, info)
-- ... and many more
```

## Framework Initialization

### Client Startup Flow

1. QBCore object becomes available
2. Player connects to server
3. Player selects character
4. Server sends PlayerData to client
5. `QBCore:Client:OnPlayerLoaded` event fires
6. `QBCore.PlayerData` is populated
7. Resources can now access player data

### Server Startup Flow

1. QBCore loads from database
2. Jobs and gangs are loaded
3. Items are registered
4. Resources can now use QBCore

## Important Events

### Client Events

```lua
-- Player loaded (character selected)
RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    local PlayerData = QBCore.Functions.GetPlayerData()
    print('Player loaded:', PlayerData.charinfo.firstname)
end)

-- Player unloaded (logout/character switch)
RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    print('Player logged out')
end)

-- Job updated
RegisterNetEvent('QBCore:Client:OnJobUpdate', function(JobInfo)
    print('Job changed:', JobInfo.name)
end)

-- Gang updated
RegisterNetEvent('QBCore:Client:OnGangUpdate', function(GangInfo)
    print('Gang changed:', GangInfo.name)
end)

-- Money updated
RegisterNetEvent('QBCore:Client:OnMoneyChange', function(moneyType, amount, operation)
    print('Money changed:', moneyType, amount, operation)
end)

-- Player data updated
RegisterNetEvent('QBCore:Player:SetPlayerData', function(val)
    QBCore.PlayerData = val
end)
```

### Server Events

```lua
-- Player loaded (character selected)
RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    print('Player loaded:', Player.PlayerData.citizenid)
end)

-- Player unloaded
RegisterNetEvent('QBCore:Server:OnPlayerUnload', function()
    local src = source
    print('Player unloaded:', src)
end)

-- Job updated (server-side)
RegisterNetEvent('QBCore:Server:OnJobUpdate', function(source, job)
    print('Player job updated:', source, job.name)
end)

-- Gang updated (server-side)
RegisterNetEvent('QBCore:Server:OnGangUpdate', function(source, gang)
    print('Player gang updated:', source, gang.name)
end)
```

## State Management

### Using State Bags (Recommended)

```lua
-- CLIENT
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
```

### Using Events (Alternative)

```lua
-- CLIENT
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
```

**⚠️ NOTE**: Don't use both state bags AND events for the same purpose!

## Configuration

QBCore uses a centralized config in `qb-core/config.lua`:

```lua
QBCore.Config = {
    MaxPlayers = GetConvarInt('sv_maxclients', 48),
    DefaultSpawn = vector4(-1035.71, -2731.87, 12.86, 0.0),
    Money = {
        MoneyTypes = {'cash', 'bank', 'crypto'},
        DontAllowMinus = {'cash', 'crypto'},
        PayCheckTimeOut = 10,
        PayCheckSociety = false
    },
    Player = {
        HungerRate = 4.2,
        ThirstRate = 3.8,
        Bloodtypes = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
    }
}
```

## Folder Structure

Recommended QBCore resource structure:

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

## Best Practices

1. **Always wait for QBCore on client**:
   ```lua
   CreateThread(function()
       while not QBCore do Wait(100) end
       -- Safe to use QBCore
   end)
   ```

2. **Check for nil on server**:
   ```lua
   local Player = QBCore.Functions.GetPlayer(source)
   if not Player then return end
   ```

3. **Cache QBCore object once**:
   ```lua
   -- At resource start
   local QBCore = exports['qb-core']:GetCoreObject()
   
   -- NOT in every function
   ```

4. **Use proper player retrieval**:
   ```lua
   -- By source
   local Player = QBCore.Functions.GetPlayer(source)
   
   -- By citizenid
   local Player = QBCore.Functions.GetPlayerByCitizenId(citizenid)
   ```

5. **Access PlayerData correctly**:
   ```lua
   -- CLIENT
   local job = QBCore.PlayerData.job.name
   
   -- SERVER
   local Player = QBCore.Functions.GetPlayer(source)
   local job = Player.PlayerData.job.name
   ```
