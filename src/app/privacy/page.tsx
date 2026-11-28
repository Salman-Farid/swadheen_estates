'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/i18n/locale-provider'

export default function PrivacyPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl container-shell py-16 sm:py-24">
        <p className="eyebrow">{t('legal')}</p>
        <h1 className="display-type mt-4">{t('privacy.title')}</h1>
        <div className="mt-10 max-w-none text-sm leading-8 text-ink/65">
          <p>{t('privacy.p1')}</p>
          <h2 className="display-type mt-10 text-ink">{t('privacy.choices')}</h2>
          <p>{t('privacy.p2')}</p>
          <h2 className="display-type mt-10 text-ink">{t('privacy.cookies')}</h2>
          <p>{t('privacy.p3')}</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
