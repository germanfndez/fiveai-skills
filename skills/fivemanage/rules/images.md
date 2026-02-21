# Images

Capture and upload images with the Fivemanage SDK. Requires **screenshot-basic** for client/server screenshot exports. Media API key required.

## Client: `takeImage`

Captures the player's screen and uploads to Fivemanage. Client-side only.

**Signature:** `takeImage(metadata?: Record<string, unknown>): Promise<{ url: string }>`

**Lua:**

```lua
local imageData = exports.fmsdk:takeImage({
    name = "Player Screenshot",
    description = "Captured via script"
})
if imageData then
    print("Image uploaded to: " .. imageData.url)
end
```

**JavaScript:**

```javascript
exports.fmsdk.takeImage({
    name: "Player Screenshot",
    description: "Captured via script"
}).then((imageData) => {
    console.log("Image uploaded to: " + imageData.url);
}).catch((err) => {
    console.error("Failed to take image: " + err);
});
```

## Server: `takeServerImage`

Requests a screenshot from a specific player and uploads it. Use for admin tools, reports, etc.

**Signature:** `takeServerImage(playerSource: string | number, metadata?, timeout?): Promise<{ url: string }>`  
- `timeout` optional, in ms (e.g. 10000).

**Lua:**

```lua
local playerSource = 1
local success, imageData = pcall(function()
    return exports.fmsdk:takeServerImage(playerSource, {
        reason = "Admin investigation"
    }, 10000)
end)
if success then
    print("Image uploaded: " .. imageData.url)
end
```

**JavaScript:**

```javascript
exports.fmsdk.takeServerImage(playerSource, {
    reason: "Admin investigation"
}, 10000).then((imageData) => {
    console.log("Image uploaded: " + imageData.url);
}).catch((err) => {
    console.error("Failed to capture image: " + err);
});
```

## Server: `uploadImage`

Uploads an image from a buffer (e.g. file read on server). Typical use: JavaScript/TypeScript server scripts.

**Signature:** `uploadImage(buffer: ArrayBuffer, options: { metadata?: Record<string, unknown>; fileName?: string }): Promise<{ url: string }>`

**JavaScript:**

```javascript
const fs = require('fs');
const path = require('path');
const buffer = fs.readFileSync(path.join(GetResourcePath(GetCurrentResourceName()), 'image.png'));

exports.fmsdk.uploadImage(buffer, {
    fileName: "server_file.png",
    metadata: { source: "server_filesystem" }
}).then((imageData) => {
    console.log("Uploaded: " + imageData.url);
});
```

## Metadata

Attach custom metadata to any image. Common fields:

| Field           | Use |
|----------------|-----|
| `name`         | Title for the image. |
| `description`  | Longer description. |
| `playerSource` | Links the image to a player in the dashboard. |

Metadata is searchable in the Fivemanage dashboard.
