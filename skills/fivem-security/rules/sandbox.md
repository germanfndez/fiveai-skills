# Resource Sandbox

FiveM sandboxes resource Lua. A resource cannot freely touch the filesystem, spawn processes, or read arbitrary convars. Know the limits before writing code that assumes plain Lua semantics — sandbox violations fail at runtime, not at load.

Documented 2026-07-21.

## Filesystem

| Operation | Result |
|---|---|
| Write inside the resource's own folder | Allowed |
| Write into **another** resource's folder | Blocked for all file types, `errno 13` (Permission denied) |
| Operations in the server main folder | Blocked |
| Operations outside any resource folder | Blocked |
| `..` path traversal | Rejected |
| Symlinks | Cannot be followed, cannot be created |

`SaveResourceFile` obeys the same rule: it can only write inside the resource it targets when that resource is permitted.

Practical consequence: a resource that persists JSON must write inside itself, or use a database (`oxmysql`) instead. Do not design a resource that writes config into a sibling resource.

## Blocked and Limited Lua

| API | Status |
|---|---|
| `os.execute` | Blocked — all commands |
| `io.tmpfile()` | Blocked |
| `io.popen` | Limited — only emulated `ls` / `dir` |
| `os.getenv("os")` | Limited — returns the OS type only |
| `os.setlocale()` | Limited — returns the current locale, cannot modify it |
| `load()` | Allowed |

`load()` staying allowed matters for security: a resource that `load()`s a string fetched from a remote URL is executing untrusted code inside your server. Treat any such pattern in a downloaded resource as a backdoor until proven otherwise.

## Granting Permissions in server.cfg

```cfg
# Let resourceA write into resourceB's folder
add_filesystem_permission resourceA write resourceB

# Let resourceA read a specific convar
add_convar_permission resourceA read some_convar_name

# Workers and child processes are restricted by default
add_unsafe_worker_permission "resourceName"
add_unsafe_child_process_permission "resourceName"
```

Important: **once any convar permission is configured, resources need explicit permission to read convars.** Adding a single `add_convar_permission` line switches convar reads to opt-in server-wide. If a previously working resource suddenly reads `nil` from `GetConvar`, this is why.

`add_unsafe_worker_permission` and `add_unsafe_child_process_permission` are named "unsafe" for a reason. Grant them only to resources you wrote or fully audited; a child process escapes the sandbox entirely.

## Timing Natives

The sandbox exposes higher-resolution timing than stock Lua:

| Native | Use |
|---|---|
| `os.nanotime()` | Nanosecond timestamp |
| `os.microtime()` | Microsecond timestamp |
| `os.deltatime()` | Elapsed time since the previous call |
| `os.rdtsc()` | CPU timestamp counter |
| `os.rdtscp()` | Serialized CPU timestamp counter |

Use `os.microtime()` or `os.nanotime()` for profiling a handler; `GetGameTimer()` resolution is too coarse for hot paths.

## Rules

1. Never assume a third-party resource can write outside itself. If it claims to, it needs an explicit `add_filesystem_permission` grant and you should ask why.
2. Audit any resource that calls `load()`, `io.popen`, or requests unsafe worker / child-process permissions.
3. Prefer a database over resource-local files for anything a second resource must read.
4. Do not silently add `add_convar_permission` lines without knowing they change convar access for every resource.

Source: https://docs.fivem.net/docs/developers/sandbox/
