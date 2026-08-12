# ANVA Website

Static website for ANVA / ANVA Horizon Resort.

## Run locally

### Easiest
Open `index.html` directly in a browser.

### Recommended in VS Code
Install/use **Live Server**, then open `index.html` with Live Server.

No npm, build process or external framework is required.

## Publish with GitHub Pages

1. Upload the contents of this folder to a GitHub repository.
2. Open repository **Settings → Pages**.
3. Deploy from your main branch/root folder.
4. GitHub will provide the public site URL.

## Edit important links

Open:

`js/config.js`

Set:

- `assistanceHubUrl`
- `robloxHorizonUrl`
- `robloxTheGameUrl`

The Assistance Hub button intentionally does not use a fake Discord invitation.

## ANVA Hub likes and views

This project is intentionally frontend-only.

There is no backend/API, so the site does **not** pretend that likes and views are global.

- Likes are stored in `localStorage` on the visitor's device.
- View counts are stored in `localStorage` on the visitor's device.
- A post is counted once per browser session when it becomes substantially visible.
- Share uses the Web Share API when available and falls back to copying the direct post URL.

The code is structured so a real persistence API can be added later through `js/config.js`.

## Edit content

The main editable content is in:

`js/data.js`

That file contains:

- Company cards
- Assistance Hub feature list
- Status services
- Events
- ANVA Hub posts

## Add a Hub post

Add another item to `hubPosts` in `js/data.js`.

Use a unique `id`, because direct share links are generated as:

`#hub/post/your-post-id`

## Design

The site uses:

- white/off-white surfaces
- charcoal typography
- rounded cards
- selective Liquid Glass
- local SVG icons
- smooth tab transitions
- responsive mobile navigation
- `prefers-reduced-motion` support

No external fonts, icon CDN, JavaScript library or CSS framework is required.
