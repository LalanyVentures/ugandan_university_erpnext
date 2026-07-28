# University Platform JDD Upload Package

Upload `university-platform-0.2.2-source.zip` from this directory in:

`Admin > Frontend applications > Application File Manager > Upload ZIP`

The archive is a source package. JDD validates `jdd-app.json`, installs locked npm
dependencies in the isolated build worker, runs `npm run build:jdd`, and creates an
immutable release.

## Deploy

1. Upload the source ZIP.
2. Open the uploaded `University Platform` revision.
3. Select `Build`.
4. Promote the successful release to `stable`.
5. Open `Releases`.
6. Choose the target ERPNext instance by business, site, and public URL.
7. Select `Assign`.

The selected business assignment is the source of truth for the ERPNext instance.
Do not add ERPNext API keys, API secrets, passwords, `.env` files, or physical
tenant credentials to this archive.

## Included

- React and TypeScript source
- Public application assets
- `package.json` and `package-lock.json`
- JDD-specific Vite build configuration
- `jdd-app.json`

## Excluded

- `node_modules`
- `dist`
- Frappe build output
- Git history
- environment and credential files

Version `0.2.2` disables ERPNext password login when the application is launched
through JDD. It uses the JDD launch token and server-side ERPNext integration,
and shows a retryable integration error instead of a password form when launch
session initialization fails. JDD logout now clears the dashboard member and
platform browser sessions and redirects to `/dashboard/login`. The error page
also provides Return to Dashboard and Sign out actions.

Use `university-platform-0.2.2-source.sha256` to verify the ZIP before uploading.
