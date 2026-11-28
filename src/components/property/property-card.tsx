'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  BedDouble,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  Heart,
  LandPlot,
  MapPin,
  Play,
  Ruler,
  ShowerHead,
  Sofa,
  Waves,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import type { Property } from '@/types/property'
import { Badge, FeatureBadge, StatusBadge, VerifiedBadge } from '@/components/ui/badge'
import { motionFeatureFlags } from '@/experience/motion/feature-flags'
import { useMotionPreferences } from '@/experience/motion/motion-provider'
import { useLocale } from '@/i18n/locale-provider'
import { useWishlist } from '@/features/wishlist/wishlist-provider'
import { localizedText } from '@/i18n/localize'

function TypeMark({ type }: { type: Property['type'] }) {
  if (type === 'Land') return <LandPlot className="h-3.5 w-3.5" />
  if (type === 'House') return <Building2 className="h-3.5 w-3.5" />
  return <Building2 className="h-3.5 w-3.5" />
}

function ActionButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-ink/45 text-white backdrop-blur-md transition hover:bg-ink/60',
        active && 'border-terracotta bg-terracotta text-white',
      )}
    >
      {children}
    </button>
  )
}

function PropertyCardCarousel({
  property,
  sizes,
  priority = false,
  showThumbnails = true,
}: {
  property: Property
  sizes: string
  priority?: boolean
  showThumbnails?: boolean
}) {
  const { reducedMotion, slowMotion, timeScale } = useMotionPreferences()
  const { locale, t } = useLocale()
  const images = property.gallery.length > 0 ? property.gallery : [property.image]
  const [activeIndex, setActiveIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const enabled = motionFeatureFlags.propertyCarousel && images.length > 1

  useEffect(() => {
    const node = linkRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true)
      },
      { rootMargin: '180px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!enabled || reducedMotion || !visible) return
    const intervalMs = 3000 / Math.max(timeScale, 0.25) / (hovered ? 0.35 : 1) / (slowMotion ? 1.75 : 1)
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % images.length),
      intervalMs,
    )
    return () => window.clearInterval(timer)
  }, [enabled, hovered, images.length, reducedMotion, slowMotion, timeScale, visible])

  function selectImage(index: number) {
    setActiveIndex((index + images.length) % images.length)
  }

  return (
    <>
      <Link
        ref={linkRef}
        href={`/properties/${property.slug}`}
        aria-label={`${t('a11y.viewProperty')} ${localizedText(property.title, property.titleBn, locale)}`}
        className="absolute inset-0 z-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={images[activeIndex]}
            initial={enabled && !reducedMotion ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={enabled && !reducedMotion ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex] ?? property.image}
              alt={localizedText(property.title, property.titleBn, locale)}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover"
              style={{ objectPosition: `${property.focalPoint.x}% ${property.focalPoint.y}%` }}
            />
          </motion.div>
        </AnimatePresence>
      </Link>
      {enabled && showThumbnails && (
        <div
          className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-6rem)] gap-1.5 overflow-x-auto rounded-xl bg-ink/30 p-1 backdrop-blur-md"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                selectImage(index)
              }}
              aria-label={`${t('a11y.showImage')} ${index + 1} / ${images.length}`}
              aria-pressed={activeIndex === index}
              className={cn(
                'relative h-8 w-10 shrink-0 overflow-hidden rounded-lg border transition sm:h-9 sm:w-11',
                activeIndex === index
                  ? 'border-gold ring-1 ring-gold'
                  : 'border-white/30 opacity-70 hover:opacity-100',
              )}
            >
              <Image src={image} alt="" fill sizes="44px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      {enabled && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-ink/55 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              selectImage(activeIndex - 1)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:bg-white/20"
            aria-label={t('a11y.prevImage')}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-8 text-center text-[10px] font-bold text-white">
            {activeIndex + 1}/{images.length}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              selectImage(activeIndex + 1)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:bg-white/20"
            aria-label={t('a11y.nextImage')}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  )
}

