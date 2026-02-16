# FiveAI Skills

Curated skills for **FiveM** (cfx.re) that give AI assistants and code agents accurate, up-to-date knowledge about the FiveM ecosystem. Use them in Cursor, VS Code, Claude Code, or any tool that supports skill/rule files.

---

## What is FiveM?

**FiveM** is a modification framework for **Grand Theft Auto V** that lets you run custom multiplayer servers with their own game modes, scripts, and assets. It’s part of the **cfx.re** platform (along with RedM for Red Dead Redemption 2). Servers are built with **Lua** (and optionally JavaScript/C#): resources, client/server scripts, events, and a rich ecosystem of libraries and frameworks (e.g. Ox, ESX, QBCore). If you’re building or maintaining a FiveM server or resource, these skills help your AI assistant speak the same language as the platform.

---

## What is a skill?

A **skill** is a bundle of documentation and rules that an AI uses when helping you with a specific topic. For example:

- **fivem-basics** — Resource structure, `fxmanifest.lua`, client/server scripting, events, exports, debugging, and optimization.
- **oxlib** — Ox Lib: UI (notify, alert, input, menu, progress), callbacks, commands, zones.
- **oxmysql** — OxMySQL: queries, inserts, updates, transactions, placeholders.

When you add a skill to your agent, it knows when to use it (“Use when…”) and can follow the rules and references so its answers stay correct and on-topic. That’s especially important for FiveM, where patterns, APIs, and best practices are specific to the platform.

---

## Why skills matter for FiveM (cfx.re)

FiveM and the cfx.re stack have their own:

- **APIs and natives** — Client/server split, events, exports, state bags.
- **Resource model** — `fxmanifest.lua`, client/server/shared scripts, dependencies.
- **Ecosystem** — Ox (ox_lib, oxmysql, ox_inventory, etc.), frameworks, and conventions.

Generic AI knowledge often gets details wrong or suggests patterns that don’t fit FiveM. Skills encode **domain knowledge** (how resources work, how to use ox_lib, how to write safe SQL with OxMySQL) so the AI gives answers that match the official docs and community best practices. That means fewer bugs, better code, and faster development.

---

## Community

This repository is **open source** and **community-driven**. The goal is to give everyone in the FiveM / cfx.re ecosystem—developers, server owners, framework users—better AI assistance that actually understands the platform.

- **Contributions welcome** — Whether you fix a typo, add a new skill, or improve an existing rule, your PR helps the whole community.
- **Share and reuse** — Use these skills in your own projects, forks, or tools. Credit is appreciated but not required.
- **Stay in sync with the ecosystem** — We align with official [FiveM](https://docs.fivem.net/) and [Ox](https://coxdocs.dev/) docs and with patterns used in the community so the AI stays accurate and up to date.

If you have ideas, questions, or want to coordinate larger changes, open a [Discussion](https://github.com/fiveai/skills/discussions) or get in touch via the [FiveM forums](https://forum.cfx.re/) and community channels.

---

## Repository structure

Each skill is a **folder** at the repo root. The folder name is the **slug** (e.g. `fivem-basics`, `oxlib`).

```
/
├── README.md
├── fivem-basics/
│   ├── SKILL.md          # Main entry: name, description, when to use, links to rules
│   └── rules/            # Detailed rules the AI should follow
│       ├── fxmanifest.md
│       ├── client-server.md
│       ├── events.md
│       └── ...
├── oxlib/
│   ├── SKILL.md
│   └── rules/
│       ├── init.md
│       ├── callback.md
│       ├── interface.md
│       └── ...
└── oxmysql/
    ├── SKILL.md
    └── rules/
        ├── placeholders.md
        ├── query.md
        └── ...
```

- **SKILL.md** — Required. Must have YAML frontmatter with `name` and `description` (the description should include “Use when…” so the agent knows when to activate the skill). The rest is Markdown (overview, when to use, links to rules/references).
- **rules/** — Optional. One or more `.md` files with concrete rules, examples, and patterns. The main SKILL.md typically links to these so the AI can read the right rule for the task.

---

## How to contribute

### Adding a new skill

1. Create a new folder at the root with a **slug** (lowercase, hyphens only), e.g. `my-new-skill`.
2. Add **SKILL.md** with:
   - YAML frontmatter: `name` and `description` (include “Use when…”).
   - A short overview and a “When to use” section.
   - Links to any rules or references.
3. Optionally add a **rules/** directory with one or more `.md` files for detailed behavior.
4. Open a pull request with a short explanation of what the skill covers and why it’s useful for FiveM.

### Improving an existing skill

- Fix typos, clarify wording, or align with the latest [FiveM](https://docs.fivem.net/) or [Ox](https://coxdocs.dev/) docs.
- Add rules for topics that aren’t covered yet.
- Add examples or references that help the AI give better answers.

Open a PR with the changes; we’ll review and merge.

### SKILL.md frontmatter example

```yaml
---
name: my-skill
description: Short description. Use when the user asks about X or when doing Y.
---

# My skill

Overview and when to use. Link to rules/ and external docs.
```

---

## Using these skills

- **Download** — Clone this repo or download a skill folder (e.g. from the [FiveAI](https://fiveai.dev) site when available). Add the skill folder or its path to your AI agent’s rules/skills configuration.
- **Consumers** — The [FiveAI landing](https://github.com/fiveai/fiveai-landing) can fetch skills from this repo via the GitHub API to build the site and provide zips; other tools can clone or read the repo directly.

---

## Links

### Official docs

- [FiveM documentation](https://docs.fivem.net/docs/)
- [FiveM natives](https://docs.fivem.net/natives/)
- [Ox documentation (ox_lib, oxmysql, etc.)](https://coxdocs.dev/)

### Community

- [cfx.re forum](https://forum.cfx.re/) — FiveM & RedM discussion, support, and releases
- [FiveM Discord](https://discord.gg/fivem) — Official FiveM community
- [Overextended (Ox) Discord](https://discord.overextended.dev/) — ox_lib, oxmysql, ox_inventory, and other Ox resources
