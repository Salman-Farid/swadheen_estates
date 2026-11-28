'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ButtonLink } from '@/components/ui/button'
import { useLocale } from '@/i18n/locale-provider'

export function CareersContent() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen">
      <Header />
      <main className="section-space container-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">{t('careers.eyebrow')}</p>
          <h1 className="display-type mt-4">
            {t('careers.title1')}
            <br />
            <em className="font-normal text-terracotta">{t('careers.title2')}</em>
          </h1>
          <p className="mt-7 max-w-lg text-sm leading-7 text-ink/60">{t('careers.copy')}</p>
          <ButtonLink href="mailto:info@eliteroyalhomes.com" className="mt-9">
            {t('careers.cta')}
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </div>
  )
}
