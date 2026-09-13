# Server Convars for Hardening

Server configuration is the cheapest security you will ever deploy. These convars exist in stock FiveM; none require an external anti-cheat.

## Reference

| Convar | Values | What it does |
|---|---|---|
| `sv_scriptHookAllowed` | `0` / `1` | `true` allows Script Hook V clients to connect. Not recommended — it makes the server vulnerable. |
| `sv_enforceGameBuild` | game build number | Selects the game build clients must run. **Startup only**, cannot be changed at runtime. |
| `sv_filterRequestControl` | `0`–`4` | Blocks routing of `REQUEST_CONTROL_EVENT` at varying strictness. |
| `sv_authMaxVariance` | `1`–`5` | Likelihood that user ids change per provider. Default `5`. |
| `sv_authMinTrust` | `1`–`5` | Required trustworthiness, least to most. Default `1`. |
| `sv_endpointPrivacy` | boolean | Hides player IPs from public reports. |
| `rcon_password` | string | If unset, RCon is disabled entirely. |
| `onesync` | `Off` / `On` / `Legacy` | OneSync mode. |

## What Actually Hardens a Server

**`sv_scriptHookAllowed 0`** — non-negotiable. Script Hook V lets a client load arbitrary native-level mods. Leaving it at `1` invites every menu-based cheat on the market and defeats most of your server-side work.

**`sv_enforceGameBuild <build>`** — pins clients to one build. Mixed builds cause desync and give cheaters a mismatched-native surface. Set it once and restart; it cannot be changed while the server runs.

**`sv_filterRequestControl`** — entity control requests are how a cheater takes ownership of your ped, your vehicle, or another player's vehicle. The higher modes drop those requests instead of routing them. Raise it and test: aggressive filtering can break legitimate resources that hand entities between clients, so verify tow trucks, garages and passenger scripts after changing it.

**`sv_authMinTrust`** — raise above the default `1` to require a more trustworthy identity provider before a player connects. This raises the cost of ban evasion via disposable accounts. Higher values turn away some legitimate players; pick a value your community tolerates.

**`sv_authMaxVariance`** — lower it below the default `5` to reject identities whose user ids change frequently across providers. Same tradeoff as above: stricter means fewer throwaway identities and a few more false rejections.

**`sv_endpointPrivacy 1`** — keeps player IPs out of public server reports. Cheap, and it removes a DDoS-targeting vector against your players.

**`rcon_password`** — leave it **unset**. RCon is a remote shell over an aging protocol; an exposed or weak password is a full server compromise. Administer through the console or txAdmin instead. If you must enable it, use a long random value and firewall the port.

**`onesync`** — `On` (Infinity) is the modern mode and a prerequisite for most server-side entity control. `Legacy` is capped and deprecated; `Off` removes server-side entity awareness entirely, which guts your ability to validate anything about entities.

## Sample Hardened Block

```cfg
# --- Client integrity ---
sv_scriptHookAllowed 0
sv_enforceGameBuild 3095

# --- Entity control ---
onesync on
sv_filterRequestControl 4

# --- Identity ---
sv_authMinTrust 3
sv_authMaxVariance 1

# --- Privacy ---
sv_endpointPrivacy true

# --- RCon: intentionally left unset. Do not add rcon_password. ---
```

Replace `3095` with the build your resources target.

## Rules

1. `sv_scriptHookAllowed 0` and an unset `rcon_password` are the two settings with no legitimate tradeoff. Apply both.
2. Change `sv_filterRequestControl`, `sv_authMinTrust` and `sv_authMaxVariance` one at a time and test; each can reject legitimate traffic or players.
3. `sv_enforceGameBuild` requires a restart. Do not expect a runtime change to take effect.
4. Convars harden the perimeter. They never replace server-side validation of your own net events.

Source: https://docs.fivem.net/docs/server-manual/server-commands/
