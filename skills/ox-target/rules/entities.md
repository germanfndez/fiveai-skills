# Entity, model and global targets

All of these are client-side. Every `add*` has a matching `remove*`.

## addLocalEntity — entities you spawned

Use for props, peds and vehicles created by your own resource. Accepts one handle or an array.

```lua
local ped = CreatePed(0, `s_m_m_doctor_01`, 300.2, -600.5, 43.2, 0.0, false, true)

exports.ox_target:addLocalEntity(ped, {
    {
        name = 'clinic_heal',
        label = 'Request treatment',
        icon = 'fas fa-kit-medical',
        distance = 2.0,
        serverEvent = 'clinic:heal',
    },
})

-- later
exports.ox_target:removeLocalEntity(ped, 'clinic_heal')
```

## addEntity — networked entities

Takes NETWORK ids, not local handles. The id changes when the entity is recreated, so re-register on respawn.

```lua
local netId = NetworkGetNetworkIdFromEntity(vehicle)
exports.ox_target:addEntity(netId, options)
exports.ox_target:removeEntity(netId, 'option_name')
```

## addModel — every instance of a model

Best choice for map props: it covers instances that stream in later without you tracking handles.

```lua
exports.ox_target:addModel({ `prop_atm_01`, `prop_atm_02`, `prop_fleeca_atm` }, {
    {
        name = 'atm_use',
        label = 'Use ATM',
        icon = 'fas fa-credit-card',
        distance = 1.5,
        onSelect = function()
            TriggerEvent('banking:openAtm')
        end,
    },
})

exports.ox_target:removeModel(`prop_atm_01`, 'atm_use')
```

## Global targets

Apply to every entity of a class. Keep these few: they are evaluated for every target scan.

```lua
exports.ox_target:addGlobalPed(options)
exports.ox_target:addGlobalVehicle(options)
exports.ox_target:addGlobalObject(options)
exports.ox_target:addGlobalPlayer(options)
exports.ox_target:addGlobalOption(options)   -- everything, no filter
```

Remove with the matching `removeGlobalPed` / `removeGlobalVehicle` / `removeGlobalObject` / `removeGlobalPlayer` / `removeGlobalOption`, passing the option name.

Vehicle example restricted to a bone:

```lua
exports.ox_target:addGlobalVehicle({
    {
        name = 'vehicle_trunk',
        label = 'Open trunk',
        icon = 'fas fa-box-open',
        bones = { 'boot' },
        distance = 2.0,
        canInteract = function(entity)
            return GetVehicleDoorLockStatus(entity) ~= 2
        end,
        onSelect = function(data)
            exports.ox_inventory:openInventory('trunk', { id = data.entity })
        end,
    },
})
```

## Utility

```lua
exports.ox_target:disableTargeting(true)   -- suppress during cutscenes or menus
local active = exports.ox_target:isActive() -- is the eye currently open
```
