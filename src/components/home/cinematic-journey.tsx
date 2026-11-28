'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { ButtonLink } from '@/components/ui/button'
import { useCardAutoSlide } from '@/components/home/use-card-auto-slide'
import { useLocale } from '@/i18n/locale-provider'
import { cn } from '@/lib/utils'

type Scene = {
  index: string
  kickerKey: string
  titleKey: string
  copyKey: string
  image: string
  altKey: string
  href: string
  stat: string
  statLabelKey: string
}

const scenes: Scene[] = [
  {
    index: '01',
    kickerKey: 'journey.kicker1',
    titleKey: 'journey.title1',
    copyKey: 'journey.copy1',
    image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2400&q=92',
    altKey: 'journey.alt1',
    href: '/properties/the-grove-3a',
    stat: '48',
    statLabelKey: 'journey.stat1',
  },
  {
    index: '02',
    kickerKey: 'journey.kicker2',
    titleKey: 'journey.title2',
    copyKey: 'journey.copy2',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=92',
    altKey: 'journey.alt2',
    href: '/properties/gulshan-courtyard-house',
    stat: '3',
    statLabelKey: 'journey.stat2',
  },
  {
    index: '03',
    kickerKey: 'journey.kicker3',
    titleKey: 'journey.title3',
    copyKey: 'journey.copy3',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=92',
    altKey: 'journey.alt3',
    href: '/properties/purbachal-lakefront-plot',
    stat: '5',
    statLabelKey: 'journey.stat3',
  },
  {
    index: '04',
    kickerKey: 'journey.kicker4',
    titleKey: 'journey.title4',
    copyKey: 'journey.copy4',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2400&q=92',
    altKey: 'journey.alt4',
    href: '/projects/the-grove-bashundhara',
    stat: '2008',
    statLabelKey: 'journey.stat4',
  },
]

// Design audit fix (2026-11-28): the desktop version used to hijack vertical
// scrolling into a 360vh sticky horizontal track — panels cropped copy at the
// viewport edges and left hundreds of px of blank space under each scene's
// text. The scenes now stack in normal page flow, alternating sides, at the
// site type scale. The phone card row below is unchanged.
export function CinematicJourney() {
  const cardScrollerRef = useRef<HTMLDivElement | null>(null)
  const { t } = useLocale()

  // Phone view: the same cards laid out in a row, sliding to the next card on a
  // timer. Manual swipes stay native.
  useCardAutoSlide(cardScrollerRef, '[data-journey-card]', true)

  return (
    <>
      <section data-testid="cinematic-journey" className="relative hidden bg-paper md:block">
        <div className="container-shell section-space">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t('journey.eyebrow')}</p>
              <p className="mt-2 text-sm text-ink/50">{t('journey.scrollCopy')}</p>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-ink/45">
              {t('journey.livingSequence')}
            </p>
          </div>
          <div className="mt-14 space-y-20 lg:space-y-24">
            {scenes.map((scene, index) => (
              <article key={scene.index} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                <div className={cn('max-w-xl', index % 2 === 1 && 'lg:order-2')}>
                  <p className="eyebrow text-terracotta">{t(scene.kickerKey as never)}</p>
                  <h3 className="display-type mt-4 whitespace-pre-line">{t(scene.titleKey as never)}</h3>
                  <p className="mt-5 max-w-md text-sm leading-7 text-ink/60 sm:text-base">
                    {t(scene.copyKey as never)}
                  </p>
                  <div className="mt-7 flex items-end gap-4 border-t border-line pt-5">
                    <span className="display-type text-4xl leading-none text-terracotta">{scene.stat}</span>
                    <span className="max-w-[170px] text-[11px] font-bold uppercase leading-4 tracking-[.12em] text-ink/45">
                      {t(scene.statLabelKey as never)}
                    </span>
                  </div>
                  <ButtonLink href={scene.href} variant="outline" className="mt-8">
                    {t('stepInside')} <ArrowUpRight className="h-4 w-4" />
                  </ButtonLink>
                </div>
                <div
                  className={cn(
                    'relative aspect-[4/3] overflow-hidden rounded-panel bg-stone shadow-soft',
                    index % 2 === 1 && 'lg:order-1',
                  )}
                >
                  <Image
                    src={scene.image}
                    alt={t(scene.altKey as never)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/30 bg-ink/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {scene.index} / 04
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                    <span className="max-w-[240px] text-xs leading-5 text-white/80">
                      {t(scene.altKey as never)}
                    </span>
                    <Link
                      href={scene.href}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/10 transition hover:bg-gold hover:text-ink"
                      aria-label={`${t('journey.openPrefix')} ${t(scene.titleKey as never)}`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-paper py-16 md:hidden">
        <div
          ref={cardScrollerRef}
          className="flex gap-4 overflow-x-auto pb-2 px-[7vw] [scrollbar-width:none] scroll-px-[7vw] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        >
          {scenes.map((scene) => (
            <article
              key={scene.index}
              data-journey-card
              className="w-[86vw] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-line bg-stone"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={scene.image}
                  alt={t(scene.altKey as never)}
                  fill
                  sizes="86vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[.16em] text-white">
                  {`${scene.index} · ${t(scene.kickerKey as never)}`}
                </span>
              </div>
              <div className="p-6">
                <p className="eyebrow">{t(scene.kickerKey as never)}</p>
                <h3 className="display-type mt-3 whitespace-pre-line">{t(scene.titleKey as never)}</h3>
                <p className="mt-4 text-sm leading-6 text-ink/60">{t(scene.copyKey as never)}</p>
                <Link
                  href={scene.href}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-terracotta"
                >
                  {t('stepInside')} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
