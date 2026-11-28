'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, MoveHorizontal, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { ButtonLink } from '@/components/ui/button'
import { useCardAutoSlide } from '@/components/home/use-card-auto-slide'
import { useLocale } from '@/i18n/locale-provider'
import { useMotionPreferences } from '@/experience/motion/motion-provider'
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

function SceneImage({
  scene,
  index,
  progress,
  reducedMotion,
}: {
  scene: Scene
  index: number
  progress: MotionValue<number>
  reducedMotion: boolean
}) {
  const { t } = useLocale()
  const start = index / scenes.length
  const end = (index + 1) / scenes.length
  const scale = useTransform(
    progress,
    [Math.max(0, start - 0.08), start, end, Math.min(1, end + 0.08)],
    reducedMotion ? [1, 1, 1, 1] : [1.13, 1.08, 1, 1.06],
  )
  const y = useTransform(
    progress,
    [Math.max(0, start - 0.08), end],
    reducedMotion ? ['0%', '0%'] : ['3%', '-3%'],
  )
  return (
    <motion.div style={{ scale, y }} className="absolute inset-[-4%]">
      <Image
        src={scene.image}
        alt={t(scene.altKey as never)}
        fill
        sizes="(max-width: 1536px) 42vw, 32vw"
        className="object-cover"
        priority={index === 0}
      />
    </motion.div>
  )
}

function JourneyScene({
  scene,
  index,
  progress,
  reducedMotion,
}: {
  scene: Scene
  index: number
  progress: MotionValue<number>
  reducedMotion: boolean
}) {
  const { t } = useLocale()
  return (
    <article className="relative flex h-full w-1/4 shrink-0 items-center px-[7vw] py-16">
      <div className="grid w-full max-w-[1320px] items-center gap-[7vw] md:grid-cols-2">
        <div className="max-w-xl">
          <p className="eyebrow text-terracotta">{t(scene.kickerKey as never)}</p>
          <h3 className="display-type journey-display mt-5 whitespace-pre-line text-[clamp(3.5rem,6.5vw,7.2rem)] leading-[.78] tracking-[-.06em]">
            {t(scene.titleKey as never)}
          </h3>
          <p className="mt-7 max-w-md text-sm leading-7 text-ink/60 sm:text-base">
            {t(scene.copyKey as never)}
          </p>
          <div className="mt-9 flex items-end gap-4 border-t border-line pt-5">
            <span className="display-type text-5xl leading-none text-terracotta">{scene.stat}</span>
            <span className="max-w-[150px] text-[10px] font-bold uppercase leading-4 tracking-[.13em] text-ink/45">
              {t(scene.statLabelKey as never)}
            </span>
          </div>
          <ButtonLink href={scene.href} variant="outline" className="mt-9">
            {t('stepInside')} <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="relative aspect-[.82] overflow-hidden rounded-[2rem] bg-stone shadow-float lg:aspect-[.96]">
          <SceneImage scene={scene} index={index} progress={progress} reducedMotion={reducedMotion} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/30 bg-ink/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {scene.index} / 04
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
            <span className="max-w-[220px] text-xs leading-5 text-white/75">{t(scene.altKey as never)}</span>
            <Link
              href={scene.href}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/10 transition hover:bg-gold hover:text-ink"
              aria-label={`${t('journey.openPrefix')} ${t(scene.titleKey as never)}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export function CinematicJourney() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardScrollerRef = useRef<HTMLDivElement | null>(null)
  const { t } = useLocale()
  const { reducedMotion } = useMotionPreferences()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 75, damping: 24, mass: 0.4 })
  const trackX = useTransform(progress, [0, 1], reducedMotion ? ['0%', '0%'] : ['0%', '-75%'])
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%'])

  // Phone view: the same cards laid out in a row, sliding to the next card on a
  // timer. Manual swipes stay native; reduced motion leaves the row static.
  useCardAutoSlide(cardScrollerRef, '[data-journey-card]', true)

  return (
    <>
      <section
        ref={sectionRef}
        data-testid="cinematic-journey"
        className={cn('relative hidden bg-paper md:block', reducedMotion ? 'h-auto' : 'h-[360vh]')}
      >
        <div
          data-testid="cinematic-journey-sticky"
          className={cn('overflow-hidden', reducedMotion ? 'relative' : 'sticky top-0 h-screen')}
        >
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-7 sm:px-10">
            <div>
              <p className="eyebrow">{t('journey.eyebrow')}</p>
              <p className="mt-2 text-xs font-semibold text-ink/45">{t('journey.scrollCopy')}</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.16em] text-ink/45">
              <MoveHorizontal className="h-4 w-4 text-terracotta" /> {t('journey.livingSequence')}
            </div>
          </div>
          <div className="absolute bottom-7 left-6 right-6 z-20 h-px bg-line sm:left-10 sm:right-10">
            <motion.span
              style={{ width: progressWidth }}
              className="absolute inset-y-0 left-0 bg-terracotta"
            />
            <span className="absolute -top-1.5 left-0 h-3 w-3 rounded-full border-2 border-paper bg-terracotta" />
          </div>
          <motion.div style={{ x: trackX }} className="flex h-screen w-[400%]">
            {scenes.map((scene, index) => (
              <JourneyScene
                key={scene.index}
                scene={scene}
                index={index}
                progress={progress}
                reducedMotion={reducedMotion}
              />
            ))}
          </motion.div>
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
                <h3 className="display-type journey-display mt-3 whitespace-pre-line text-5xl leading-[.82]">
                  {t(scene.titleKey as never)}
                </h3>
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
