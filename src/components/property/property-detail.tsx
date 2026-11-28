'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  Building2,
  Check,
  Download,
  Heart,
  MapPin,
  Ruler,
  ShowerHead,
  Star,
  Tag,
  Trees,
} from 'lucide-react'
import { propertyMeta, formatPrice } from '@/lib/format'
import { env } from '@/lib/env'
import type { Property } from '@/types/property'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ButtonLink } from '@/components/ui/button'
import { Badge, FeatureBadge, StatusBadge, VerifiedBadge } from '@/components/ui/badge'
import { EnquiryCard } from '@/components/leads/enquiry-card'
import { LazyMediaExperience } from '@/components/experience/lazy-media-experience'
import { PropertyCard } from '@/components/property/property-card'
import { PropertyGallery } from '@/components/property/property-gallery'
import { properties } from '@/data/properties'
import { JsonLd } from '@/components/seo/json-ld'
import { useLocale } from '@/i18n/locale-provider'
import { localizedText } from '@/i18n/localize'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/features/wishlist/wishlist-provider'

function Spec({ icon: Icon, label, value }: { icon: typeof BedDouble; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-r border-line pr-5 last:border-0">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone text-terracotta">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">{label}</p>
        <p className="mt-1 text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

export function PropertyDetailPage({
  property,
  related,
}: {
  property: Property
  related?: Property[]
}) {
  const { locale, t } = useLocale()
  const { isSaved, toggleSaved } = useWishlist()
  const saved = isSaved(property.slug)
  const title = localizedText(property.title, property.titleBn, locale)
  const typeValue = t(`type.${property.type.toLowerCase()}` as 'type.land' | 'type.house' | 'type.flat')
  // `related` comes from the server (live catalogue); the static catalogue is
  // the no-database fallback. Matched by slug — DB ids differ from static ids.
  const similar = (related ?? properties)
    .filter((item) => item.slug !== property.slug && item.type === property.type)
    .slice(0, 3)
  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: property.title,
          description: property.description,
          url: `${env.NEXT_PUBLIC_SITE_URL}/properties/${property.slug}`,
          image: property.image,
          address: { '@type': 'PostalAddress', addressLocality: property.location, addressCountry: 'BD' },
          offers: {
            '@type': 'Offer',
            priceCurrency: property.currency,
            price: property.price,
            availability:
              property.status === 'Available'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        }}
      />
      <Header />
      <main>
        <div className="container-shell pt-8 sm:pt-12">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-xs font-bold text-ink/50 transition hover:text-terracotta"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t('detail.backToProperties')}
          </Link>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <StatusBadge status={property.status} />
            {property.featured && <FeatureBadge />}
            {property.verified && <VerifiedBadge />}
            <span className="ml-1 text-xs text-ink/45">
              {t('detail.listedBy').replace('{ref}', property.id.toUpperCase())}
            </span>
          </div>
          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="display-type max-w-3xl">{title}</h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-ink/55">
                <MapPin className="h-4 w-4 text-terracotta" />
                {localizedText(property.location, property.locationBn, locale)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleSaved({ slug: property.slug })}
                aria-label={saved ? t('a11y.unsaveProperty') : t('a11y.saveProperty')}
                aria-pressed={saved}
                className={cn(
                  'flex h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold transition',
                  saved
                    ? 'border-terracotta text-terracotta'
                    : 'border-line hover:border-terracotta hover:text-terracotta',
                )}
              >
                <Heart className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />{' '}
                {saved ? t('detail.saved') : t('detail.save')}
              </button>
              <button
                type="button"
                className="flex h-11 items-center gap-2 rounded-full border border-line px-4 text-xs font-bold transition hover:border-terracotta hover:text-terracotta"
              >
                {t('detail.share')} <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-8">
            <PropertyGallery
              images={
                property.gallery.length > 0 ? property.gallery : [property.image]
              }
              title={title}
              focalPoint={property.focalPoint}
              badge={
                <>
                  <Badge tone="dark">{typeValue}</Badge>
                  {/* 360° badge switched off for now.
                  {property.has360 && <Badge tone="dark">{t('detail.tour360')}</Badge>}
                  */}
                </>
              }
            />
          </div>
        </div>
        <div className="container-shell grid items-start gap-12 pb-24 pt-12 lg:grid-cols-[1.45fr_.65fr]">
          <div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b border-line pb-7 sm:flex sm:flex-wrap sm:gap-7">
              <Spec
                icon={BedDouble}
                label={t('spec.bedrooms')}
                value={property.beds ? String(property.beds) : '—'}
              />
              <Spec
                icon={ShowerHead}
                label={t('spec.bathrooms')}
                value={property.baths ? String(property.baths) : '—'}
              />
              <Spec
                icon={Ruler}
                label={t('spec.area')}
                value={`${property.area.toLocaleString()} ${property.areaUnit}`}
              />
              <Spec
                icon={Building2}
                label={t('spec.floor')}
                value={property.floor ?? t('detail.landFloor')}
              />
            </div>
            <div className="mt-10">
              <p className="eyebrow">{t('detail.brief')}</p>
              <h2 className="display-type mt-3 text-4xl">{t('propertyBrief')}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-ink/65">
                {localizedText(property.description, property.descriptionBn, locale)}
              </p>
            </div>
            <div className="mt-10 grid gap-4 rounded-panel border border-line bg-stone p-5 sm:grid-cols-2">
              <div>
                <p className="eyebrow">{t('detail.atAGlance')}</p>
                <ul className="mt-4 space-y-3 text-sm text-ink/65">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-moss" />
                    {t('detail.glanceOwnership')}
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-moss" />
                    {t('detail.glanceVerified')}
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-moss" />
                    {t('detail.glanceViewing')}
                  </li>
                </ul>
              </div>
              <div className="rounded-xl bg-paper p-4">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">
                  {t('detail.documents')}
                </p>
                <p className="mt-2 text-sm font-bold">{t('detail.infoPack')}</p>
                <p className="mt-1 text-xs leading-5 text-ink/50">{t('detail.infoPackCopy')}</p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-terracotta"
                >
                  <Download className="h-3.5 w-3.5" /> {t('detail.requestDocuments')}
                </button>
              </div>
            </div>
            <div className="mt-12">
              <p className="eyebrow">{t('experience')}</p>
              <h2 className="display-type mt-3 text-4xl">{t('lookCloser')}</h2>
              <p className="mt-3 text-sm text-ink/55">{t('detail.experienceCopy')}</p>
              <LazyMediaExperience property={property} />
            </div>
            <div className="mt-14">
              <div className="flex items-end justify-between">
                <div>
                  <p className="eyebrow">{t('details')}</p>
                  <h2 className="display-type mt-3 text-4xl">{t('detail.everydayEase')}</h2>
                </div>
                <span className="hidden text-xs text-ink/40 sm:block">
                  {t('detail.amenitiesCount', { count: property.amenities.length })}
                </span>
              </div>
              <div className="mt-7 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                {(property.amenitiesBn && locale === 'bn' ? property.amenitiesBn : property.amenities).map(
                  (amenity, amenityIndex) => (
                    <div
                      key={`${amenity}-${amenityIndex}`}
                      className="flex items-center gap-3 border-b border-line pb-4 text-sm text-ink/70"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone text-terracotta">
                        <Trees className="h-4 w-4" />
                      </span>
                      {amenity}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
          <EnquiryCard property={property} />
        </div>
        <section className="border-t border-line bg-stone py-20">
          <div className="container-shell">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">{t('detail.keepExploring')}</p>
                <h2 className="display-type mt-3 text-4xl sm:text-5xl">{t('detail.mayAlsoLike')}</h2>
              </div>
              <ButtonLink href="/properties" variant="outline" className="hidden sm:inline-flex">
                {t('detail.viewAll')} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
