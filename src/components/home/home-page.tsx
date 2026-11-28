'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  MoveUpRight,
  Play,
  Quote,
  Sparkles,
  Waves,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { properties as staticProperties, propertyTypes } from '@/data/properties'
import { Button, ButtonLink } from '@/components/ui/button'
import { FeaturedCard } from '@/components/property/featured-card'
import { SectionHeading } from '@/components/ui/section-heading'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSearch } from '@/components/home/hero-search'
import { Reveal } from '@/components/motion/reveal'
import { CinematicHeroMedia } from '@/experience/motion/cinematic-hero-media'
import { DeferredYouTubeShowcase } from '@/components/home/deferred-youtube-showcase'
import { projectVideos } from '@/data/videos'
import { HomeTypewriter } from '@/components/home/home-typewriter'
import { CinematicJourney } from '@/components/home/cinematic-journey'
import { useCardAutoSlide } from '@/components/home/use-card-auto-slide'
import { useLocale } from '@/i18n/locale-provider'
import type { Property } from '@/types/property'

const journalImages = [
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85',
]

// `properties` is the live catalogue passed by the server page; the static
// catalogue is the fallback when no database is configured.
export function HomePage({ properties = staticProperties }: { properties?: Property[] }) {
  const { t, locale } = useLocale()
  const featuredAll = properties.filter((property) => property.featured)
  const featured = featuredAll.slice(0, 4)
  const [featuredExpanded, setFeaturedExpanded] = useState(false)
  const featuredScrollerRef = useRef<HTMLDivElement | null>(null)
  useCardAutoSlide(featuredScrollerRef, '[data-featured-card]', !featuredExpanded)
  const journal = [
    {
      category: t('journal.categoryFieldNotes'),
      title: t('journal.titleNeighbourhood'),
      date: t('journal.readMinutes05'),
      image: journalImages[0] ?? '',
    },
    {
      category: t('journal.categoryBetterBrief'),
      title: t('journal.titleFiveQuestions'),
      date: t('journal.readMinutes07'),
      image: journalImages[1] ?? '',
    },
    {
      category: t('journal.categoryInsideGrove'),
      title: t('journal.titleChangingLight'),
      date: t('journal.readMinutes04'),
      image: journalImages[2] ?? '',
    },
  ]
  return (
    <div className="min-h-screen overflow-x-clip">
      <section className="relative min-h-[700px] bg-ink text-white sm:min-h-[760px]">
        <CinematicHeroMedia
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=90"
          alt={t('home.heroAlt')}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,20,24,.85)_0%,rgba(15,20,24,.43)_48%,rgba(15,20,24,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(15,20,24,.85)_0%,transparent_52%)]" />
        <div className="grain absolute inset-0" />
        <Header overlay />
        <div className="container-shell relative flex min-h-[700px] flex-col justify-end pb-28 pt-28 sm:min-h-[760px] sm:pb-36 sm:pt-36">
          <div className="max-w-3xl">
            <Reveal>
              <p className="eyebrow text-gold">{t('home.eyebrow')}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="display-type hero-display mt-6 text-[clamp(1.45rem,5.4vw,4rem)] leading-[1.06] tracking-tight sm:text-[clamp(1.75rem,5vw,4.25rem)] lg:text-[clamp(2rem,4.6vw,4.35rem)]">
                <em className="block font-normal not-italic text-gold">
                  <HomeTypewriter key={locale} />
                </em>
              </h1>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-7 max-w-md text-sm leading-7 text-white/72 sm:text-base">
                {t('home.heroDescription')}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.26} className="mt-10 max-w-5xl">
            <HeroSearch />
          </Reveal>
        </div>
        <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/55 lg:flex">
          <ArrowDownRight className="h-4 w-4" /> {t('home.scroll')}
        </div>
      </section>
      <section className="border-b border-line bg-paper">
        <div className="container-shell grid grid-cols-3 gap-0 py-0">
          <div className="flex min-w-0 flex-col items-start gap-1 border-r border-line px-2 py-5 sm:flex-row sm:items-center sm:gap-4 sm:border-b-0 sm:pl-0 sm:pr-8">
            <span className="text-2xl font-extrabold tracking-[-.06em] sm:text-3xl">16</span>
            <span className="text-[10px] leading-4 text-ink/55 sm:text-xs sm:leading-5">
              {t('home.statYearsLine1')}
              <br />
              {t('home.statYearsLine2')}
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-1 border-r border-line px-2 py-5 sm:flex-row sm:items-center sm:gap-4 sm:border-b-0 sm:px-8">
            <span className="text-2xl font-extrabold tracking-[-.06em] sm:text-3xl">
              480<span className="text-terracotta">+</span>
            </span>
            <span className="text-[10px] leading-4 text-ink/55 sm:text-xs sm:leading-5">
              {t('home.statFamiliesLine1')}
              <br />
              {t('home.statFamiliesLine2')}
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-1 px-2 py-5 sm:flex-row sm:items-center sm:gap-4 sm:pl-8">
            <span className="text-2xl font-extrabold tracking-[-.06em] sm:text-3xl">
              97<span className="text-terracotta">%</span>
            </span>
            <span className="text-[10px] leading-4 text-ink/55 sm:text-xs sm:leading-5">
              {t('home.statClientsLine1')}
              <br />
              {t('home.statClientsLine2')}
            </span>
          </div>
        </div>
      </section>
      <main>
        <CinematicJourney />
        <section className="section-space">
          <div className="container-shell">
            <SectionHeading
              eyebrow={t('home.featuredEyebrow')}
              title={t('home.featuredTitle')}
              description={t('home.featuredDescription')}
              action={
                <ButtonLink href="/properties" variant="outline">
                  {t('home.featuredCta')} <ArrowUpRight className="h-4 w-4" />
                </ButtonLink>
              }
            />
            <div className="mt-8 flex justify-end md:hidden">
              <Button
                variant="outline"
                size="sm"
                aria-expanded={featuredExpanded}
                onClick={() => setFeaturedExpanded((open) => !open)}
              >
                {featuredExpanded ? t('home.seeLess') : t('home.seeAll')}
                {featuredExpanded ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="mt-12 hidden gap-x-6 gap-y-12 sm:grid-cols-2 md:grid lg:grid-cols-4">
              {featured.map((property, index) => (
                <Reveal key={property.id} delay={index * 0.06}>
                  <FeaturedCard property={property} priority={index < 2} />
                </Reveal>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            {featuredExpanded ? (
              <div className="container-shell mt-12 grid gap-10">
                {featuredAll.map((property, index) => (
                  <Reveal key={property.id} delay={index * 0.06}>
                    <FeaturedCard property={property} priority={index < 2} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div
                ref={featuredScrollerRef}
                className="mt-8 flex gap-5 overflow-x-auto px-[7vw] pb-2 [scrollbar-width:none] scroll-px-[7vw] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
              >
                {featuredAll.map((property, index) => (
                  <div key={property.id} data-featured-card className="w-[86vw] shrink-0 snap-start">
                    <FeaturedCard property={property} priority={index < 2} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="section-space bg-stone">
          <div className="container-shell">
            <SectionHeading eyebrow={t('home.typesEyebrow')} title={t('home.typesTitle')} />
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {propertyTypes.map((item, index) => (
                <Reveal key={item.label} delay={index * 0.07}>
                  <Link
                    href={`/properties?type=${item.label}`}
                    className="group relative block min-h-[430px] overflow-hidden rounded-panel bg-ink text-white"
                  >
                    <Image
                      src={item.image}
                      alt={t(`type.${item.label.toLowerCase()}` as 'type.land' | 'type.house' | 'type.flat')}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
                    <div className="absolute inset-x-7 bottom-7">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold">
                            {String(item.count).padStart(2, '0')} {t('home.possibilities')}
                          </p>
                          <h3 className="display-type mt-3 text-5xl">
                            {t(
                              `type.${item.label.toLowerCase()}` as 'type.land' | 'type.house' | 'type.flat',
                            )}
                          </h3>
                          <p className="mt-2 max-w-[220px] text-sm leading-6 text-white/65">
                            {locale === 'bn' ? item.descriptionBn : item.description}
                          </p>
                        </div>
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 transition group-hover:bg-gold group-hover:text-ink">
                          <ArrowUpRight className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section className="section-space">
          <div className="container-shell">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div>
                <p className="eyebrow">{t('home.projectEyebrow')}</p>
                <h2 className="display-type mt-4 text-5xl leading-[.88] sm:text-7xl">
                  {t('home.projectTitleLine1')}
                  <br />
                  <em className="font-normal text-terracotta">{t('home.projectTitleLine2')}</em>
                </h2>
                <p className="muted-copy mt-6 max-w-sm text-sm leading-7">{t('home.projectDescription')}</p>
                <ButtonLink href="/projects/the-grove-bashundhara" variant="secondary" className="mt-8">
                  {t('home.projectCta')} <ArrowUpRight className="h-4 w-4" />
                </ButtonLink>
              </div>
              <div className="relative min-h-[420px] overflow-hidden rounded-panel bg-ink">
                <Image
                  src={properties[0]?.gallery[3] ?? properties[0]?.image ?? ''}
                  alt={t('home.projectImageAlt')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-gold">
                      {t('home.projectBadge')}
                    </p>
                    <p className="mt-2 font-display text-3xl">{t('home.projectTagline')}</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur">
                    <MoveUpRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-space border-y border-line bg-white/70 text-ink shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-paper/10">
          <div className="container-shell">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <Reveal>
                <div className="relative aspect-[4/3] overflow-hidden rounded-panel">
                  <Image
                    src={properties[7]?.image ?? ''}
                    alt={t('home.tourImageAlt')}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-ink/25" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-20 w-20 animate-pulse-ring items-center justify-center rounded-full bg-paper text-ink shadow-float">
                      <Play className="ml-1 h-6 w-6 fill-current" />
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 rounded-full bg-ink/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white backdrop-blur">
                    {t('home.tourBadge')}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <div>
                  <p className="eyebrow">{t('home.tourEyebrow')}</p>
                  <h2 className="display-type mt-4 text-5xl leading-[.9] sm:text-7xl">
                    {t('home.tourTitleLine1')}
                    <br />
                    <em className="font-normal text-terracotta">{t('home.tourTitleLine2')}</em>
                  </h2>
                  <p className="mt-7 max-w-md text-sm leading-7 text-ink/60">{t('home.tourDescription')}</p>
                  <ul className="mt-8 grid gap-4 text-sm text-ink/75 sm:grid-cols-2">
                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {t('home.tourCheck1')}
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {t('home.tourCheck2')}
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {t('home.tourCheck3')}
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {t('home.tourCheck4')}
                    </li>
                  </ul>
                  <ButtonLink href="/properties/the-grove-3a#experience" variant="primary" className="mt-9">
                    {t('home.tourCta')} <ArrowUpRight className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
        <DeferredYouTubeShowcase videos={projectVideos} />
        <section className="section-space">
          <div className="container-shell">
            <SectionHeading
              eyebrow={t('home.journalEyebrow')}
              title={t('home.journalTitle')}
              action={
                <ButtonLink href="/journal" variant="ghost">
                  {t('home.journalCta')} <ChevronRight className="h-4 w-4" />
                </ButtonLink>
              }
            />
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {journal.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.08}>
                  <Link href="/journal" className="group block">
                    <div className="image-frame aspect-[4/3] rounded-panel">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.16em] text-terracotta">
                      <span>{item.category}</span>
                      <span className="text-ink/40">{item.date}</span>
                    </div>
                    <h3 className="display-type mt-3 text-3xl leading-[.95] transition group-hover:text-terracotta">
                      {item.title}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">
                      {t('home.readStory')} <ArrowUpRight className="h-3.5 w-3.5 text-terracotta" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section className="container-shell pb-24">
          <div className="relative overflow-hidden rounded-panel bg-terracotta px-7 py-14 text-white sm:px-14 lg:px-20 lg:py-20">
            <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/20" />
            <div className="absolute -right-2 -top-6 h-44 w-44 rounded-full border border-white/20" />
            <Sparkles className="absolute right-16 top-16 h-7 w-7 text-gold" />
            <p className="eyebrow text-white/70">{t('home.ctaEyebrow')}</p>
            <div className="mt-4 flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <h2 className="display-type max-w-2xl text-5xl leading-[.88] sm:text-7xl">
                {t('home.ctaTitleLine1')}
                <br />
                <em className="font-normal text-gold">{t('home.ctaTitleLine2')}</em>
              </h2>
              <ButtonLink href="/request" variant="dark" className="shrink-0 bg-ink">
                {t('nav.startConversation')} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
