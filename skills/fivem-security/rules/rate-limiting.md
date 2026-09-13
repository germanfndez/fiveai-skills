# Rate Limiting Net Events

Validation stops a cheater from sending *wrong* data. Rate limiting stops them from sending *correct* data ten thousand times a second. Every event that grants money, items, XP or state needs one.

All of this is server-side. A client-side cooldown is a suggestion.

## Pattern 1: Simple Cooldown Table

One timestamp per source, per event. Use this for anything with a natural interval (a job payout, a crafting action, a shop purchase).

```lua
-- SERVER
local cooldowns = {}       -- cooldowns[src][key] = expiry in ms
local COOLDOWN_MS = 2000

--- Returns true if the action is allowed, false if still cooling down.
local function checkCooldown(src, key, ms)
    local now = GetGameTimer()
    local playerCooldowns = cooldowns[src]

    if not playerCooldowns then
        playerCooldowns = {}
        cooldowns[src] = playerCooldowns
    end

    local expiry = playerCooldowns[key]
    if expiry and now < expiry then
        return false, expiry - now
    end

    playerCooldowns[key] = now + ms
    return true
end

RegisterNetEvent('shop:buyItem', function(itemName)
    local src = source

    local allowed, remaining = checkCooldown(src, 'shop:buyItem', COOLDOWN_MS)
    if not allowed then
        print(('[AC] %s (%s) spammed shop:buyItem, %sms early'):format(GetPlayerName(src), src, remaining))
        return
    end

    if type(itemName) ~= 'string' then return end

    -- proceed: look up price server-side, verify funds, verify distance
end)
```

## Pattern 2: Token Bucket

A fixed cooldown is wrong when bursts are legitimate — a player firing a weapon, opening an inventory, or clicking through a menu. A token bucket allows a burst, then throttles sustained abuse.

Each source gets a bucket of `capacity` tokens that refills at `refillPerSecond`. Each event costs one token. No token, no action.

```lua
-- SERVER
local buckets = {}   -- buckets[src][key] = { tokens = n, updated = ms }

local LIMITS = {
    ['inventory:useItem']   = { capacity = 5,  refillPerSecond = 1.0 },
    ['weapon:reportShot']   = { capacity = 20, refillPerSecond = 8.0 },
    ['player:requestSync']  = { capacity = 3,  refillPerSecond = 0.5 },
}

--- Consumes one token. Returns true if allowed.
local function consumeToken(src, key)
    local limit = LIMITS[key]
    if not limit then return true end

    local playerBuckets = buckets[src]
    if not playerBuckets then
        playerBuckets = {}
        buckets[src] = playerBuckets
    end

    local now = GetGameTimer()
    local bucket = playerBuckets[key]

    if not bucket then
        bucket = { tokens = limit.capacity, updated = now }
        playerBuckets[key] = bucket
    end

    -- Refill proportionally to elapsed time, capped at capacity.
    local elapsed = (now - bucket.updated) / 1000.0
    bucket.tokens = math.min(limit.capacity, bucket.tokens + elapsed * limit.refillPerSecond)
    bucket.updated = now

    if bucket.tokens < 1.0 then
        return false
    end

    bucket.tokens = bucket.tokens - 1.0
    return true
end

RegisterNetEvent('inventory:useItem', function(slot)
    local src = source

    if not consumeToken(src, 'inventory:useItem') then
        print(('[AC] %s (%s) exceeded rate limit on inventory:useItem'):format(GetPlayerName(src), src))
        return
    end

    if type(slot) ~= 'number' then return end

    -- proceed
end)
```

Tuning: `capacity` is the burst you tolerate, `refillPerSecond` is the sustained rate. A player who clicks five items in one second and then stops is fine; one who sustains five per second drains the bucket and is throttled.

## Cleanup on Disconnect

Both tables are keyed by `source`. Sources are reused for new players, so stale entries are both a memory leak and a correctness bug — a reconnecting player would inherit the previous player's cooldowns.

```lua
-- SERVER
AddEventHandler('playerDropped', function()
    local src = source
    cooldowns[src] = nil
    buckets[src] = nil
end)
```

`playerDropped` fires with `source` set to the departing player. Clear every per-source table you own there, not just these two.

## What to Log

Log a rejection, not every call. A rejection line should let an admin act without reading code:

- The player name **and** source id — the name alone is not unique or persistent.
- The player's stable identifier (`license:`) if the event is worth a ban.
- The event name.
- How far over the limit they were (ms early, or the token count).
- A timestamp, if your logger does not add one.

Escalate on repetition rather than on a single hit. Latency and double-clicks produce real false positives; a player who trips the same limiter fifty times in a minute does not.

```lua
local offences = {}

local function reportAbuse(src, key)
    offences[src] = (offences[src] or 0) + 1
    print(('[AC] %s (%s) rate-limited on %s (offence #%d)'):format(
        GetPlayerName(src), src, key, offences[src]))

    if offences[src] >= 50 then
        -- Escalate to your logging resource or admin webhook here.
        -- Do not auto-ban from a rate limiter alone.
    end
end

AddEventHandler('playerDropped', function()
    offences[source] = nil
end)
```

## Rules

1. Rate-limit on the server. A client-side timer is decoration.
2. Use a fixed cooldown for discrete actions, a token bucket where bursts are legitimate.
3. Always clear per-source state in `playerDropped`, or sources get recycled with stale data.
4. Return early on rejection — never fall through to the action.
5. Log rejections with source id and event name; escalate on counts, not on single hits.
6. Rate limiting sits *on top of* type validation, distance checks and state verification. It replaces none of them.
