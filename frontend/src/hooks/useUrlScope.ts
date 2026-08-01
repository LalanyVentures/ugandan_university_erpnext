import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Keeps role-level filters shareable while preserving unrelated route parameters. */
export function useUrlScope<T extends object>(defaults: T, prefix = 'scope.') {
  const [params, setParams] = useSearchParams()
  const signature = [...params.entries()].filter(([key]) => key.startsWith(prefix)).map(([key, value]) => `${key}=${value}`).join('&')
  const scope = useMemo(() => Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => {
    const value = params.get(`${prefix}${key}`)
    if (value == null || value === '') return [key, fallback]
    return [key, typeof fallback === 'number' ? Number(value) || fallback : value]
  })) as T, [signature, defaults, prefix]) // eslint-disable-line react-hooks/exhaustive-deps

  function setScope(patch: Partial<T>) {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => {
      const parameter = `${prefix}${key}`
      if (value == null || value === '' || value === defaults[key as keyof T]) next.delete(parameter)
      else next.set(parameter, String(value))
    })
    setParams(next, { replace: true })
  }

  return [scope, setScope] as const
}
