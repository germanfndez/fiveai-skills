# Zones

Use a zone when the interaction belongs to a PLACE, not to an entity. Zone functions return an id; keep it to remove the zone later.

Zone data fields are the ox_lib zone fields, because ox_target delegates to `lib.zones.*` internally. `options` is the ox_target addition.

## addBoxZone

```lua
local zoneId = exports.ox_target:addBoxZone({
    coords = vec3(441.7, -981.2, 30.6),
    size = vec3(2, 2, 3),      -- default vec3(2, 2, 2)
    rotation = 45,             -- degrees, default 0
    debug = false,
    drawSprite = true,
    options = {
        {
            name = 'police_armoury',
            label = 'Open armoury',
            icon = 'fas fa-gun',
            groups = { police = 0 },
            serverEvent = 'police:openArmoury',
        },
    },
})
```

## addSphereZone

```lua
local zoneId = exports.ox_target:addSphereZone({
    coords = vec3(441.7, -981.2, 30.6),
    radius = 1.5,
    debug = false,
    options = { { name = 'bell', label = 'Ring the bell', onSelect = ringBell } },
})
```

## addPolyZone

`points` is an array of `vector3`; `thickness` is the height (default `4`).

```lua
local zoneId = exports.ox_target:addPolyZone({
    points = {
        vec3(413.8, -1026.1, 29.0),
        vec3(411.6, -1023.1, 29.0),
        vec3(412.2, -1018.0, 29.0),
        vec3(416.5, -1019.2, 29.0),
    },
    thickness = 3,
    debug = false,
    options = { { name = 'evidence', label = 'Search area', serverEvent = 'police:search' } },
})
```

## Removing and checking

```lua
exports.ox_target:removeZone(zoneId)
exports.ox_target:removeZone(zoneId, true)  -- suppress the not-found warning
local exists = exports.ox_target:zoneExists(zoneId)
```

Always remove your zones on resource stop, otherwise they survive a restart:

```lua
AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    exports.ox_target:removeZone(zoneId, true)
end)
```

## Debugging

Set `debug = true` on the zone, or `setr ox_target:debug true` in `server.cfg`, to draw the outline in-game. Turn it off before release: debug zones render every frame.
