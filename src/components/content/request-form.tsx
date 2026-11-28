'use client'

import { CheckCircle2, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n/locale-provider'

export function RequestForm() {
  const { t } = useLocale()
  const requestTypes = [
    t('request.type.enquiry'),
    t('request.type.siteVisit'),
    t('request.type.requestProperty'),
    t('request.type.sellWithUs'),
  ]
  const [step, setStep] = useState(1)
  const [type, setType] = useState(requestTypes[0] ?? '')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [values, setValues] = useState({ name: '', email: '', phone: '', location: '', budget: '', note: '' })

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        note: `${type}. Location: ${values.location}. Budget: ${values.budget}. ${values.note}`,
        honeypot: '',
      }),
    })
    setStatus(response.ok ? 'success' : 'error')
  }

  if (status === 'success')
    return (
      <div className="rounded-panel border border-line bg-paper p-8 text-center shadow-soft sm:p-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--available)/.12)] text-[hsl(var(--available))]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="eyebrow mt-7">{t('request.received')}</p>
        <h2 className="display-type mt-3 text-5xl">{t('request.successTitle')}</h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-ink/60">
          {t('request.successCopy', { name: values.name.split(' ')[0] || t('request.there') })}
        </p>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => {
            setStatus('idle')
            setStep(1)
          }}
        >
          {t('form.sendAnotherRequest')}
        </Button>
      </div>
    )

  return (
    <form onSubmit={submit} className="rounded-panel border border-line bg-paper p-5 shadow-soft sm:p-8">
      <div className="flex items-center justify-between border-b border-line pb-5">
        <div>
          <p className="eyebrow">{t('form.stepOf', { step, total: 2 })}</p>
          <p className="mt-2 text-lg font-bold">{step === 1 ? t('request.step1Title') : t('request.step2Title')}</p>
        </div>
        <div className="flex w-28 gap-1.5 sm:w-36">
          <span className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-terracotta' : 'bg-line'}`} />
          <span className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-terracotta' : 'bg-line'}`} />
        </div>
      </div>
      {step === 1 ? (
        <div className="mt-7 space-y-6">
          <fieldset>
            <legend className="text-xs font-bold">{t('request.helpHeading')}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {requestTypes.map((item) => (
                <label
                  key={item}
                  className={`cursor-pointer rounded-xl border p-4 text-sm font-semibold transition ${type === item ? 'border-terracotta bg-terracotta/5 text-terracotta' : 'border-line hover:bg-stone'}`}
                >
                  <input
                    type="radio"
                    name="request-type"
                    value={item}
                    checked={type === item}
                    onChange={() => setType(item)}
                    className="sr-only"
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold">{t('request.preferredLocation')}</span>
              <input
                value={values.location}
                onChange={(event) => update('location', event.target.value)}
                required
                placeholder={t('request.locationPlaceholder')}
                className="mt-2 h-12 w-full rounded-xl border border-line bg-stone px-4 text-sm outline-none focus:border-terracotta"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold">{t('request.comfortableBudget')}</span>
              <input
                value={values.budget}
                onChange={(event) => update('budget', event.target.value)}
                required
                placeholder={t('request.budgetPlaceholder')}
                className="mt-2 h-12 w-full rounded-xl border border-line bg-stone px-4 text-sm outline-none focus:border-terracotta"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold">
              {t('request.moreDetail')} <span className="font-normal text-ink/40">{t('request.optional')}</span>
            </span>
            <textarea
              value={values.note}
              onChange={(event) => update('note', event.target.value)}
              rows={4}
              placeholder={t('request.notePlaceholder')}
              className="mt-2 w-full resize-none rounded-xl border border-line bg-stone px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          </label>
          <Button type="button" size="lg" className="w-full" onClick={() => setStep(2)}>
            {t('form.continue')} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-7 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold">{t('form.yourName')}</span>
              <input
                value={values.name}
                onChange={(event) => update('name', event.target.value)}
                required
                minLength={2}
                placeholder={t('request.fullNamePlaceholder')}
                className="mt-2 h-12 w-full rounded-xl border border-line bg-stone px-4 text-sm outline-none focus:border-terracotta"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold">{t('form.phoneNumber')}</span>
              <input
                value={values.phone}
                onChange={(event) => update('phone', event.target.value)}
                required
                minLength={7}
                placeholder="+880…"
                type="tel"
                className="mt-2 h-12 w-full rounded-xl border border-line bg-stone px-4 text-sm outline-none focus:border-terracotta"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold">{t('form.email')}</span>
            <input
              value={values.email}
              onChange={(event) => update('email', event.target.value)}
              required
              type="email"
              placeholder="you@example.com"
              className="mt-2 h-12 w-full rounded-xl border border-line bg-stone px-4 text-sm outline-none focus:border-terracotta"
            />
          </label>
          <div className="rounded-xl bg-stone p-4 text-xs leading-5 text-ink/55">
            <ShieldCheck className="mr-2 inline h-4 w-4 text-moss" />
            {t('request.privacyNote')}
          </div>
          {status === 'error' && (
            <p role="alert" className="text-xs font-semibold text-danger">
              {t('form.somethingWentWrong')}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4" /> {t('form.back')}
            </Button>
            <Button type="submit" size="lg" disabled={status === 'sending'}>
              {status === 'sending' ? t('form.sendingSecurely') : t('request.sendMyRequest')}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
