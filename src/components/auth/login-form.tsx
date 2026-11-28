'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n/locale-provider'

export function LoginForm({ nextPath }: { nextPath: string }) {
  const { t } = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false, callbackUrl: nextPath })
    if (result?.error) {
      setError(t('form.loginError'))
      setPending(false)
      return
    }
    window.location.assign(nextPath)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-bold">{t('form.email')}</span>
        <div className="relative mt-2">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-12 w-full rounded-xl border border-line bg-stone pl-11 pr-4 text-sm outline-none focus:border-terracotta"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-xs font-bold">{t('form.password')}</span>
        <div className="relative mt-2">
          <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            required
            minLength={8}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('form.passwordHint')}
            className="h-12 w-full rounded-xl border border-line bg-stone pl-11 pr-12 text-sm outline-none focus:border-terracotta"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/45"
            aria-label={showPassword ? t('a11y.hidePassword') : t('a11y.showPassword')}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>
      {error && (
        <p role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          t('form.verifying')
        ) : (
          <>
            {t('form.continue')} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      <p className="flex items-start gap-2 pt-2 text-[11px] leading-4 text-ink/45">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss" />
        {t('form.sessionNote')}
      </p>
    </form>
  )
}
