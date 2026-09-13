# ACE Permissions (Admin Authorization)

ACE (Access Control Entry) is the built-in FiveM authorization system. It is the correct answer to "how do I know this player is an admin?" — not a Lua table of identifiers, not a client-side check.

## Commands (server.cfg / RCon)

| Command | Meaning |
|---|---|
| `add_ace [principal] [object] [allow\|deny]` | Grant or deny an object to a principal |
| `remove_ace [principal] [object] [allow\|deny]` | Remove a previously set ACE |
| `add_principal [child_principal] [parent_principal]` | Make the child inherit the parent's ACEs |
| `remove_principal [child_principal] [parent_principal]` | Break that inheritance |
| `test_ace [principal] [object]` | Print whether a principal is allowed an object |

## Native

```lua
IsPlayerAceAllowed(source, object) -- returns boolean, SERVER side
```

## Principals

A principal is *who*. Two shapes matter:

- **Identifier principals** — a concrete player: `identifier.license:1a2b3c4d...`, `identifier.fivem:1234567`, `identifier.discord:...`.
- **Group principals** — a role: `group.admin`, `group.moderator`, `group.donator`. The name is arbitrary; `group.` is just a convention.

You attach a player to a group with `add_principal`, then grant ACEs to the group. Never grant ACEs to individual licenses when a group will do.

## Objects

An object is *what*. Objects are dotted namespaces and inherit downward:

- `command` covers every command.
- `command.tp` covers only `/tp`.
- `myresource.admin.giveitem` is a perfectly valid custom object; you invent the namespace.

Granting `myresource.admin` implicitly allows `myresource.admin.giveitem`, `myresource.admin.ban`, and anything else under it.

## Deny by Default

Anything not explicitly allowed is denied. `deny` exists to carve a hole in an otherwise-allowed namespace:

```cfg
add_ace group.moderator command allow      # every command
add_ace group.moderator command.stop deny  # except /stop
```

## Where `restricted = 'group.admin'` Comes From

`ox_lib`'s `lib.addCommand` accepts `restricted`. When you write:

```lua
lib.addCommand('giveitem', {
    help = 'Give an item to a player',
    restricted = 'group.admin',
}, function(source, args)
    -- only runs for players in group.admin
end)
```

`group.admin` is **not** something ox_lib defines. It is an ACE principal that must exist in your `server.cfg`. ox_lib creates an ACE object for the command and checks it against the caller. If nobody is in `group.admin`, the command is simply unusable — which is why a freshly installed resource "does nothing" for the owner.

Setting `restricted = 'group.admin'` without the matching `add_principal` line is the single most common misconfiguration in ox_lib resources.

## Realistic server.cfg Block

```cfg
# --- Groups ---
add_ace group.admin command allow
add_ace group.admin myresource.admin allow

add_ace group.moderator command.kick allow
add_ace group.moderator myresource.admin.warn allow

# --- Members ---
add_principal identifier.license:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b group.admin
add_principal identifier.license:0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e group.moderator

# --- Inheritance: every admin is also a moderator ---
add_principal group.admin group.moderator

# --- Explicit deny wins over an inherited allow ---
add_ace group.moderator command.stop deny
```

Verify with `test_ace identifier.license:1a2b... myresource.admin` in the server console.

## Lua Guard

Check ACE on the **server**, at the top of the handler, before any state change:

```lua
-- SERVER
RegisterNetEvent('myresource:admin:giveItem', function(targetId, item, count)
    local src = source

    if not IsPlayerAceAllowed(src, 'myresource.admin.giveitem') then
        print(('[AC] %s (%s) called an admin event without ACE'):format(GetPlayerName(src), src))
        return
    end

    if type(item) ~= 'string' or type(count) ~= 'number' then return end
    count = math.floor(count)
    if count < 1 or count > 100 then return end

    local target = tonumber(targetId)
    if not target or not GetPlayerName(target) then return end

    -- safe to proceed
end)
```

## Rules

1. Every admin-facing net event needs its own `IsPlayerAceAllowed` check. A hidden client-side menu is not authorization.
2. Give each privileged action its own object (`res.admin.ban`, `res.admin.giveitem`) so groups can be scoped.
3. Never derive admin status from a client-supplied argument, a NUI callback, or a player's presence in a Lua table populated by the client.
4. `IsPlayerAceAllowed` is server-side. A client-side equivalent tells you nothing a cheater cannot fake.

Source: https://docs.fivem.net/docs/server-manual/server-commands/
