# University Platform JDD Upload Package

Upload `university-platform-0.3.0-source.zip` from this directory in:

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

Version `0.3.0` uses an application-owned session when launched through JDD.
The application slug is derived dynamically from the artifact URL. Login,
session lookup, and logout use:

```text
POST /app-api/apps/:appSlug/auth/login
GET  /app-api/apps/:appSlug/auth/session
POST /app-api/apps/:appSlug/auth/logout
```

After logout, the browser remains on the current release at `#/login`. JDD must
implement this generic contract and issue a secure application-session cookie;
the University frontend does not require a JDD dashboard session.

Use `university-platform-0.3.0-source.sha256` to verify the ZIP before uploading.
