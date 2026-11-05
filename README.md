# Multilist0

React + TypeScript web app and Chrome Manifest V3 extension, managed with npm workspaces. Requires Node.js 24 (see `.nvmrc`) and npm.

## Setup

```sh
npm ci
npm run typecheck
npm run build
```

## Web app

Run `npm run dev` from the repository root. Vite serves the app on port 5173 by default.

## Chrome extension

Run `npm run build`, then open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `apps/extension/dist`. Click the extension action to open its popup.

For development, run `npm run dev:extension` to rebuild on changes. Reload the extension in Chrome after changes. The extension requests no permissions and has no backend dependency.

## Structure

- `apps/web`: web app
- `apps/extension`: extension popup and manifest

These are minimal starters; product features, backend, authentication, and automated feature tests have not been implemented.
