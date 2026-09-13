# Net Game Events (Server-Side Interception)

Most real cheat menus do not call your resource's net events at all. They fire **native GTA network game events**: dealing damage, spawning projectiles, stripping weapons, giving weapons. The server receives these as ordinary events and can inspect and **cancel** them.

This is the highest-value anti-cheat surface in FiveM and it costs nothing to add.

## Handler Shape

```lua
-- SERVER
AddEventHandler('weaponDamageEvent', function(sender, data)
    -- sender is the player source that emitted the event
    if data.overrideDefaultDamage then
        print(('[AC] %s (%s) sent overrideDefaultDamage'):format(GetPlayerName(sender), sender))
        CancelEvent()
        return
    end
end)
```

Key facts:

- `sender` is the **player source** of the client that emitted the event. Use it with `GetPlayerName`, `GetPlayerPed`, `DropPlayer`, etc.
- `CancelEvent()` stops the event from being routed to other clients. It does **not** stop other handlers on the server from running for the same event, so always `return` after cancelling and never assume yours is the only handler.
- These are `AddEventHandler`, not `RegisterNetEvent`. They are engine events, not resource events; do not register them as net events.

## Verified Payload Fields

Only the fields below are documented. Do not invent others.

### `weaponDamageEvent(sender, data)`

`actionResultId`, `actionResultName`, `damageFlags`, `damageTime`, `damageType`, `hasActionResult`, `hasImpactDir`, `hasVehicleData`, `hitComponent`, `hitEntityWeapon`, `hitGlobalId`, `hitGlobalIds`, `hitWeaponAmmoAttachment`, `impactDirX`, `impactDirY`, `impactDirZ`, `isNetTargetPos`, `localPosX`, `localPosY`, `localPosZ`, `overrideDefaultDamage`, `parentGlobalId`, `silenced`, `suspensionIndex`, `tyreIndex`, `weaponDamage`, `weaponType`, `willKill`

### `startProjectileEvent(sender, data)`

`commandFireSingleBullet`, `effectGroup`, `firePositionX`, `firePositionY`, `firePositionZ`, `initialPositionX`, `initialPositionY`, `initialPositionZ`, `ownerId`, `projectileHash`, `targetEntity`, `throwTaskSequence`, `weaponHash`

### `removeAllWeaponsEvent(sender, data)`

`pedId`

### `ptFxEvent(sender, data)`

`assetHash`, `axisBitset`, `effectHash`, `entityNetId`, `isOnEntity`, `offsetX`, `offsetY`, `offsetZ`, `posX`, `posY`, `posZ`, `rotX`, `rotY`, `rotZ`, `scale`

## Other Events That Exist

These names are confirmed in the `GTA_EVENT_IDS` enum, but their payload fields are not listed here. Check the upstream docs before reading any field from them:

| Enum | Event name |
|---|---|
| `EXPLOSION_EVENT` | `explosionEvent` |
| `GIVE_WEAPON_EVENT` | `giveWeaponEvent` |
| `CLEAR_PED_TASKS_EVENT` | `clearPedTasksEvent` |

## Realistic Filter

```lua
-- SERVER
local MAX_LEGIT_DAMAGE = 250.0

-- Weapons your server never expects to see a kill from.
local BANNED_WEAPON_TYPES = {
    [`WEAPON_RAILGUN`] = true,
    [`WEAPON_RPG`] = true,
    [`WEAPON_MINIGUN`] = true,
}

AddEventHandler('weaponDamageEvent', function(sender, data)
    local name = GetPlayerName(sender) or 'unknown'

    -- 1. The client must never define the damage value itself.
    if data.overrideDefaultDamage then
        print(('[AC] %s: overrideDefaultDamage set'):format(name))
        CancelEvent()
        return
    end

    -- 2. Absurd damage numbers are always a modified client.
    if type(data.weaponDamage) == 'number' and data.weaponDamage > MAX_LEGIT_DAMAGE then
        print(('[AC] %s: weaponDamage=%s'):format(name, data.weaponDamage))
        CancelEvent()
        return
    end

    -- 3. A lethal hit from a weapon the server never hands out.
    if data.willKill and BANNED_WEAPON_TYPES[data.weaponType] then
        print(('[AC] %s: willKill with weaponType=%s'):format(name, data.weaponType))
        CancelEvent()
        return
    end
end)
```

`removeAllWeaponsEvent` is worth cancelling outright on most servers, since a legitimate client rarely emits it:

```lua
AddEventHandler('removeAllWeaponsEvent', function(sender, data)
    print(('[AC] %s emitted removeAllWeaponsEvent on ped %s'):format(GetPlayerName(sender), data.pedId))
    CancelEvent()
end)
```

## Rules

1. Log before cancelling. A silent cancel gives admins nothing to act on.
2. Never kick or ban directly from a single event. Count offences per source and act on a threshold; false positives from latency and desync are real.
3. Validate types before comparing. A spoofed payload can send a string where you expect a number.
4. Filtering game events is a complement to, not a replacement for, validating your own net events.

Source: https://docs.fivem.net/docs/scripting-reference/events/server-events/
