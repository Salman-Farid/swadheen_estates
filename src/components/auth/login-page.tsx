'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { LoginForm } from '@/components/auth/login-form'
import { useLocale } from '@/i18n/locale-provider'

export function LoginPageContent({ nextPath }: { nextPath: string }) {
  const { t } = useLocale()
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink text-paper lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,hsl(var(--terracotta)/.35),transparent_45%),linear-gradient(145deg,#161c21,#293934)]" />
        <div className="absolute -bottom-24 -left-20 h-[32rem] w-[32rem] rounded-full border border-white/10" />
        <div className="absolute -bottom-12 -left-8 h-[20rem] w-[20rem] rounded-full border border-white/10" />
        <div className="relative flex h-full flex-col p-12">
          <Logo inverse />
          <div className="flex flex-1 items-center">
            <div className="max-w-md">
              <p className="eyebrow text-gold">{t('yourPrivateSpace')}</p>
              <h1 className="display-type mt-5">
                {t('login.detailsTitle')}
                <br />
                <em className="font-normal text-gold">{t('login.detailsTitle2')}</em>
              </h1>
              <p className="mt-6 text-sm leading-7 text-paper/55">{t('login.panelCopy')}</p>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[.18em] text-paper/35">Swadheen Estates · Dhaka</p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-ink/50">
              <ArrowLeft className="h-3.5 w-3.5" /> {t('backToSite')}
            </Link>
            <span className="lg:hidden">
              <Logo />
            </span>
          </div>
          <div className="mt-14">
            <p className="eyebrow">{t('login.welcomeBack')}</p>
            <h2 className="display-type mt-4">
              {t('login.continueTitle1')}
              <br />
              <em className="font-normal text-terracotta">{t('login.continueTitle2')}</em>
            </h2>
            <p className="mt-5 text-sm leading-6 text-ink/55">{t('login.signInCopy')}</p>
            <div className="mt-8">
              <LoginForm nextPath={nextPath} />
            </div>
            <p className="mt-8 text-center text-xs text-ink/45">
              {t('login.newToSwadheen')}{' '}
              <Link
                href={`/register?next=${encodeURIComponent(nextPath)}`}
                className="font-bold text-terracotta"
              >
                {t('profile.createAccount')} <ArrowUpRight className="ml-1 inline h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
