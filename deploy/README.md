# Isolated Vercel preview

This config is intentionally **not** named `vercel.json` at the repository root. It only applies when explicitly selected, so it does not change an existing project's Git deployment configuration. No custom domain should be assigned.

The Vite base remains `/app/`. The preview redirects `/` to `/app/`, serves `/app/assets/*` from the build's assets directory, and rewrites `/app/` child routes to the SPA index. UI code and the Chrome extension are unchanged. Only the web workspace is deployed; the extension's production link is unchanged.

## Create a separate free project

Use a local terminal with this repository and Node.js 24 available:

```sh
npm ci
npm run typecheck
npm run build
npx vercel login
```

From the **repository root**, confirm that there is no `.vercel/project.json`. If one exists, use a fresh clone of `travis-winkler/multilist0` and copy this `deploy` folder into it. Do not delete or replace an existing project link.

```sh
npx vercel deploy --local-config deploy/vercel.preview.json
```

Answer the prompts:

1. Set up and deploy: **Yes**.
2. Select your personal **Hobby** account (free, subject to Vercel's eligibility and usage terms).
3. Link to an existing project: **No**.
4. Project name: **multilist-ui-preview** (choose a new unique name if that name already exists in your account).
5. Code directory: **./** (the repository root).
6. Keep the install/build/output settings from the supplied configuration; do not override them.

Do not select the `multilist.pro` project. Do not run `vercel domains add`, change DNS, or assign `multilist.pro`. This command creates a preview deployment and prints its exact generated `https://...vercel.app` URL. Do not guess a hostname from the project name.

If Vercel offers Git linking, it is not needed for this CLI preview; skip it. Subsequent deployments must continue to pass `--local-config deploy/vercel.preview.json`.

## Verify the live URL

Open the exact generated URL in a browser. It must redirect to `/app/` and render the MultiList overview. Then:

- Open `/app/tasks`, `/app/settings`, `/app/account`, and `/app/connection` directly and refresh each page.
- Check that JavaScript/CSS requests under `/app/assets/` return 200 with the correct content type, without console errors.
- Toggle Disable animations, refresh, and confirm persistence. Reset settings afterward.
- Confirm the extension remains explicitly not connected and no Depop task is represented as running.

For external verification, if Vercel's Deployment Protection prompts for login, change Deployment Protection **only on the newly created preview project** to allow public access, or share access through Vercel. Never change the existing website project's settings. Share the generated URL for independent live verification. A successful local build is not a verified deployment.
