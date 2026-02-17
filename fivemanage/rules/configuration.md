# Configuration

Customize the SDK via **config.json** inside the `fmsdk` resource folder (in your server `resources` directory).

## What you can configure

- **Automatic event logging** — Enable/disable logging for player events, chat, resource start/stop, txAdmin, ox_inventory.
- **Logging behavior** — Console output, cloud destination, default datasets.
- **Images / media** — Timeouts, upload options.

Full options are documented in the official Configuration guide: [Configuration](https://docs.fivemanage.com/fivem-sdk/configuration).

## Presigned URLs

For secure client-side uploads without exposing API tokens (e.g. from NUI), use presigned URLs. The SDK can generate temporary upload URLs. Details: [Presigned URLs](https://docs.fivemanage.com/fivem-sdk/presigned-urls).

## API keys (reminder)

Keys are set as ConVars in **server.cfg**, not in config.json:

- `FIVEMANAGE_MEDIA_API_KEY` — for images / media.
- `FIVEMANAGE_LOGS_API_KEY` — for logs.

Set only the keys for the features you use.
