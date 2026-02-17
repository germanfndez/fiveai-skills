# Logs

Centralize server logs with the Fivemanage SDK. Logs go to the Fivemanage cloud. Logs API key required. Use **datasets** to categorize (e.g. `economy`, `anticheat`, `admin_actions`). If a dataset does not exist, it may be created automatically depending on plan/settings.

## Player identifiers

Include `playerSource` or `targetSource` in metadata; the SDK will attach player identifiers (License, Discord, Steam, etc.) to the log entry so you can track actions without manually gathering identifiers.

## `Log`

Primary export: send a log to a specific dataset.

**Signature:** `Log(datasetId: string, level: string, message: string, metadata?: { playerSource?: string | number; targetSource?: string | number; [key: string]: unknown }): void`

**Lua:**

```lua
exports.fmsdk:Log("economy", "info", "Player purchased an item", {
    playerSource = source,
    item = "Pistol",
    price = 500
})
```

**JavaScript:**

```javascript
exports.fmsdk.Log("economy", "info", "Player purchased an item", {
    playerSource: source,
    item: "Pistol",
    price: 500
});
```

Example with killer/victim:

```lua
exports.fmsdk:Log("kills", "info", "Player killed another player", {
    playerSource = killerSource,
    targetSource = victimSource,
    weapon = "CombatPistol"
})
```

## Shorthand: `Info`, `Warn`, `Error`

Same idea, fixed level. Always send to the given dataset.

- `Info(datasetId, message, metadata?)`
- `Warn(datasetId, message, metadata?)`
- `Error(datasetId, message, metadata?)`

**Lua:**

```lua
exports.fmsdk:Info("default", "Server started successfully")
exports.fmsdk:Error("anticheat", "Suspicious activity detected", { playerSource = source })
```

## `LogMessage` (legacy)

Sends to the `"default"` dataset only.

```lua
exports.fmsdk:LogMessage("info", "This goes to the default dataset")
```

## Automatic event logging

Configure in `config.json` (see **rules/configuration.md**). Supported automatic events include:

- Player connect/disconnect
- Chat messages
- Resource start/stop (base events)
- txAdmin admin actions
- ox_inventory (item movements, purchases, etc.) if installed
