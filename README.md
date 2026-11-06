# MultiList

A React + TypeScript control center for Depop sellers with a separate Chrome Manifest V3 companion. This is the **interface stage**, adapted from the provided desktop prototype with a responsive left sidebar and MultiList's cream, espresso, tan, caramel, and taupe palette.

## Develop

Requires Node.js 24 (see `.nvmrc`) and npm.

```sh
npm ci
npm run dev
```

The web workspace is served at `/app/` on Vite's reported port. Navigation supports `/app/actions`, `/app/tasks`, `/app/settings`, `/app/account`, and `/app/connection`, `/app/help`, `/app/documentation`, `/app/privacy`, and `/app/terms`, including direct entry and browser back/forward.

```sh
npm run typecheck
npm run build
```

Both commands cover both workspaces. Production output lives in `apps/web/dist` and `apps/extension/dist`. Build the extension before running the browser tests.

## Browser tests

```sh
npx playwright install chromium
npm run test:e2e
```

Alternatively use an installed Chromium: `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`. Tests run the web server on port 5174 and the extension build preview on port 5175, or reuse existing servers locally. Tests cover navigation, unavailable-action dialogs, local preference persistence/reset, draft creation/deletion, corrupt storage recovery, responsive widths, and rendering the actual extension build in Chromium and checking its manifest.

## Chrome extension

Run `npm run build`. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `apps/extension/dist`. Click its action to open the informational popup. Run `npm run dev:extension` for continuous builds; reload the extension after changes.

Unpacked extension installation could not be verified in this machine’s Chromium: command-line loading was ignored and the extension-loading protocol was unavailable. A manual Chrome load remains required; HTTP popup rendering does not verify browser extension installation.

The popup links to `https://multilist.pro/app/`. That destination requires separate web deployment; the link does not establish that the app is deployed. The extension requests no permissions, does not access Depop tabs, and does not message the web app yet.

## Implemented and planned

| Capability | Current behavior |
| --- | --- |
| Home | Welcome banner, Revenue / Revenue with MultiList / Sales cards, with a compact weekly sales view |
| Actions | Expandable Listings, Likes, Followers, and Messages; action buttons explain unavailable capabilities |
| Navigation | Responsive sidebar, mobile menu, URL navigation and browser history |
| Tasks | Empty All/Active/Scheduled/Completed views; no fabricated task results |
| Schedule drafts | Create/delete browser-local drafts; never enabled, queued, or executed |
| Settings | Animation toggle, timing preferences, smart-speed preference, and reset; stored locally |
| Account | Explicit unsigned-in status; account and subscription actions explain limitations |
| Connection | Installation detection unavailable; disconnected extension/Depop states; Connect reports a real unsupported-operation error; Disconnect disabled with no connection |
| Top-right Depop account | Accessible disclosure with separate logout notices; no profile is injected. The reusable component accepts verified profile data for a future integration, but none is available today |
| Footer | Help, Documentation, Privacy Policy, and Terms & Conditions across all pages; legal pages are unpublished placeholders |
| Chrome popup | Branded informational popup; built assets rendered in Chromium over HTTP |
| Authentication and billing | Not implemented; logout controls explain there is no session/account to change |
| App/extension bridge | Not implemented; no secure pairing or live status synchronization |
| Depop listing and social actions | Not implemented; each action requires support verification and tested execution |
| Active scheduling | Not implemented; drafts are not tasks |

Settings use `multilist.settings.v1`; schedule drafts use `multilist.drafts.v1` in localStorage. No credentials or account data are stored. Preferences and drafts are not synchronized across browsers. If browser storage is unavailable, changes are session-only and a message explains this.

## Deployment boundary: preserve existing website

No production deployment or changes to the existing landing page, waitlist, or legal pages are included. Those pages are not in this checkout. Deploy this web build **only under `/app/`**, leaving all other site routes and existing services intact. Configure assets under `/app/assets/` and an SPA fallback for `/app/` and its child routes to the app's index. Do not use a domain-wide fallback or replace an existing root index. The Vite base is `/app/`; deploying at the site root is not supported by this configuration.

Before a later integration stage, implement and test authenticated pairing, an exact trusted-origin allowlist, validated/versioned messages, session handling, permissions, task IDs and acknowledgements, retries/cancellation, and consistent actual task states. No execution bridge is included in this interface stage.

## Structure

- `apps/web/src/App.tsx`: workspace views and navigation
- `apps/web/src/components`: reusable icons and accessible modal dialog
- `apps/web/src/model.ts`: validated local storage and settings defaults
- `apps/extension`: independently built Chrome popup and manifest
- `tests`: browser workflow and extension tests

The account disclosure supports Enter/Space to open, Tab through actions, Escape to close and restore focus, and outside-click dismissal. No credentials or tokens are stored or sent. Separate MultiList logout and Depop disconnect require separate future session integrations; neither is simulated. Nine browser tests currently cover the interface and built popup. Existing hosted legal pages and the landing site are untouched.

Branding uses the supplied m+ logo restored as `apps/web/public/multilist-logo.png`, shared by the sidebar and favicon. Actions groups start collapsed on load and on return to Actions. The setup card opens the sidebar’s Depop Connection page (`/app/account`) and hides only when the App receives a verified Depop profile; the current entry point supplies none. No local flag can simulate a connection. The top-right Interface Preview button discloses current integration limitations.

Home includes a welcome banner with the current browser-local date (for example, Tuesday, October 5). A future verified profile can supply a display name and photo; disconnected users see no fabricated identity. Page and action-section descriptions are accessible through circled info buttons with keyboard/Escape and outside-click dismissal. The shared footer and top bar use compact, consistent sizing. The favicon uses a separate rounded-corner version of the supplied mark.

Analytics (`/app/analytics`) includes revenue with/without MultiList, listings created with/without MultiList, and total sales since installation. Metrics currently show unavailable values because no sales feed, listing provenance, currency, or installation timestamp has been integrated. Unknown provenance must not be counted as “without MultiList.” Home contains exactly three metric cards; its Sales card defaults to the current Monday–Sunday week. Choosing Month, Q1, Q2, Q3, Q4, or Year opens that period in Analytics. Analytics uses daily buckets for Week/Month and monthly buckets for calendar quarters/Year. Period selections are retained in the URL for refresh and back/forward navigation. The monthly chart can render supplied recorded daily counts; unavailable and future buckets are never represented as zero. The current app supplies no counts. No installation date is inferred from browser storage or first visit.

On desktop viewports at least 681px wide and 700px tall, Home’s three metric cards stretch to fill the available viewport while retaining the welcome banner and footer. Smaller/shorter screens retain natural scrolling rather than hiding content. Disconnected profile labels in the banner and header are Connect your Depop buttons leading to /app/account; account options remain separately accessible. These buttons do not establish a real connection.
