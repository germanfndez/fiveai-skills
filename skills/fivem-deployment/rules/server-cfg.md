# server.cfg

## Load order

`ensure` lines execute in file order. A resource that depends on another must come after it.

```cfg
ensure oxmysql
ensure ox_lib
ensure ox_inventory
ensure my_resource
```

A resource that starts before its dependency will error at load time, not at call time — read the console from the top.

## sv_enforceGameBuild

Selects the game build clients load. It **can only be specified at startup**; setting it at runtime does nothing.

### Legacy

Takes a numeric build value corresponding to a GTA Online Title Update.

```cfg
sv_enforceGameBuild 3095
```

Use the build number the resources actually require. Do not guess one.

### Enhanced

Enhanced behaves differently and this is a real trap when porting a Legacy `server.cfg`:

- Only the **latest** build loads by default.
- The only other valid value is `1`, meaning base game with no DLC.
- **Numeric build values are unsupported on Enhanced.**

```cfg
# Enhanced: base game, no DLC
sv_enforceGameBuild 1
```

A Legacy config copied to Enhanced with a numeric gamebuild is a misconfiguration. Omit the convar to take the latest build.

## Security convars

| Convar | Type | Notes |
|---|---|---|
| `sv_scriptHookAllowed` | boolean | Allows Script Hook V clients. **Not recommended** — makes the server vulnerable. Leave it off. |
| `sv_filterRequestControl` | 0-4 | Blocks `REQUEST_CONTROL_EVENT` routing |
| `sv_authMaxVariance` | 1-5 | Likelihood of user id changes per provider. Default 5 |
| `sv_authMinTrust` | 1-5 | Trustworthiness, least to most trustworthy. Default 1 |
| `sv_endpointPrivacy` | boolean | Hides player IPs from public reports |
| `rcon_password` | string | Sets the RCon password. **If unset, RCon is disabled** — that is the safe default |
| `onesync` | `Off` / `On` / `Legacy` | State awareness mode |

Hardened baseline:

```cfg
sv_scriptHookAllowed 0
sv_endpointPrivacy true
sv_filterRequestControl 4
sv_authMinTrust 3
onesync on
```

Tune `sv_filterRequestControl` and `sv_authMinTrust` to the server: stricter values reject more, including legitimate clients. Do not ship a value you have not tested.

Leave `rcon_password` unset unless RCon is genuinely needed. Setting it exposes a remote control surface.

## sv_licenseKey

Required. Obtain a key from the Cfx keymaster for the server's host, and keep it out of version control.

```cfg
sv_licenseKey "changeme"
```

Treat a leaked key as compromised and reissue it.

## Endpoints

```cfg
endpoint_add_tcp "0.0.0.0:30120"
endpoint_add_udp "0.0.0.0:30120"
```

Both TCP and UDP must be reachable on the same port. A server that appears in the list but rejects joins is usually missing the UDP rule at the firewall.

## Listing limits

Relayed but **not independently verified — confirm before relying on it**: client listing limits were reported to change on 2026-02-12, with `sv_projectName` going from 50 to 40 characters, `sv_hostname` from unlimited to 120, and `sv_projectDesc` from 125 to 250. Verify against current docs before trimming a live config.
