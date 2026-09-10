# Setup

## Install order

`ox_target` depends on `ox_lib`. In `server.cfg`:

```cfg
ensure ox_lib
ensure ox_target
```

## fxmanifest.lua

Your resource does not need to list ox_target as a dependency to call its exports, but declaring it makes load order explicit:

```lua
fx_version 'cerulean'
game 'gta5'

shared_scripts { '@ox_lib/init.lua' }
client_scripts { 'client/main.lua' }
server_scripts { 'server/main.lua' }

dependencies { 'ox_lib', 'ox_target' }
```

## Supported frameworks

ox_target resolves player groups and jobs through `ox_core`, `esx`, or `qbx_core`. The `groups` option only works when one of these is present.

## Convars

Set in `server.cfg` before `ensure ox_target`:

| Convar | Meaning |
|---|---|
| `ox_target:toggleHotkey` | Key that toggles targeting on/off |
| `ox_target:defaultHotkey` | Key held to open the eye |
| `ox_target:drawSprite` | Draw the sprite marker on targetable entities |
| `ox_target:leftClick` | Use left click to select instead of the default |
| `ox_target:debug` | Draw zone outlines |

Example:

```cfg
setr ox_target:defaultHotkey "LMENU"
setr ox_target:drawSprite true
```
