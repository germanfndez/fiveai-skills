# FiveAI Skills

Curated skills for **FiveM** (cfx.re) that give AI assistants and code agents accurate, up-to-date knowledge about the FiveM ecosystem. Use them in Cursor, VS Code, Claude Code, or any tool that supports skill/rule files.

---

## What is FiveM?

**FiveM** is a modification framework for **Grand Theft Auto V** that lets you run custom multiplayer servers with their own game modes, scripts, and assets. It’s part of the **cfx.re** platform (along with RedM for Red Dead Redemption 2). Servers are built with **Lua** (and optionally JavaScript/C#): resources, client/server scripts, events, and a rich ecosystem of libraries and frameworks (e.g. Ox, ESX, QBCore). If you’re building or maintaining a FiveM server or resource, these skills help your AI assistant speak the same language as the platform.

---

## What is a skill?

A **skill** is a bundle of documentation and rules that an AI uses when helping you with a specific topic. For example:

- **lua-basics** — Effective Lua programming for FiveM: functions, tables, variables, conditionals, error handling, best practices.
- **fivem-basics** — Resource structure, `fxmanifest.lua`, client/server scripting, events, exports, debugging, and optimization.
- **fivem-nui** — FiveM NUI (New User Interface): HTML/CSS/JS, fullscreen UIs, NUI callbacks, messaging.
- **fivem-security** — Security & Anti-Exploit: Server authority, event validation, distance checks, rate limiting.
- **esx-framework** — ESX Legacy: PlayerData, xPlayer, jobs, economy, inventory, weapons, events, callbacks, best practices.
- **qbcore-framework** — QBCore: PlayerData, Player object, jobs, gangs, economy, inventory, events, callbacks, optimization.
- **oxlib** — Ox Lib: UI (notify, alert, input, menu, progress), callbacks, commands, zones.
- **oxmysql** — OxMySQL: queries, inserts, updates, transactions, placeholders.
- **fivemanage** — Fivemanage SDK: logs, images (takeImage, takeServerImage, uploadImage), configuration.

When you add a skill to your agent, it knows when to use it (“Use when…”) and can follow the rules and references so its answers stay correct and on-topic. That’s especially important for FiveM, where patterns, APIs, and best practices are specific to the platform.

---

## Installation

FiveAI Skills can be installed as a native plugin in Codex, Cursor, Hermes, DeepSeek Harness, Claude Code, and CodeBuddy. The repository remains compatible with `npx skills` for users who only want the skill files.

### Codex

```powershell
codex plugin marketplace add germanfndez/fiveai-skills
codex plugin add fiveai-skills@fiveai
```

Refresh the marketplace before reinstalling an update:

```powershell
codex plugin marketplace upgrade fiveai
codex plugin add fiveai-skills@fiveai
```

Remove the plugin with `codex plugin remove fiveai-skills@fiveai`.

### Cursor

For local or pre-publication use, clone the repository into Cursor's local plugin directory and reload Cursor:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.cursor\plugins\local" | Out-Null
git clone https://github.com/germanfndez/fiveai-skills "$env:USERPROFILE\.cursor\plugins\local\fiveai-skills"
```

Run **Developer: Reload Window**, then open **Customize** and confirm that the nine skills are listed. Teams and Enterprise organizations can import `germanfndez/fiveai-skills` from **Dashboard > Plugins > Team Marketplaces**. Update a local clone with `git pull --ff-only`; uninstall it by removing that local plugin directory.

### Hermes Agent

```powershell
hermes plugins install germanfndez/fiveai-skills --no-enable
hermes plugins list
hermes plugins enable fiveai-skills
```

Use `skills_list` to find the qualified skill names and `skill_view` to load one. Run `hermes plugins update fiveai-skills` to update or `hermes plugins remove fiveai-skills` to uninstall.

### DeepSeek Harness

Install the repository as a bundle into the profile you use:

```powershell
dsh plugin --profile web add github:germanfndez/fiveai-skills
dsh --profile web --dump-config
```

Restart the profile after installation. The bundle mounts the repository's canonical `skills/` directory through DeepSeek Harness's filesystem skill provider. To update, remove and add the bundle again:

```powershell
dsh plugin --profile web remove fiveai-skills
dsh plugin --profile web add github:germanfndez/fiveai-skills
```

Replace `web` with another profile name when applicable.

### Claude Code

Run these commands inside Claude Code:

```text
/plugin marketplace add germanfndez/fiveai-skills
/plugin install fiveai-skills@fiveai
```

Use `/plugin marketplace update fiveai` and `/plugin update fiveai-skills@fiveai` for updates. Uninstall with `/plugin uninstall fiveai-skills@fiveai`.

### CodeBuddy

Run these commands inside CodeBuddy:

```text
/plugin marketplace add germanfndez/fiveai-skills
/plugin install fiveai-skills@fiveai
```

Use `/plugin marketplace update fiveai` and reinstall or update the plugin after a new release. Uninstall it from the `/plugin` manager.

### Install skills only

```powershell
# Install for supported agents
npx skills add germanfndez/fiveai-skills

# Install globally
npx skills add germanfndez/fiveai-skills -g

# Install only for Cursor
npx skills add germanfndez/fiveai-skills -a cursor

# List available skills
npx skills add germanfndez/fiveai-skills --list
```

You can also download individual skills from [usefiveai.vercel.app/skills](https://usefiveai.vercel.app/skills).

### Validate a checkout

The validator uses Node.js built-ins only and does not install dependencies:

```powershell
npm test
npm run validate
```


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
- **Licensing** — Released under the [MIT License](LICENSE): free to use, modify, and redistribute, including commercially.
- **Stay in sync with the ecosystem** — We align with official [FiveM](https://docs.fivem.net/) and [Ox](https://coxdocs.dev/) docs and with patterns used in the community so the AI stays accurate and up to date.

If you have ideas, questions, or want to coordinate larger changes, open a [Discussion](https://github.com/germanfndez/fiveai-skills/discussions) or get in touch via the [FiveM forums](https://forum.cfx.re/) and community channels.

---

## Repository structure

The repository root is the plugin package. Skills remain under `skills/` as the single authored source used by every host.

```
/
├── plugin.json                       # Agent Plugins manifest for Cursor and Hermes
├── cordis.patch.yml                  # DeepSeek Harness bundle layer
├── .codex-plugin/plugin.json         # Codex manifest
├── .claude-plugin/                   # Claude manifest and marketplace
├── .codebuddy-plugin/                # CodeBuddy manifest and marketplace
├── .cursor-plugin/marketplace.json   # Cursor marketplace catalog
├── .agents/plugins/marketplace.json  # Codex marketplace catalog
├── scripts/validate-plugin.mjs       # Cross-host static validator
├── tests/plugin-validation.test.mjs  # Validator behavior tests
└── skills/
    ├── fivem-basics/
    │   ├── SKILL.md
    │   └── rules/
    ├── oxlib/
    │   ├── SKILL.md
    │   └── rules/
    └── ...
```

- **SKILL.md** — Required. Must have YAML frontmatter with `name` and `description` (the description should include “Use when…” so the agent knows when to activate the skill). The rest is Markdown (overview, when to use, links to rules/references).
- **rules/** — Optional. One or more `.md` files with concrete rules, examples, and patterns. The main SKILL.md typically links to these so the AI can read the right rule for the task.

---

## How to contribute

### Adding a new skill

1. Create `skills/<slug>/` using lowercase letters and hyphens, e.g. `skills/my-new-skill/`.
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

## Links

### Official docs

- [FiveM documentation](https://docs.fivem.net/docs/)
- [FiveM natives](https://docs.fivem.net/natives/)

### Community

- [FiveAI Discord](https://discord.com/invite/Nrzwx93NNw) — Our community: skills, support, and FiveM AI tools
- [cfx.re forum](https://forum.cfx.re/) — FiveM & RedM discussion, support, and releases
- [FiveM Discord](https://discord.gg/fivem) — Official FiveM community

## License

[MIT](LICENSE) © Germán Fernández
