# Placeholders

Use `?` for values; parameters as array or object. Prevents SQL injection.

```lua
MySQL.scalar('SELECT `username` FROM `users` WHERE `identifier` = ? AND `group` = ?', { identifier, group })
```

Named placeholders (`@name`) are deprecated; use positional `?` and pass array. For prepared statements use **rules/prepare.md** (only `?` and `??` for column names).

Reference: [Placeholders – overextended.dev](https://overextended.dev/oxmysql/placeholders).
