'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ButtonLink } from '@/components/ui/button'
import { useLocale } from '@/i18n/locale-provider'

export default function CareersPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen">
      <Header />
      <main className="section-space container-shell">
        <p className="eyebrow">{t('careers.eyebrow')}</p>
        <h1 className="display-type mt-4 max-w-3xl text-[clamp(3.4rem,15vw,7rem)] leading-[.82] sm:text-9xl">
          {t('careers.title1')}
          <br />
          <em className="font-normal text-terracotta">{t('careers.title2')}</em>
        </h1>
        <p className="mt-7 max-w-lg text-sm leading-7 text-ink/60">{t('careers.copy')}</p>
        <ButtonLink href="mailto:info@eliteroyalhomes.com" className="mt-9">
          {t('careers.cta')}
        </ButtonLink>
      </main>
      <Footer />
    </div>
  )
}

