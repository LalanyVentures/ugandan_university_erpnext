export type UniversitySession = {
  user: string
  fullName: string
  initials: string
  roles: string[]
  roleLabel: string
}

export type FrappeRow = Record<string, unknown>

export type UniversityApiContract = {
  ok: true
  appSlug: string
  entities: Record<string, { label: string; doctype: string; fields: { read: string[] }; searchFields: string[]; actions: string[]; relations: string[] }>
  limits: { defaultPageSize: number; maxPageSize: number; allowedPageSizes: number[]; exportAsyncThreshold: number; maxImportBytes: number }
  errors: Record<string, string>
  auditEvents: string[]
}

let launchToken = new URLSearchParams(window.location.search).get('launchToken')
const appPathMatch = window.location.pathname.match(/\/app-api\/apps\/([^/]+)\//)
const appSlug = appPathMatch ? decodeURIComponent(appPathMatch[1]) : null

export function isJddRuntime() {
  return Boolean(appSlug)
}

function jddAuthUrl(action: 'login' | 'session' | 'logout' | 'bootstrap') {
  if (!appSlug) throw new Error('JDD could not determine the application from this URL.')
  return `/app-api/apps/${encodeURIComponent(appSlug)}/auth/${action}`
}

function requestUrl(url: string) {
  if (!isJddRuntime() || !url.startsWith('/api/')) return url
  return `/app-api/apps/${encodeURIComponent(appSlug!)}/erpnext${url}`
}

export async function fetchUniversityApiContract(): Promise<UniversityApiContract> {
  if (!isJddRuntime() || appSlug !== 'university-platform') throw new Error('The University API contract is only available in the JDD University runtime.')
  return jsonRequest<UniversityApiContract>(`/app-api/apps/${encodeURIComponent(appSlug)}/university/contract`)
}

function clearLaunchToken() {
  if (!launchToken) return
  const current = new URL(window.location.href)
  current.searchParams.delete('launchToken')
  window.history.replaceState(window.history.state, '', `${current.pathname}${current.search}${current.hash}`)
  launchToken = null
}

function messageOf(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    if ('message' in payload && payload.message && typeof payload.message !== 'object') return String(payload.message)
    if ('error' in payload && payload.error) return String(payload.error)
    if ('detail' in payload && payload.detail) return String(payload.detail)
    if ('exception' in payload && payload.exception) return String(payload.exception).replace(/^.*?:\s*/, '')
  }
  return fallback
}

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (launchToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${launchToken}`)
  }
  const response = await fetch(requestUrl(url), {
    ...init,
    credentials: 'include',
    headers,
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(messageOf(payload, 'The request could not be completed.'))
  return payload as T
}

function roleLabel(roles: string[]) {
  if (roles.includes('System Manager')) return 'AWU Administrator'
  if (roles.includes('Registrar')) return 'Academic Registrar'
  if (roles.includes('Faculty Head')) return 'Faculty Head'
  if (roles.includes('Academics User')) return 'Registrar / Academic Affairs'
  if (roles.includes('Instructor')) return 'Lecturer'
  if (roles.includes('Accounts Manager') || roles.includes('Accounts User')) return 'Finance Officer'
  if (roles.includes('Student')) return 'Student'
  return 'AWU Staff'
}

function toSession(user: string, roles: string[]): UniversitySession {
  const fullName = user === 'Administrator' ? 'AWU Administrator' : user.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, value => value.toUpperCase())
  const initials = fullName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
  return { user, fullName, initials, roles, roleLabel: roleLabel(roles) }
}

export const authApi = {
  async me() {
    if (isJddRuntime()) {
      let payload: {
        message?: { user?: string; roles?: string[] }
        session?: { user?: string; roles?: string[] }
        user?: string
        roles?: string[]
      }
      try {
        payload = await jsonRequest<typeof payload>(jddAuthUrl('session'))
      } catch (cause) {
        if (!launchToken) throw cause
        return this.bootstrap()
      }
      const session = payload.session ?? payload.message ?? payload
      if (!session.user || session.user === 'Guest') throw new Error('Not signed in')
      return toSession(session.user, session.roles ?? [])
    }
    const payload = await jsonRequest<{ message: { user: string; roles: string[] } }>('/api/method/ugandan_university_education.ugandan_university_education.api.get_user_info')
    if (!payload.message?.user || payload.message.user === 'Guest') throw new Error('Not signed in')
    return toSession(payload.message.user, payload.message.roles ?? [])
  },
  async bootstrap() {
    if (!isJddRuntime()) throw new Error('Application bootstrap is only available in JDD runtime.')
    const payload = await jsonRequest<{
      session?: { user?: string; roles?: string[] }
      message?: { user?: string; roles?: string[] }
    }>(jddAuthUrl('bootstrap'), { method: 'POST' })
    clearLaunchToken()
    const session = payload.session ?? payload.message
    if (!session?.user) throw new Error('JDD could not create the shared application session.')
    return toSession(session.user, session.roles ?? [])
  },
  async login(identifier: string, password: string) {
    if (isJddRuntime()) {
      const payload = await jsonRequest<{
        message?: { user?: string; roles?: string[] }
        session?: { user?: string; roles?: string[] }
        user?: string
        roles?: string[]
      }>(jddAuthUrl('login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      clearLaunchToken()
      const session = payload.session ?? payload.message ?? payload
      if (session.user && session.user !== 'Guest') return toSession(session.user, session.roles ?? [])
      return this.me()
    }
    const body = new URLSearchParams({ usr: identifier, pwd: password })
    await jsonRequest('/api/method/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    return this.me()
  },
  async logout() {
    if (isJddRuntime()) {
      await jsonRequest(jddAuthUrl('logout'), { method: 'POST' })
      return
    }
    await jsonRequest('/api/method/logout', { method: 'POST' })
  },
}

export async function fetchList(doctype: string, fields: string[], filters?: unknown, limit = 1000): Promise<FrappeRow[]> {
  const query = new URLSearchParams({ fields: JSON.stringify(fields), limit_page_length: String(limit), order_by: 'modified desc' })
  if (filters) query.set('filters', JSON.stringify(filters))
  const payload = await jsonRequest<{ data: FrappeRow[] }>(`/api/resource/${encodeURIComponent(doctype)}?${query}`)
  return payload.data ?? []
}

export async function fetchDocument(doctype: string, name: string): Promise<FrappeRow> {
  const payload = await jsonRequest<{ data: FrappeRow }>(`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`)
  return payload.data
}

export async function updateDocument(doctype: string, name: string, values: FrappeRow): Promise<FrappeRow> {
  const payload = await jsonRequest<{ data: FrappeRow }>(`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  return payload.data
}

export async function callMethod<T>(method: string, args?: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(args ?? {})
  const payload = await jsonRequest<{ message: T }>(`/api/method/${method}${query.size ? `?${query}` : ''}`)
  return payload.message
}

export function ugx(value: unknown) {
  return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(Number(value ?? 0))
}
