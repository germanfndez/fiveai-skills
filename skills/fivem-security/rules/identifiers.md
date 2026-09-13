# Player Identifiers

A player's `source` is a connection slot number. It is reused the moment they disconnect and means nothing across sessions. Anything persistent — bans, characters, money, whitelist — must key on a stable identifier.

## Which Identifiers Are Stable

| Identifier | Reliability |
|---|---|
| `license:` | **The only one you can rely on.** Tied to the Rockstar account, always present. |
| `steam:` | Optional. A player who launched the game without Steam has no Steam identifier at all. |
| `discord:` | Present only when the player has Discord running and linked. |
| `fivem:` | Tied to the Cfx.re account; present but not universally used for bans. |
| `ip:` | Shared, dynamic, and changes on a router reboot. Useless as a primary key. |

Design every persistent table around `license:`. Store the others as supplementary evidence if you want, never as the key.

The single most common production bug in FiveM resources is assuming `steam:` exists. It does not for non-Steam launches, and the resource breaks for those players only — which makes it hard to reproduce.

## Reading Identifiers

`GetPlayerIdentifiers(source)` returns a table of every identifier string the server has for that player, each prefixed with its type (`license:...`, `discord:...`). Iterate it when you want all of them.

`GetPlayerIdentifierByType(source, 'license')` returns the single identifier of the requested type, or nil if the player has none of that type. Prefer it over looping and string-matching: it is clearer and it makes the nil case explicit.

```lua
-- SERVER
local function getLicense(src)
    local license = GetPlayerIdentifierByType(src, 'license')
    if not license then
        -- Should not happen for a fully connected player, but handle it.
        return nil
    end
    return license
end

RegisterNetEvent('bank:requestBalance', function()
    local src = source
    local license = getLicense(src)
    if not license then return end

    -- Look up the account by license, never by source.
end)
```

## Hardware Tokens

`GetPlayerTokens` returns the hardware/environment tokens associated with a player. They are a second axis for detecting ban evasion: a player who returns on a new Rockstar account frequently keeps the same tokens.

Treat them as **evidence, not proof**. Tokens can be shared between legitimate players (a household, a cybercafé, a shared machine) and they can change. Use them to flag an account for review, not to issue an automatic permanent ban.

## Ban Checks with `playerConnecting` and Deferrals

`playerConnecting` fires while the player is still on the connecting screen, before they spawn. This is where a ban check belongs: rejecting at this point costs nothing, whereas kicking a spawned player leaves entities and state behind.

The event provides a deferrals object that lets you hold the connection open while you run an async database query, then either let the player in or reject them with a message. The general shape:

1. Call `deferrals.defer()` first, to tell the server you will take time.
2. Yield once (`Wait(0)`) before doing anything else, so the deferral registers.
3. Show progress with `deferrals.update(message)` while your query runs.
4. Call `deferrals.done()` with no argument to accept the player, or `deferrals.done(reason)` with a string to reject them and display that reason.

```lua
-- SERVER
AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local src = source

    deferrals.defer()
    Wait(0)

    deferrals.update('Checking your account...')

    local license = GetPlayerIdentifierByType(src, 'license')
    if not license then
        deferrals.done('Could not read your Rockstar license. Restart your game and try again.')
        return
    end

    -- Replace with your own async lookup (oxmysql, JSON file, API call).
    local ban = FetchBanByLicense(license)

    if ban then
        deferrals.done(('You are banned.\nReason: %s\nExpires: %s'):format(ban.reason, ban.expires))
        return
    end

    deferrals.done()
end)
```

Notes on the shape above:

- `deferrals.done()` must be reached on **every** path. A handler that returns without calling it leaves the player stuck on the connecting screen forever. Wrap risky lookups so a failure still calls `done()`.
- Do not store the ban keyed by `source` inside this handler — the player is not connected yet and the slot will move.
- `setKickReason` is the older mechanism and is superseded by deferrals for anything asynchronous.

## Rules

1. Key every persistent record on `license:`. Never on `source`, never on `steam:`.
2. Use `GetPlayerIdentifierByType(source, 'license')` and handle nil rather than looping over `GetPlayerIdentifiers`.
3. Never accept an identifier as a client-supplied argument. Derive it server-side from `source`.
4. Do ban checks in `playerConnecting` with deferrals, and always reach `deferrals.done()`.
5. Treat `GetPlayerTokens` results as supporting evidence for evasion review, not as a standalone ban key.
