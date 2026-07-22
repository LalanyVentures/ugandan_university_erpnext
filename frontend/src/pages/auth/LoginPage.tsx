import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { authApi, type UniversitySession } from '../../api/frappe'
import styles from './LoginPage.module.css'

export function LoginPage({ onLogin }: { onLogin: (session: UniversitySession) => void }) {
  const [identifier, setIdentifier] = useState(() => localStorage.getItem('university.remembered-user') ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const session = await authApi.login(identifier.trim(), password)
      if (remember) localStorage.setItem('university.remembered-user', identifier.trim())
      else localStorage.removeItem('university.remembered-user')
      onLogin(session)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginShell}>
        <section className={styles.welcomePanel}>
          <div className={styles.pattern} aria-hidden="true" />
          <div className={styles.universitySeal}><span className={styles.logoHolding}><img src="/awu-logo.png" alt="Ankole Western University crest" /></span><span><strong>Ankole Western University</strong><small>Light of the World</small></span></div>
          <div className={styles.welcomeCopy}>
            <span>AWU ACADEMIC SERVICES</span>
            <h1>Your university.<br />Your academic journey.</h1>
            <p>Admissions, teaching, assessment, student finance and transcripts in one secure Ankole Western University workspace.</p>
          </div>
        </section>

        <section className={styles.loginFormPanel}>
          <form className={styles.loginCard} onSubmit={submit}>
            <div className={styles.titleRow}>
              <div className={styles.iconWrap}><LockKeyhole size={18} /></div>
              <div><h2>Welcome to AWU</h2><p>Use the account issued by Ankole Western University.</p></div>
            </div>
            {error ? <div className={styles.error} role="alert">{error}</div> : null}
            <label className={styles.field}>
              <span>Username or email</span>
              <div className={styles.inputShell}><UserRound size={16} /><input value={identifier} onChange={event => setIdentifier(event.target.value)} autoComplete="username" placeholder="name@awu.ac.ug" required /></div>
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <div className={styles.passwordWrap}>
                <div className={styles.inputShell}><LockKeyhole size={16} /><input value={password} onChange={event => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required /></div>
                <button type="button" className={styles.iconButton} onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </label>
            <label className={styles.rememberRow}><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} /><span>Remember this device</span></label>
            <button type="submit" className={styles.submitButton} disabled={loading}><span>{loading ? 'Signing in…' : 'Sign in'}</span><ArrowRight size={16} /></button>
            <p className={styles.footerNote}>Ankole Western University · Secure academic services</p>
          </form>
        </section>
      </div>
    </main>
  )
}
