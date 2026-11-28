'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  MessageCircle,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { properties } from '@/data/properties'
import { PropertyCard } from '@/components/property/property-card'
import { Button, ButtonLink } from '@/components/ui/button'
import { NotificationBell } from '@/components/ui/notification-bell'
import { Skeleton } from '@/components/ui/skeleton'
import { useWishlist } from '@/features/wishlist/wishlist-provider'
import { useLocale } from '@/i18n/locale-provider'
import { cn, initialsOf } from '@/lib/utils'

export function PortalDashboard() {
  const { t } = useLocale()
  const { data: session } = useSession()
  const { ready, isSaved } = useWishlist()
  const user = session?.user
  // The signed-in member's own name — the dashboard is theirs, not a demo's.
  const displayName = (user?.name ?? user?.email ?? '').trim().split(/\s+/)[0] || t('portal.mySpace')
  const saved = properties.filter((property) => isSaved(property.slug))
  const timeline = [
    { label: t('portal.timeline1'), date: '02 Nov · 09:14', done: true },
    { label: t('portal.timeline2'), date: '02 Nov · 10:02', done: true },
    { label: t('portal.timeline3'), date: '06 Nov · 15:30', done: false, active: true },
    { label: t('portal.timeline4'), date: t('portal.dateWhenever'), done: false },
  ]

  return (
    <div className="min-h-screen bg-stone/45">
      <header className="border-b border-line bg-paper">
        <div className="container-shell flex h-[76px] items-center justify-between">            <Link href="/" className="text-xs font-extrabold tracking-[.18em]">
            SWADHEEN <span className="font-normal tracking-normal text-ink/40">/ {t('portal.mySpace')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell scope="user" tone="stone" />
            <Link
              href="/portal/profile"
              aria-label={t('profile.personalInfo')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-[10px] font-extrabold text-white transition hover:opacity-85"
            >
              {initialsOf(user?.name, user?.email)}
            </Link>
          </div>
        </div>
      </header>
      <main className="container-shell py-10 sm:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{t('yourPrivateSpace')}</p>
            <h1 className="display-type mt-3 text-5xl leading-[.9]">
              {t('portal.goodMorning')}
              <br />
              <em className="font-normal text-terracotta">{displayName}</em>
            </h1>
          </div>
          <ButtonLink href="/properties" variant="secondary">
            {t('portal.exploreMore')} <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-panel border border-line bg-paper p-5 shadow-soft">
            <Heart className="h-5 w-5 text-terracotta" />
            <p className="mt-5 text-2xl font-extrabold">{ready ? saved.length : '—'}</p>
            <p className="mt-1 text-xs text-ink/50">{t('savedProperties')}</p>
          </div>
          <div className="rounded-panel border border-line bg-paper p-5 shadow-soft">
            <Search className="h-5 w-5 text-moss" />
            <p className="mt-5 text-2xl font-extrabold">02</p>
            <p className="mt-1 text-xs text-ink/50">{t('portal.savedSearches')}</p>
          </div>
          <div className="rounded-panel border border-line bg-paper p-5 shadow-soft">
            <CalendarDays className="h-5 w-5 text-gold" />
            <p className="mt-5 text-2xl font-extrabold">01</p>
            <p className="mt-1 text-xs text-ink/50">{t('portal.upcomingVisit')}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-panel border border-line bg-paper p-5 shadow-soft sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">{t('portal.currentRequest')}</p>
                <h2 className="display-type mt-2 text-3xl">{t('portal.requestTitle')}</h2>
              </div>
              <span className="rounded-full bg-[hsl(var(--gold)/.18)] px-3 py-1.5 text-[10px] font-bold text-[hsl(var(--warning))]">
                {t('portal.inProgress')}
              </span>
            </div>
            <div className="mt-8 rounded-panel bg-stone p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{t('portal.viewingConfirmed')}</p>
                  <p className="mt-1 text-xs text-ink/55">{t('portal.viewingDate')}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-ink/60">{t('portal.visitCopy')}</p>
              <Button variant="outline" size="sm" className="mt-5">
                {t('portal.viewDetails')} <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">{t('portal.timelineHeading')}</p>
                <p className="text-[10px] text-ink/40">{t('portal.timelineRef')}</p>
              </div>
              <div className="mt-5 grid gap-0 sm:grid-cols-4">
                {timeline.map((item, index) => (
                  <div key={item.label} className="relative flex gap-3 pb-6 sm:block sm:pb-0 sm:pr-3">
                    <div className="absolute left-[7px] top-4 h-full w-px bg-line sm:left-0 sm:top-3 sm:h-px sm:w-full" />
                    <span
                      className={cn(
                        'relative z-10 flex h-4 w-4 shrink-0 rounded-full border-4 border-paper',
                        item.done ? 'bg-moss' : item.active ? 'bg-gold' : 'bg-line',
                      )}
                    />
                    <div className="-mt-1 sm:mt-4">
                      <p className={cn('text-xs font-bold', !item.done && !item.active && 'text-ink/40')}>
                        {item.label}
                      </p>
                      <p className="mt-1 text-[11px] text-ink/40">{item.date}</p>
                    </div>
                    {index === 0 && (
                      <CheckCircle2 className="absolute right-3 top-0 hidden h-4 w-4 text-moss sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
          <aside className="space-y-6">
            <section className="rounded-panel border border-line bg-ink p-6 text-paper shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow text-gold">{t('portal.advisor')}</p>
                  <p className="mt-2 text-xl font-bold">{t('portal.advisorName')}</p>
                  <p className="mt-1 text-xs text-paper/50">{t('portal.advisorRole')}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c8a49c] text-xs font-extrabold text-ink">
                  SE
                </span>
              </div>
              <p className="mt-5 text-sm leading-6 text-paper/60">{t('portal.advisorQuote')}</p>
              <div className="mt-6 flex gap-2">
                <a
                  href="tel:+8801810774478"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-paper py-3 text-xs font-bold text-ink"
                >
                  <Clock3 className="h-3.5 w-3.5" /> {t('portal.messageAdvisor')}
                </a>
              </div>
            </section>
            <section className="rounded-panel border border-line bg-paper p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--available)/.12)] text-[hsl(var(--available))]">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold">{t('portal.detailsPrivate')}</p>
                  <p className="mt-1 text-[10px] text-ink/45">{t('portal.onlyTeam')}</p>
                </div>
              </div>
              <Link
                href="/portal/profile"
                className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-terracotta"
              >
                {t('portal.manageAccount')} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          </aside>
        </div>
        <section className="mt-12">
          <div>
            <p className="eyebrow">{t('portal.savedForLater')}</p>
            <h2 className="display-type mt-3 text-4xl">{t('portal.shortlist')}</h2>
          </div>
          {!ready ? (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-panel" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : saved.length === 0 ? (
            <div className="mt-8 rounded-panel border border-dashed border-line bg-paper px-6 py-8 text-center">
              <Heart className="mx-auto h-6 w-6 text-terracotta/60" />
              <p className="mt-4 text-sm font-bold">{t('portal.noSavedTitle')}</p>
              <p className="mt-2 text-xs leading-5 text-ink/55">{t('portal.noSavedBody')}</p>
              <ButtonLink href="/properties" variant="secondary" size="sm" className="mt-5">
                {t('portal.exploreMore')} <ArrowUpRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
