# University Platform JDD Upload Package

Upload `university-platform-0.3.2-source.zip` from this directory in:

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

Version `0.3.2` uses an application-owned session when launched through JDD
and explicitly opts into it with `authenticationMode: "application-session"`.
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

Use `university-platform-0.3.2-source.sha256` to verify the ZIP before uploading.

## Revocable business links

After publishing and assigning the application to a business, an administrator
can create a long-lived shared link from the business's ERPNext credentials
panel. The link is scoped to that business and release channel. It creates an
application-owned session automatically; recipients do not need a JDD
dashboard login or an ERPNext password.

The raw token is shown only when the link is created. Use `Revoke` in the same
panel to invalidate the link and its active application sessions immediately.
Anyone who receives the link can use its configured application access, so
share it securely.
