# Events (Lua)

Events are the main way to communicate between client and server (or within the same side).

## Register and listen

```lua
RegisterNetEvent('myresource:client:itemReceived')
AddEventHandler('myresource:client:itemReceived', function(itemId, amount)
  -- handle on client
end)
```

- **RegisterNetEvent** — Registers a **networked** event (can be triggered from the other side).
- **AddEventHandler** — Attaches the handler. Use the same event name.

For **local-only** events (same side), use `AddEventHandler` only; no need for `RegisterNetEvent`.

## Triggering

| Function | Direction | Example |
|----------|-----------|--------|
| **TriggerServerEvent**(event, ...) | Client → Server | `TriggerServerEvent('myres:server:buyItem', itemId)` |
| **TriggerClientEvent**(event, playerId, ...) | Server → Client | `TriggerClientEvent('myres:client:notify', source, 'Done!')` |
| **TriggerEvent**(event, ...) | Local only (same side) | `TriggerEvent('myres:client:closeMenu')` |

- On server, use **source** for the player who triggered the event.
- Use **-1** as playerId in `TriggerClientEvent` to send to all clients.

## Naming conventions

Event names should follow the format: `{resourceName}:{client/server}:{eventName}`

This allows the reader to tell at a glance what resource the event is triggered from, and whether the event should be handled on the client or server.

### Past Tense

An event should describe something that has already happened, without prescribing the desired reaction. This pattern recognizes that many event handlers may exist for the same event, which each handle the event in a different way. Triggering an event should be thought of as the cause, whereas handling an event is the effect. The effect should not be in the event name. While an event name need not strictly be past tense, writing event names using past tense can help developers follow this principle.

**BAD:**
```lua
local function sendMessage(message)
    TriggerEvent('resourceName:server:checkProfanity', message)
end

RegisterNetEvent('resourceName:server:checkProfanity', function(message)
    checkProfanity(message)
end)
```

**GOOD:**
```lua
local function sendMessage(message)
    TriggerEvent('resourceName:server:sentMessage', message)
end

RegisterNetEvent('resourceName:server:sentMessage', function(message)
    checkProfanity(message)
end)
```

## When to use events vs functions

### Use a function instead of an event handler for single resource, non-networked events

Events differ from functions in that one event can have many handler functions, versus a function call only executes one function. If the event is non-networked and only is intended to be handled by one resource, a function should be used instead.

### Use callbacks when wanting to get data back across the network

It's an anti-pattern to trigger and listen for a separate event to get data back across the network when triggering an event. Instead, use a callback.

### Use AddEventHandler for non-networked events

Keeping with the principle of limiting scope, if an event is triggered and handled on the client or server exclusively, do not register it as a net event.

## Security

### Secure Net Events

GetInvokingResource will be nil if an event is triggered from the opposite side of the network that the event is registered on (client triggering a server event, or server triggering a client event). Restrict other ways to call the event to prevent exploits, unless the event is intended to be triggered by both the client and server.

```lua
RegisterNetEvent('resourceName:client:eventName', function()
    if GetInvokingResource() then return end
    --- handle the event
end)
```

### Validate on server

`GetInvokingResource()` is `nil` for EVERY net event that crosses the network, whether a real player or a cheater sent it. It cannot tell them apart, so it is NOT an authentication check. Treat every argument that arrives from a client as hostile and re-derive the truth on the server:

```lua
RegisterNetEvent('shop:server:purchase', function(itemId, count)
    local src = source

    -- 1. Types and ranges: never trust the shape of the payload
    if type(itemId) ~= 'string' then return end
    count = tonumber(count)
    if not count or count < 1 or count > 50 then return end

    -- 2. Server-owned data: the client never sends a price
    local price = Config.Items[itemId]
    if not price then return end

    -- 3. Physical plausibility: is the player actually at the shop?
    local coords = GetEntityCoords(GetPlayerPed(src))
    if #(coords - Config.ShopCoords) > 5.0 then return end

    -- 4. Only now touch money or inventory
    -- ...
end)
```

Rate-limit events that can be spammed (store the last call time per `source`) and log rejected calls: a burst of rejections from one player is the signature of a cheat menu.
