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

## Naming and security

- Name net events clearly: `resourceName:side:action`, e.g. `shop:server:purchase`.
- On server, validate the sender with **GetInvokingResource()** to avoid exploits:

```lua
RegisterNetEvent('shop:server:purchase')
AddEventHandler('shop:server:purchase', function(itemId)
  if GetInvokingResource() then return end -- only allow from same resource or trusted
  -- ...
end)
```

## Reference

- Listening: https://docs.fivem.net/docs/scripting-manual/working-with-events/listening-for-events/
- Triggering: https://docs.fivem.net/docs/scripting-manual/working-with-events/triggering-events/