export function PropertyCard({
  property,
  variant = 'grid',
  priority = false,
}: {
  property: Property
  variant?: 'grid' | 'list' | 'compact' | 'map'
  priority?: boolean
}) {
  const { isSaved, toggleSaved } = useWishlist()
  const [compared, setCompared] = useState(false)
  const saved = isSaved(property.slug)
  const { locale, t } = useLocale()
  const title = localizedText(property.title, property.titleBn, locale)
  const typeLabel = t(`type.${property.type.toLowerCase()}` as 'type.land' | 'type.house' | 'type.flat')

  const cardMeta = [
    property.beds ? `${property.beds} ${t('meta.beds')}` : null,
    property.baths ? `${property.baths} ${t('meta.baths')}` : null,
    `${property.area.toLocaleString()} ${property.areaUnit}`,
  ]
    .filter(Boolean)
    .join(' · ')

  if (variant === 'compact')
    return (
      <article className="group flex gap-3">
        <div className="image-frame h-20 w-24 shrink-0 rounded-xl">
          <PropertyCardCarousel property={property} sizes="96px" showThumbnails={false} />
          <span className="absolute bottom-2 left-2 rounded-full bg-ink/75 px-2 py-1 text-[9px] font-bold text-white">
            {typeLabel}
          </span>
        </div>
        <div className="min-w-0 py-0.5">
          <div className="flex items-center gap-1.5 text-[10px] text-ink/50">
            <TypeMark type={property.type} />
            {localizedText(property.location, property.locationBn, locale).split(',')[0]}
          </div>
          <Link
            href={`/properties/${property.slug}`}
            className="mt-1 block truncate text-sm font-bold group-hover:text-terracotta"
          >
            {title}
          </Link>
          <p className="mt-1 text-xs font-extrabold numeric">{formatPrice(property.price)}</p>
        </div>
      </article>
    )

  if (variant === 'list')
    return (
      <article className="group grid gap-5 rounded-panel border border-line bg-paper p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float sm:grid-cols-[240px_1fr] md:grid-cols-[280px_1fr]">
        <div className="image-frame aspect-[4/3] rounded-[1rem] sm:aspect-auto">
          <PropertyCardCarousel
            property={property}
            sizes="(max-width: 640px) 100vw, 280px"
            priority={priority}
          />
          <div
            className={cn(
              'absolute left-3 flex gap-1.5',
              property.gallery.length > 1 ? 'top-[4.25rem]' : 'top-3',
            )}
          >
            <StatusBadge status={property.status} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col px-1 py-1 sm:py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow flex items-center gap-1.5">
                <TypeMark type={property.type} /> {typeLabel}
              </p>
              <Link
                href={`/properties/${property.slug}`}
                className="display-type mt-2 block text-2xl leading-none transition group-hover:text-terracotta"
              >
                {title}
              </Link>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/55">
                <MapPin className="h-3.5 w-3.5 text-terracotta" />
                {localizedText(property.location, property.locationBn, locale)}
              </p>
            </div>
            <div className="flex gap-1.5">
              <ActionButton
                label={saved ? t('a11y.unsaveProperty') : t('a11y.saveProperty')}
                active={saved}
                onClick={() => toggleSaved({ slug: property.slug })}
              >
                <Heart className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
              </ActionButton>
              <ActionButton
                label={compared ? t('a11y.uncompareProperty') : t('a11y.compareProperty')}
                active={compared}
                onClick={() => setCompared(!compared)}
              >
                <GitCompareArrows className="h-4 w-4" />
              </ActionButton>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-ink/60">
            {localizedText(property.summary, property.summaryBn, locale)}
          </p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.13em] text-ink/40">
                {t('guidePrice')}
              </p>
              <p className="numeric mt-1 text-xl font-extrabold">{formatPrice(property.price)}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink/55">
              <span>{cardMeta}</span>
              <ArrowUpRight className="h-4 w-4 text-terracotta" />
            </div>
          </div>
        </div>
      </article>
    )

  return (
    <article
      className={cn(
        'group relative',
        variant === 'map' && 'w-72 rounded-panel border border-line bg-paper p-2 shadow-float',
      )}
    >
      <div className="image-frame aspect-[4/3] rounded-panel">
        <PropertyCardCarousel
          property={property}
          sizes={variant === 'map' ? '288px' : '(max-width: 768px) 100vw, 33vw'}
          priority={priority}
        />
        <div
          className={cn(
            'absolute inset-x-3 z-10 flex items-start justify-between gap-2',
            property.gallery.length > 1 ? 'top-[4.25rem]' : 'top-3',
          )}
        >
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={property.status} />
            {property.featured && <FeatureBadge />}
          </div>
          <div className="flex gap-1.5">
            <ActionButton
              label={saved ? t('a11y.unsaveProperty') : t('a11y.saveProperty')}
              active={saved}
              onClick={() => toggleSaved({ slug: property.slug })}
            >
              <Heart className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
            </ActionButton>
            <ActionButton
              label={compared ? t('a11y.uncompareProperty') : t('a11y.compareProperty')}
              active={compared}
              onClick={() => setCompared(!compared)}
            >
              <GitCompareArrows className="h-4 w-4" />
            </ActionButton>
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {property.verified && <VerifiedBadge dark />}
            {/* 3D / 360° features are switched off for now — restore these two blocks when needed.
            {property.has3d && (
              <Badge tone="dark" icon={<Waves className="h-3 w-3" />}>
                3D
              </Badge>
            )}
            {property.has360 && (
              <Badge tone="dark" icon={<span className="text-[9px]">360°</span>}>
                {t('badge.tour')}
              </Badge>
            )}
            */}
            {property.hasVideo && (
              <Badge tone="dark" icon={<Play className="h-3 w-3 fill-current" />}>
                {t('badge.video')}
              </Badge>
            )}
          </div>
          <span className="rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-bold text-ink backdrop-blur">
            {typeLabel}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/10 opacity-75" />
      </div>
      <div className="px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-terracotta">
              <TypeMark type={property.type} />
              {localizedText(property.location, property.locationBn, locale).split(',')[0]}
            </p>
            <Link
              href={`/properties/${property.slug}`}
              className="display-type mt-2 block truncate text-2xl leading-tight transition group-hover:text-terracotta"
            >
              {title}
            </Link>
            <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-ink/55">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {localizedText(property.location, property.locationBn, locale)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3">
          <p className="numeric text-lg font-extrabold">{formatPrice(property.price)}</p>
          <p className="flex items-center gap-1 text-[11px] text-ink/50">
            <Ruler className="h-3 w-3" />
            {property.area.toLocaleString()} {property.areaUnit}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-ink/55">
          {property.beds ? (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.beds}
            </span>
          ) : null}
          {property.baths ? (
            <span className="flex items-center gap-1">
              <ShowerHead className="h-3.5 w-3.5" />
              {property.baths}
            </span>
          ) : null}
          {property.type === 'House' && (
            <span className="flex items-center gap-1">
              <Sofa className="h-3.5 w-3.5" />
              {property.floor}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-terracotta">
            {t('viewDetails')} <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
