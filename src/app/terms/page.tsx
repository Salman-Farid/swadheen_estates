'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/i18n/locale-provider'

export default function TermsPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl container-shell py-16 sm:py-24">
        <p className="eyebrow">{t('legal')}</p>
        <h1 className="display-type mt-4">{t('terms.title')}</h1>
        <div className="mt-10 max-w-none text-sm leading-8 text-ink/65">
          <p>{t('terms.p1')}</p>
          <h2 className="display-type mt-10 text-ink">{t('terms.diligenceTitle')}</h2>
          <p>{t('terms.p2')}</p>
          <h2 className="display-type mt-10 text-ink">{t('terms.viewingsTitle')}</h2>
          <p>{t('terms.p3')}</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
