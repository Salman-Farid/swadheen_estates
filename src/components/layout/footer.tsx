'use client'

import Link from 'next/link'
import { ArrowUpRight, Instagram, Linkedin, MapPin } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { MotionToggle } from '@/experience/motion/motion-toggle'
import { useLocale } from '@/i18n/locale-provider'

export function Footer() {
  const { t } = useLocale()
  return (
    <footer className="bg-stone pb-8 pt-20 text-ink">
      <div className="container-shell">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
          <div>
            <Logo />
            <p className="mt-7 max-w-sm text-sm leading-7 text-ink/60">{t('footer.tagline')}</p>
            <div className="mt-8 flex items-center gap-2 text-xs text-ink/55">
              <MapPin className="h-4 w-4 text-terracotta" /> {t('footer.location')}
            </div>
          </div>
          <div>
            <p className="eyebrow">{t('footer.explore')}</p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-ink/65">
              <Link href="/properties" className="transition hover:text-ink">
                {t('nav.properties')}
              </Link>
              <Link href="/projects/the-grove-bashundhara" className="transition hover:text-ink">
                {t('nav.projects')}
              </Link>
              <Link href="/about" className="transition hover:text-ink">
                {t('nav.approach')}
              </Link>
              <Link href="/journal" className="transition hover:text-ink">
                {t('nav.journal')}
              </Link>
            </div>
          </div>
          <div>
            <p className="eyebrow">{t('footer.connect')}</p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-ink/65">
              <Link href="/contact" className="transition hover:text-ink">
                {t('nav.contact')}
              </Link>
              <Link href="/sell-with-us" className="transition hover:text-ink">
                {t('nav.sellWithUs')}
              </Link>
              <Link href="/careers" className="transition hover:text-ink">
                {t('nav.careers')}
              </Link>
              <Link href="/portal" className="transition hover:text-ink">
                {t('nav.portal')}
              </Link>
            </div>
          </div>
          <div className="rounded-panel border border-line bg-paper p-6 shadow-soft">
            <p className="font-display text-2xl">{t('footer.betterWayTitle')}</p>
            <p className="mt-2 text-sm leading-6 text-ink/60">{t('footer.betterWayCopy')}</p>
            <Link
              href="/request"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-terracotta"
            >
              {t('nav.startConversation')} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-5 border-t border-line pt-6 text-xs text-ink/55 sm:flex-row sm:items-center">
          <p>{t('footer.rights')}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy">{t('footer.privacy')}</Link>
            <Link href="/terms">{t('footer.terms')}</Link>
            <MotionToggle />
            <a href="#" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
