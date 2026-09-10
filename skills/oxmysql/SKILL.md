---
name: oxmysql
description: "Trigger: oxmysql, MySQL.query, MySQL.insert, MySQL.update, MySQL.single, MySQL.scalar, MySQL.prepare, MySQL.transaction, rawExecute, SQL, database, mysql-async. Write server-side SQL with oxmysql."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# oxmysql

Server-side MySQL/MariaDB access for FiveM through the `MySQL` table (replacement for mysql-async and ghmattimysql).

## Activation Contract

Load this skill when the user writes or edits database code in a FiveM resource: SELECT/INSERT/UPDATE/DELETE, upserts, transactions, `MySQL.*`, `exports.oxmysql`, or migrating from mysql-async.

## Hard Rules

- Server only. Add `server_script '@oxmysql/lib/MySQL.lua'` to `fxmanifest.lua` above other server scripts.
- `MySQL.Sync.*` and `MySQL.Async.*` (mysql-async compatibility layer) are NOT available. Replace them with `MySQL.query`, `MySQL.scalar`, `MySQL.single`, `MySQL.insert`, `MySQL.update`, `MySQL.prepare`, `MySQL.transaction`, each with a `.await` variant.
- `@named` placeholders are deprecated: use positional `?` with an array of values. `prepare` accepts only `?` (and `??` for column names).
- Never concatenate user input into SQL; every value goes through a placeholder.
- Every function takes `(query, params, callback)`; use `.await` to yield instead of nesting callbacks.
- Use `transaction` when several writes must succeed or fail together; it rolls back on any failure.
- Use `rawExecute` only when the normalized result shape of `query`/`prepare` is insufficient.
- Prefer MariaDB over MySQL 8 for compatibility.

## Decision Gates

| Need | Call | Returns |
|---|---|---|
| Many rows | `MySQL.query.await(sql, params)` | array of rows |
| One row | `MySQL.single.await(sql, params)` | row or nil |
| One value (COUNT, one column) | `MySQL.scalar.await(sql, params)` | value or nil |
| Insert | `MySQL.insert.await(sql, params)` | insert id |
| Update / delete count | `MySQL.update.await(sql, params)` | affected rows |
| Hot path, repeated statement | `MySQL.prepare.await(sql, params)` | rows / value |
| Several statements atomically | `MySQL.transaction.await({ { query, values }, ... })` | success boolean |
| Raw, unnormalized result | `MySQL.rawExecute.await(sql, params)` | raw result |

## Execution Steps

1. Confirm the manifest line and that `oxmysql` starts before the resource.
2. Pick the function by result shape from Decision Gates.
3. Write the SQL with backticked identifiers and `?` for every value.
4. Wrap multi-statement writes in `transaction`.
5. Handle nil results (`single`, `scalar`) before use.

## Output Contract

Return runnable server-side Lua (or JS) using `MySQL.<fn>.await` with positional placeholders and no mysql-async syntax.

## References

- rules/placeholders.md — `?` placeholders, deprecated `@named`.
- rules/query.md — MySQL.query: rows or insertId/affectedRows.
- rules/single.md — MySQL.single: one row or nil.
- rules/scalar.md — MySQL.scalar: single value.
- rules/insert.md — MySQL.insert: returns insert id.
- rules/update.md — MySQL.update: returns affected rows.
- rules/prepare.md — MySQL.prepare: prepared statements.
- rules/transaction.md — MySQL.transaction: atomic multi-query.
- rules/rawExecute.md — MySQL.rawExecute: raw result.

Upstream docs: https://overextended.dev/oxmysql
