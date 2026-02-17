# Installation

How to install and set up the Fivemanage SDK on a FiveM server.

## Prerequisites

- Fivemanage account and API keys (Media and/or Logs).
- **[screenshot-basic](https://github.com/citizenfx/screenshot-basic)** — required only if you use image capture (`takeImage` / `takeServerImage`).

## Steps

1. **Download the SDK**  
   Get [fmsdk.zip](https://github.com/fivemanage/sdk/releases/latest) from the GitHub releases page.

2. **Extract to resources**  
   Unzip and place the `fmsdk` folder **directly** in the server `resources` directory.  
   The folder must be named `fmsdk`; FMSDK does not support category folders (e.g. `resources/[media]/fmsdk`).

3. **Install dependencies**  
   If you use screenshots, add **screenshot-basic** to your `resources` folder.

4. **Configure server.cfg**  
   Order matters: `screenshot-basic` must start **before** `fmsdk`.

```cfg
ensure screenshot-basic
ensure fmsdk
set FIVEMANAGE_MEDIA_API_KEY "your_media_api_key"
set FIVEMANAGE_LOGS_API_KEY "your_logs_api_key"
```

Set only the ConVars for the features you use (Media for images, Logs for logging).

5. **Optional**  
   Edit `config.json` inside the `fmsdk` resource folder for automatic event logging, timeouts, etc. See **rules/configuration.md**.
