'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { adminPasswordLogin, type AdminLoginState } from './actions'

const initialState: AdminLoginState = {}

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminPasswordLogin, initialState)
  const [visible, setVisible] = useState(false)

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-left">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink/50">পাসওয়ার্ড</span>
        <span className="relative block">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            name="password"
            type={visible ? 'text' : 'password'}
            required
            autoFocus
            autoComplete="current-password"
            placeholder="আপনার পাসওয়ার্ড"
            className="w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-12 text-base text-ink shadow-soft outline-none transition placeholder:text-ink/35 focus:border-gold"
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink/40 transition hover:text-ink"
          >
            {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </span>
      </label>
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-ink py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-ink/85 disabled:opacity-60"
      >
        {pending ? 'যাচাই হচ্ছে…' : 'লগইন'}
      </button>
    </form>
  )
}
