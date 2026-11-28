'use client'

import { CheckCircle2, Clock3, Mail, MessageCircle, Phone, Send, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { Property } from '@/types/property'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { useLocale } from '@/i18n/locale-provider'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function EnquiryCard({ property }: { property: Property }) {
  const { t } = useLocale()
  const [state, setState] = useState<FormState>('idle')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('submitting')
    setError('')
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        email,
        note,
        propertyId: property.id,
        propertySlug: property.slug,
        honeypot: '',
      }),
    })
    if (!response.ok) {
      const result: { error?: string } = await response.json().catch(() => ({}))
      setError(result.error ?? t('form.sendError'))
      setState('error')
      return
    }
    setState('success')
  }

  return (
    <aside className="self-start rounded-panel border border-line bg-stone p-5 shadow-soft sm:p-6 lg:sticky lg:top-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{t('privateViewings')}</p>
          <p className="numeric mt-2 text-2xl font-extrabold">{formatPrice(property.price)}</p>
          <p className="mt-1 text-xs text-ink/50">
            {t('guidePrice')} · {property.area.toLocaleString()} {property.areaUnit}
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-terracotta">
          <MessageCircle className="h-5 w-5" />
        </span>
      </div>
      {state === 'success' ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--available)/.12)] text-[hsl(var(--available))]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="display-type mt-5 text-3xl">{t('enquiry.successTitle')}</h3>
          <p className="mt-3 text-sm leading-6 text-ink/60">{t('enquiry.successCopy')}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setState('idle')
              setName('')
              setPhone('')
              setEmail('')
              setNote('')
            }}
          >
            {t('form.sendAnotherRequest')}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="sr-only">{t('form.yourName')}</span>
            <input
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('form.yourName')}
              className="h-12 w-full rounded-xl border border-line bg-paper px-4 text-sm outline-none transition placeholder:text-ink/40 focus:border-terracotta"
            />
          </label>
          <label className="block">
            <span className="sr-only">{t('form.phoneNumber')}</span>
            <input
              required
              minLength={7}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t('form.phoneNumber')}
              type="tel"
              className="h-12 w-full rounded-xl border border-line bg-paper px-4 text-sm outline-none transition placeholder:text-ink/40 focus:border-terracotta"
            />
          </label>
          <label className="block">
            <span className="sr-only">{t('form.email')}</span>
            <input
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('form.email')}
              type="email"
              className="h-12 w-full rounded-xl border border-line bg-paper px-4 text-sm outline-none transition placeholder:text-ink/40 focus:border-terracotta"
            />
          </label>
          <label className="block">
            <span className="sr-only">{t('form.whatToKnow')}</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('form.whatToKnow')}
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-ink/40 focus:border-terracotta"
            />
          </label>
          <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website" />
          <Button type="submit" size="lg" className="w-full" disabled={state === 'submitting'}>
            {state === 'submitting' ? (
              t('enquiry.sending')
            ) : (
              <>
                {t('enquiry.arrangeViewing')} <Send className="h-4 w-4" />
              </>
            )}
          </Button>
          {state === 'error' && (
            <p role="alert" className="text-xs font-semibold text-danger">
              {error}
            </p>
          )}
          <p className="flex items-start gap-2 pt-1 text-[11px] leading-4 text-ink/45">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss" />
            {t('form.privacyNote')}
          </p>
        </form>
      )}
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-5">
        <a
          href="tel:+8801810774478"
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-paper py-3 text-xs font-bold transition hover:border-terracotta hover:text-terracotta"
        >
          <Phone className="h-3.5 w-3.5" /> {t('callUs')}
        </a>
        <a
          href="https://wa.me/8801810774478"
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-paper py-3 text-xs font-bold transition hover:border-moss hover:text-moss"
        >
          <MessageCircle className="h-3.5 w-3.5" /> {t('whatsapp')}
        </a>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-ink/45">
        <Clock3 className="h-3.5 w-3.5" /> {t('form.replyTime')}
      </div>
    </aside>
  )
}

