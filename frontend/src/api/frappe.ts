export type UniversitySession = {
  user: string
  fullName: string
  initials: string
  roles: string[]
  roleLabel: string
}

export type FrappeRow = Record<string, unknown>

function messageOf(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    if ('message' in payload && payload.message) return String(payload.message)
    if ('exception' in payload && payload.exception) return String(payload.exception).replace(/^.*?:\s*/, '')
  }
  return fallback
}

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...init })
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
    const payload = await jsonRequest<{ message: { user: string; roles: string[] } }>('/api/method/ugandan_university_education.ugandan_university_education.api.get_user_info')
    if (!payload.message?.user || payload.message.user === 'Guest') throw new Error('Not signed in')
    return toSession(payload.message.user, payload.message.roles ?? [])
  },
  async login(identifier: string, password: string) {
    const body = new URLSearchParams({ usr: identifier, pwd: password })
    await jsonRequest('/api/method/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    return this.me()
  },
  async logout() {
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
