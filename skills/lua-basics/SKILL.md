---
name: lua-basics
description: "Trigger: Lua code, Lua functions, tables, variables, conditionals, error handling, naming conventions, review Lua, optimize Lua. Write effective, performant Lua for FiveM resources."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# Lua Basics

Idiomatic, performant Lua patterns for FiveM: functions, tables, variables, conditionals and errors.

## Activation Contract

Load this skill when writing or reviewing any Lua in a FiveM resource, or when the user asks about Lua naming, structure, performance, tables or error handling.

## Hard Rules

- Naming: `ALL_CAPS` constants, `camelCase` locals, `PascalCase` globals, `_` for unused variables.
- Prefer `local`; declare locals as close to first use as possible; group file-level globals at the top of a single client/server file.
- Do not use `table.insert`; append with `t[#t + 1] = v` or maintain your own size counter.
- Iterate arrays with numeric `for i = 1, #t`; imply array indices (`{ a, b }`) instead of writing them out.
- Extract repeated table dereferences into locals; use `t.key` for constant keys and `t[var]` for dynamic keys.
- Use guard clauses and early returns; never write `if x then return true else return false end`.
- Prefer positive boolean expressions; set defaults with `value = value or default`.
- Use `assert` for pre-conditions instead of `if not x then error() end`; fail loudly on unexpected state; return errors as values for expected failures.
- Limit parameters; avoid boolean parameters in APIs (use enums); pass named local functions instead of inline ones.
- Keep functions small, single-level of abstraction, and document exports.

## Decision Gates

| Situation | Pattern |
|---|---|
| Expected failure (not found, invalid input) | return `nil, err` or `false` |
| Programmer error / impossible state | `assert` / `error` |
| Flag with more than two meanings | enum table, not boolean |
| Function reused more than once as argument | `local function` then pass by name |
| Append to array | `t[#t + 1] = v` |

## Execution Steps

1. Apply naming and scope rules to every identifier.
2. Replace nested `if` with guard clauses.
3. Replace `table.insert` and `pairs` on arrays with index writes and numeric loops.
4. Add `assert` pre-conditions at function entry.
5. Re-read for size: split any function mixing high- and low-level code.

## Output Contract

Return Lua that follows the naming, locality, table and error-handling rules above; annotate any deliberate deviation.

## References

- rules/functions.md — size, naming, parameters, exports, guard clauses.
- rules/tables.md — indices, dereferencing, table.insert, iteration, size.
- rules/variables.md — naming, enums vs booleans, declaration location.
- rules/conditionals.md — defaults, boolean expressions, readability.
- rules/errors.md — assert, pre-conditions, errors as values, fail loudly.
- rules/reference-links.md — official Lua and FiveM documentation.

Upstream docs: https://www.lua.org/manual/5.4/
