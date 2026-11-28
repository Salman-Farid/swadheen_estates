import { HomePage } from '@/components/home/home-page'
import { JsonLd } from '@/components/seo/json-ld'
import { properties as staticProperties } from '@/data/properties'
import { projectVideos as staticVideos } from '@/data/videos'
import { getPublishedProperties } from '@/features/listings/services/public-listings'
import { getPublicVideos } from '@/features/videos/services/public-videos'
import { getHeroImages } from '@/features/hero/services/public-hero'
import { env } from '@/lib/env'

// Refresh every minute so featured listings follow the admin panel.
export const revalidate = 60

export default async function Page() {
  const listings = (await getPublishedProperties()) ?? staticProperties
  const videos = (await getPublicVideos()) ?? staticVideos
  const heroImages = (await getHeroImages()) ?? undefined
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Swadheen Estates',
          url: env.NEXT_PUBLIC_SITE_URL,
          description: 'Thoughtfully selected land, houses and apartments across Dhaka.',
        }}
      />
      <HomePage properties={listings} videos={videos} heroImages={heroImages} />
    </>
  )
}
