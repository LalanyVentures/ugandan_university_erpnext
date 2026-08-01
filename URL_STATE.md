# University frontend URL-state contract

HashRouter paths select the page. Query parameters provide two deliberately separate layers of state: persistent role scope and page-specific workbench state.

## Role scope

Role filters use `scope.<field>` parameters, for example `scope.semester`, `scope.programme`, `scope.status`, `scope.page`, and `scope.pageSize`. Student, Lecturer, Faculty Head, Registrar, and Finance providers derive their filters from these parameters. Empty/default values are omitted.

Role scope survives navigation between related pages. It never contains a tenant, business, ERPNext site, role, or permission identifier.

## Data workbench

| Parameter | Meaning |
|---|---|
| `q` | Debounced entity search |
| `filters` | JSON array of server-supported `{field,operator,value}` filters |
| `sort` / `order` | Sort field and `asc`/`desc` order |
| `page` / `pageSize` | Page and 25, 50, 100, or 2000 rows |
| `columns` | Ordered comma-separated visible-column allowlist |
| `density` | `compact`, `comfortable`, or `spacious` |
| `panel` | Open `filters` or `columns` manager |
| `record` | Open record drawer by immutable record name |

Changing a primary page or contextual tab clears page-specific workbench state while preserving `scope.*`. Changing only a sub-sub-tab retains the current table state. Record opening creates a navigable URL; closing removes `record`. Search input also synchronises from URL changes, so browser Back/Forward is authoritative.
