'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Filter, Grid2X2, List, Map, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { properties as staticProperties, propertyTypes } from '@/data/properties'
import { PropertyCard } from '@/components/property/property-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertyGridSkeleton } from '@/components/ui/skeleton'
import type { Property, PropertyType } from '@/types/property'
import { useLocale } from '@/i18n/locale-provider'
import { localizedText } from '@/i18n/localize'
import { cn } from '@/lib/utils'

const types: Array<'All' | PropertyType> = ['All', 'Land', 'House', 'Flat']

function MapPanel({ count }: { count: number }) {
  const { t } = useLocale()
  const points = [
    [22, 37],
    [44, 28],
    [64, 46],
    [75, 25],
    [31, 65],
    [57, 72],
    [80, 66],
    [14, 53],
  ]
  return (
    <div className="relative min-h-[580px] overflow-hidden rounded-panel border border-line bg-[#d9d9c9] bg-[radial-gradient(circle_at_20%_20%,#f3f0e5_0,#d9d9c9_30%,#c3c8c2_100%)]">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(28deg,transparent_48%,rgba(255,255,255,.7)_49%,rgba(255,255,255,.7)_51%,transparent_52%),linear-gradient(125deg,transparent_48%,rgba(117,139,123,.35)_49%,rgba(117,139,123,.35)_51%,transparent_52%)] [background-size:120px_120px,180px_180px]" />
      <div className="absolute left-[12%] top-[22%] h-[38%] w-[50%] rotate-[18deg] rounded-[45%] bg-[#b4c5b5]/70 blur-[1px]" />
      <div className="absolute left-[36%] top-[40%] h-1 w-[45%] -rotate-[10deg] bg-white/80" />
      <div className="absolute left-[28%] top-[57%] h-1 w-[42%] rotate-[34deg] bg-white/80" />
      <div className="absolute left-5 top-5 rounded-full border border-white/60 bg-paper/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-ink shadow-soft backdrop-blur">
        <MapPin className="mr-1.5 inline h-3.5 w-3.5 text-terracotta" />
        {t('map.resultsCount', { count })}
      </div>
      {points.map(([left, top], index) => (
        <button
          key={`${left}-${top}`}
          type="button"
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${left}%`, top: `${top}%` }}
          aria-label={`${t('a11y.openMapResult')} ${index + 1}`}
        >
          <span className="block h-8 w-8 rounded-full border-4 border-paper bg-terracotta shadow-float transition group-hover:scale-125" />
          <span className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold text-paper group-hover:block">
            {index % 2 === 0 ? t('map.fromPrice') : t('map.projectName')}
          </span>
        </button>
      ))}
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
        <span className="rounded-full bg-paper/90 px-3 py-2 text-[10px] font-bold text-ink shadow-soft">
          {t('map.dragToExplore')}
        </span>
        <span className="rounded-full bg-ink/80 px-3 py-2 text-[10px] font-bold text-paper">
          {t('map.previewNote')}
        </span>
      </div>
    </div>
  )
}

// `properties` arrives from the server page (DB-backed catalogue with a static
// fallback) so admin additions and edits show up without a rebuild.
export function ListingsBrowser({ properties = staticProperties }: { properties?: Property[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale, t } = useLocale()
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [query, setQuery] = useState(searchParams.get('location') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? 'All')
  const [sort, setSort] = useState('Recommended')
  const [budget, setBudget] = useState('Any budget')
  const [minArea, setMinArea] = useState('')
  const [beds, setBeds] = useState('Any bedrooms')

  const typeLabel = (value: string) =>
    value === 'All'
      ? t('filter.all')
      : t(`type.${value.toLowerCase()}` as 'type.land' | 'type.house' | 'type.flat')

  const filtered = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase()
    const matches = properties.filter((property) => {
      const matchesType = type === 'All' || property.type === type
      const matchesQuery =
        !lowerQuery ||
        `${localizedText(property.title, property.titleBn, locale)} ${localizedText(property.location, property.locationBn, locale)} ${property.type}`
          .toLowerCase()
          .includes(lowerQuery)
      const matchesBeds = beds === 'Any bedrooms' || (property.beds ?? 0) >= Number.parseInt(beds, 10)
      const matchesBudget =
        budget === 'Any budget' ||
        (budget === 'Under ৳1 Cr' && property.price < 10000000) ||
        (budget === '৳1–3 Cr' && property.price >= 10000000 && property.price <= 30000000) ||
        (budget === 'Over ৳3 Cr' && property.price > 30000000)
      const matchesArea = !minArea || property.area >= Number.parseInt(minArea, 10)
      return matchesType && matchesQuery && matchesBeds && matchesBudget && matchesArea
    })
    return [...matches].sort((a, b) =>
      sort === 'Price: low to high'
        ? a.price - b.price
        : sort === 'Price: high to low'
          ? b.price - a.price
          : Number(b.featured) - Number(a.featured),
    )
  }, [beds, budget, minArea, locale, properties, query, sort, type])

  function updateFilter(nextType: string) {
    setType(nextType)
    const params = new URLSearchParams(searchParams.toString())
    if (nextType === 'All') params.delete('type')
    else params.set('type', nextType)
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  const activeFilters = [
    type !== 'All' ? typeLabel(type) : null,
    query ? query : null,
    budget !== 'Any budget'
      ? t(`budget.${budget === 'Under ৳1 Cr' ? 'under1Cr' : budget === '৳1–3 Cr' ? 'oneTo3Cr' : 'over3Cr'}`)
      : null,
    beds !== 'Any bedrooms'
      ? t(`beds.${Number.parseInt(beds, 10)}plus` as 'beds.2plus' | 'beds.3plus' | 'beds.4plus')
      : null,
    minArea ? `${minArea} ${t('filter.sqFtSuffix')}` : null,
  ].filter(Boolean) as string[]

  const sortOptions: Array<{ value: string; label: string }> = [
    { value: 'Recommended', label: t('sort.recommended') },
    { value: 'Price: low to high', label: t('sort.priceLowToHigh') },
    { value: 'Price: high to low', label: t('sort.priceHighToLow') },
  ]

  return (
    <div className="container-shell pb-24">
      <div className="flex flex-col gap-5 border-b border-line pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{t('listings.eyebrow')}</p>
          <h1 className="display-type mt-3 text-5xl leading-[.9] sm:text-7xl">
            {t('listings.title1')}
            <br />
            <em className="font-normal text-terracotta">{t('listings.title2')}</em>
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-7 text-ink/60 lg:pb-1">{t('listings.copy')}</p>
      </div>
      <div className="sticky top-0 z-30 -mx-5 mt-8 border-y border-line bg-paper/95 px-5 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-panel sm:border sm:px-3 lg:static lg:mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 gap-1 overflow-x-auto pb-1 sm:pb-0">
            {types.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => updateFilter(item)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold transition',
                  type === item ? 'bg-ink text-paper' : 'text-ink/55 hover:bg-stone hover:text-ink',
                )}
              >
                {typeLabel(item)}
                <span className={cn('ml-1.5 text-[10px]', type === item ? 'text-paper/50' : 'text-ink/30')}>
                  {item === 'All'
                    ? properties.length
                    : properties.filter((property) => property.type === item).length}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-3 text-xs font-bold lg:hidden"
          >
            <Filter className="h-3.5 w-3.5" /> {t('filter.title')}
          </button>
          <div className="hidden items-center gap-2 lg:flex">
            <label className="flex h-10 items-center gap-2 rounded-full border border-line px-3 text-xs font-semibold">
              <Search className="h-3.5 w-3.5 text-ink/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('hero.neighbourhood')}
                className="w-36 bg-transparent outline-none placeholder:text-ink/35"
              />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-full border border-line px-3 text-xs font-semibold">
              <span className="text-ink/40">{t('filter.sort')}</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="bg-transparent outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3 w-3 text-ink/40" />
            </label>
            <div className="flex rounded-full border border-line p-0.5">
              <button
                type="button"
                onClick={() => setView('grid')}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  view === 'grid' && 'bg-stone',
                )}
                aria-label={t('a11y.gridView')}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  view === 'list' && 'bg-stone',
                )}
                aria-label={t('a11y.listView')}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('map')}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  view === 'map' && 'bg-stone',
                )}
                aria-label={t('a11y.mapView')}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm font-semibold">
          {t('listings.resultsCount', { count: filtered.length })}{' '}
          <span className="font-normal text-ink/45">· {t('listings.curated')}</span>
        </p>
        <div className="flex w-full min-w-0 items-center justify-end gap-2 lg:hidden">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line px-3 text-xs font-semibold">
            <span className="shrink-0 text-ink/40">{t('filter.sort')}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="min-w-0 flex-1 bg-transparent outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex shrink-0 rounded-full border border-line p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={cn('h-8 w-8 rounded-full', view === 'grid' && 'bg-stone')}
              aria-label={t('a11y.gridView')}
            >
              <Grid2X2 className="mx-auto h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn('h-8 w-8 rounded-full', view === 'list' && 'bg-stone')}
              aria-label={t('a11y.listView')}
            >
              <List className="mx-auto h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('map')}
              className={cn('h-8 w-8 rounded-full', view === 'map' && 'bg-stone')}
              aria-label="Map view"
            >
              <Map className="mx-auto h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} tone="accent">
              {filter}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <button
            type="button"
            className="text-[10px] font-bold uppercase tracking-[.14em] text-ink/45 hover:text-terracotta"
            onClick={() => {
              setType('All')
              setQuery('')
              setBudget('Any budget')
              setBeds('Any bedrooms')
              setMinArea('')
            }}
          >
            {t('filter.clearAll')}
          </button>
        </div>
      )}
      <div className="mt-8">
        {view === 'map' ? (
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <div className="order-2 grid gap-8 sm:grid-cols-2 lg:order-1 lg:max-h-[580px] lg:overflow-y-auto lg:pr-2">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <MapPanel count={filtered.length} />
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className={cn(
                view === 'grid' ? 'grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-5',
              )}
            >
              <AnimatePresence>
                {filtered.map((property, index) => (
                  <motion.div
                    key={property.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.035 } }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    {view === 'grid' ? (
                      <PropertyCard property={property} priority={index < 3} />
                    ) : (
                      <PropertyCard property={property} variant="list" priority={index < 2} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="rounded-panel border border-dashed border-line py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone">
              <Search className="h-5 w-5 text-terracotta" />
            </div>
            <h2 className="display-type mt-5 text-3xl">{t('listings.emptyTitle')}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/55">{t('listings.emptyCopy')}</p>
            <Button variant="secondary" className="mt-6">
              {t('listings.requestProperty')}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-ink/45">
        <SlidersHorizontal className="h-3.5 w-3.5" /> {t('listings.pageNote')}
      </div>
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={() => setFilterOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-paper p-6 shadow-float"
            >
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-line" />
              <div className="flex items-center justify-between">
                <h2 className="display-type text-3xl">{t('filter.refineTitle')}</h2>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="h-10 w-10 rounded-full bg-stone"
                  aria-label={t('a11y.closeFilters')}
                >
                  <X className="mx-auto h-4 w-4" />
                </button>
              </div>
              <div className="mt-7 space-y-5">
                <label className="block">
                  <span className="eyebrow">{t('hero.neighbourhood')}</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('filter.neighbourhoodPlaceholder')}
                    className="mt-2 h-12 w-full rounded-xl border border-line bg-transparent px-4 text-sm outline-none focus:border-terracotta"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow">{t('hero.budget')}</span>
                  <select
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-line bg-transparent px-4 text-sm outline-none"
                  >
                    <option value="Any budget">{t('budget.any')}</option>
                    <option value="Under ৳1 Cr">{t('budget.under1Cr')}</option>
                    <option value="৳1–3 Cr">{t('budget.oneTo3Cr')}</option>
                    <option value="Over ৳3 Cr">{t('budget.over3Cr')}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="eyebrow">{t('filter.minArea')}</span>
                  <input
                    value={minArea}
                    onChange={(event) => setMinArea(event.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    placeholder="e.g. 1500 sq ft"
                    className="mt-2 h-12 w-full rounded-xl border border-line bg-transparent px-4 text-sm outline-none focus:border-terracotta"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow">{t('filter.bedrooms')}</span>
                  <select
                    value={beds}
                    onChange={(event) => setBeds(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-line bg-transparent px-4 text-sm outline-none"
                  >
                    <option value="Any bedrooms">{t('filter.anyBedrooms')}</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </label>
              </div>
              <Button className="mt-7 w-full" size="lg" onClick={() => setFilterOpen(false)}>
                {t('filter.showCount', { count: filtered.length })}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
