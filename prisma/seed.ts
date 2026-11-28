import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'
import { properties as staticProperties } from '../src/data/properties'
import { staticProjects } from '../src/data/projects'
import { buildWebFields } from '../src/features/listings/services/web-fields'
import type { Property } from '../src/types/property'

const prisma = new PrismaClient()

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=88`

// ---------------------------------------------------------------------------
// Catalogue policy (owner's instructions, 2026-11-28):
// - The admin account's display name is just "Admin" — no personal name.
// - The catalogue stays FULL: the original 12 listings and The Grove project
//   are kept, expanded to 24 properties and 21 projects with photography
//   sourced from Unsplash. Everything is upserted by slug, so re-running the
//   seed on every deploy never duplicates rows.
// ---------------------------------------------------------------------------

type ProjectSeed = {
  slug: string
  name: string
  location: string
  description: string
  coverImage: string
  gallery: string[]
  totalUnits: number
  deliveredAt: string | null
}

const extraProjects: ProjectSeed[] = [
  { slug: 'parkside-banani', name: 'Parkside Banani', location: 'Banani, Dhaka', description: 'Homes that open to the park side of Banani — deep balconies, morning light and a slower pace in the middle of the city.', coverImage: img('photo-1545324418-cc1a3fa10c00'), gallery: [img('photo-1545324418-cc1a3fa10c00'), img('photo-1600607687920-4e2a09cf159d')], totalUnits: 36, deliveredAt: null },
  { slug: 'angina-gulshan', name: 'Angina Enclave, Gulshan', location: 'Gulshan 2, Dhaka', description: 'A small enclave of courtyard houses in Gulshan 2, planned around one shared green court.', coverImage: img('photo-1600596542815-ffad4c1539a9'), gallery: [img('photo-1600596542815-ffad4c1539a9'), img('photo-1600585154340-be6161a56a0c')], totalUnits: 12, deliveredAt: '2022-06-15' },
  { slug: 'lakeview-uttara', name: 'Lakeview Residences, Uttara', location: 'Sector 11, Uttara', description: 'Lake-facing apartments in Uttara Sector 11 with wide windows, a rooftop garden and a residents club.', coverImage: img('photo-1460317442991-0ec209397118'), gallery: [img('photo-1460317442991-0ec209397118'), img('photo-1522708323590-d24dbb6b0267')], totalUnits: 64, deliveredAt: null },
  { slug: 'pallabi-heights', name: 'Pallabi Heights, Mirpur DOHS', location: 'Mirpur DOHS, Dhaka', description: 'Calm, well-kept apartment living inside Mirpur DOHS — wide roads, greenery and strong community facilities.', coverImage: img('photo-1486406146926-c627a92ad1ab'), gallery: [img('photo-1486406146926-c627a92ad1ab'), img('photo-1560448204-e02f11c3d0e2')], totalUnits: 56, deliveredAt: null },
  { slug: 'baridhara-villas', name: 'Baridhara Villas', location: 'Baridhara, Dhaka', description: 'A handful of large private villas in the diplomatic zone — high walls, deep gardens and complete privacy.', coverImage: img('photo-1512917774080-9991f1c4c750'), gallery: [img('photo-1512917774080-9991f1c4c750'), img('photo-1613490493576-7fde63acd811')], totalUnits: 8, deliveredAt: '2024-03-01' },
  { slug: 'purbachal-greens', name: 'Purbachal Greens', location: 'Purbachal New Town, Dhaka', description: 'Serviced residential plots in Purbachal New Town, near the lake and the 300-feet highway.', coverImage: img('photo-1500076656116-558758c991c1'), gallery: [img('photo-1500076656116-558758c991c1'), img('photo-1500382017468-9049fed747ef')], totalUnits: 120, deliveredAt: null },
  { slug: 'banani-sky', name: 'Banani Sky', location: 'Road 11, Banani', description: 'A tall, light-filled tower on Banani Road 11 — the shops and cafes of Banani at your doorstep.', coverImage: img('photo-1545324418-cc1a3fa10c00'), gallery: [img('photo-1545324418-cc1a3fa10c00'), img('photo-1502005229762-cf1b2da7c5d6')], totalUnits: 72, deliveredAt: null },
  { slug: 'lake-terrace-dhanmondi', name: 'Lake Terrace, Dhanmondi', location: 'Dhanmondi 27, Dhaka', description: 'Apartments above the Dhanmondi lake edge — evening walks, old trees and the neighbourhood everyone loves.', coverImage: img('photo-1493809842364-78817add7ffb'), gallery: [img('photo-1493809842364-78817add7ffb'), img('photo-1600210492486-724fe5c67fb0')], totalUnits: 40, deliveredAt: null },
  { slug: 'uttara-courtyards', name: 'Uttara Courtyards', location: 'Sector 7, Uttara', description: 'Low-rise courtyard villas in Uttara Sector 7, each with its own garden court and terrace.', coverImage: img('photo-1568605114967-8130f3a36994'), gallery: [img('photo-1568605114967-8130f3a36994'), img('photo-1600047509807-ba8f99d2cdde')], totalUnits: 18, deliveredAt: null },
  { slug: 'bashundhara-north-plots', name: 'Bashundhara North Plots', location: 'Block N, Bashundhara R/A', description: 'Ready plots in Block N of Bashundhara — wide internal roads, all utilities and quick registry.', coverImage: img('photo-1472214103451-9374bd1c798e'), gallery: [img('photo-1472214103451-9374bd1c798e'), img('photo-1625246333195-78d9c38ad449')], totalUnits: 36, deliveredAt: null },
  { slug: 'townhall-residences', name: 'Town Hall Residences', location: 'Mohammadpur, Dhaka', description: 'Honest, well-built family apartments near Mohammadpur Town Hall — schools, markets and transport close by.', coverImage: img('photo-1484154218962-a197022b5858'), gallery: [img('photo-1484154218962-a197022b5858'), img('photo-1600607687939-ce8a6c25118c')], totalUnits: 48, deliveredAt: null },
  { slug: 'gulshan-avenue', name: 'Gulshan Avenue Residences', location: 'Gulshan 1, Dhaka', description: 'Large-format residences just off Gulshan Avenue — concierge, club floor and valet parking.', coverImage: img('photo-1600121848594-d8644e57abab'), gallery: [img('photo-1600121848594-d8644e57abab'), img('photo-1600607688969-a5bfcd646154')], totalUnits: 60, deliveredAt: null },
  { slug: 'aftabnagar-lakeside', name: 'Aftabnagar Lakeside Plots', location: 'Aftabnagar, Dhaka', description: 'Plots along the Aftabnagar lake — a quieter, greener edge of the city that is growing fast.', coverImage: img('photo-1500382017468-9049fed747ef'), gallery: [img('photo-1500382017468-9049fed747ef'), img('photo-1500076656116-558758c991c1')], totalUnits: 44, deliveredAt: null },
  { slug: 'heritage-dhanmondi', name: 'Heritage Dhanmondi', location: 'Dhanmondi 8/A, Dhaka', description: 'A carefully restored older building in Dhanmondi 8/A — high ceilings, thick walls and old-Dhaka calm.', coverImage: img('photo-1600210492486-724fe5c67fb0'), gallery: [img('photo-1600210492486-724fe5c67fb0'), img('photo-1600607687644-c7171b42498f')], totalUnits: 16, deliveredAt: '2023-09-10' },
  { slug: 'mirpur-lake-residences', name: 'Mirpur Lake Residences', location: 'Mirpur 12, Dhaka', description: 'New towers beside the Mirpur lake with a podium garden, gym and community hall.', coverImage: img('photo-1460317442991-0ec209397118'), gallery: [img('photo-1460317442991-0ec209397118'), img('photo-1600566753190-17f0baa2a6c3')], totalUnits: 80, deliveredAt: null },
  { slug: 'bashundhara-riverview', name: 'Bashundhara Riverview', location: 'Bashundhara R/A, Dhaka', description: 'River-breeze apartments at the quieter end of Bashundhara, with a long green promenade in front.', coverImage: img('photo-1600585154340-be6161a56a0c'), gallery: [img('photo-1600585154340-be6161a56a0c'), img('photo-1600607687920-4e2a09cf159d')], totalUnits: 90, deliveredAt: null },
  { slug: 'uttara-13-towers', name: 'Uttara Sector 13 Towers', location: 'Sector 13, Uttara', description: 'Twin towers in Uttara Sector 13 near the metro line — compact, bright and easy to maintain.', coverImage: img('photo-1486406146926-c627a92ad1ab'), gallery: [img('photo-1486406146926-c627a92ad1ab'), img('photo-1600210491892-03d54c0aaf87')], totalUnits: 66, deliveredAt: null },
  { slug: 'banani-11-residences', name: 'Banani 11 Residences', location: 'Road 11, Banani', description: 'Boutique residences on Banani Road 11 — few neighbours, large rooms and a green roof terrace.', coverImage: img('photo-1600607687939-ce8a6c25118c'), gallery: [img('photo-1600607687939-ce8a6c25118c'), img('photo-1556912167-f556f1f39fdf')], totalUnits: 36, deliveredAt: null },
  { slug: 'dhanmondi-lake-homes', name: 'Dhanmondi Lake Homes', location: 'Dhanmondi 32, Dhaka', description: 'A small collection of lake-side homes near Dhanmondi 32 — the lake at the end of the street.', coverImage: img('photo-1600047509807-ba8f99d2cdde'), gallery: [img('photo-1600047509807-ba8f99d2cdde'), img('photo-1600585152220-90363fe7e115')], totalUnits: 24, deliveredAt: null },
  { slug: 'purbachal-19-plots', name: 'Purbachal Sector 19 Plots', location: 'Sector 19, Purbachal New Town', description: 'Well-shaped plots in Purbachal Sector 19, close to the proposed stadium and the central park.', coverImage: img('photo-1625246333195-78d9c38ad449'), gallery: [img('photo-1625246333195-78d9c38ad449'), img('photo-1472214103451-9374bd1c798e')], totalUnits: 58, deliveredAt: null },
]

const commonAmenities = ['24/7 security', 'Backup generator', 'Reserved parking', 'CCTV monitored']
const commonAmenitiesBn = ['২৪ ঘণ্টা নিরাপত্তা', 'ব্যাকআপ জেনারেটর', 'সংরক্ষিত পার্কিং', 'সিসিটিভ নজরদারি']

function extraProperty(
  input: Omit<Property, 'currency' | 'focalPoint'> & { focalPoint?: Property['focalPoint'] },
): Property {
  return { ...input, currency: 'BDT', focalPoint: input.focalPoint ?? { x: 50, y: 50 } }
}

const extraProperties: Property[] = [
  extraProperty({
    id: 'se-101', slug: 'lakeview-uttara-7b', title: 'Lakeview Residence · 7B', titleBn: 'লেকভিউ রেসিডেন্স · ৭বি',
    type: 'Flat', status: 'Available', location: 'Sector 11, Uttara', locationBn: 'সেক্টর ১১, উত্তরা',
    price: 19200000, area: 1850, areaUnit: 'sq ft', beds: 3, baths: 3, floor: 'Level 07', facing: 'West (lake side)',
    image: img('photo-1522708323590-d24dbb6b0267'),
    gallery: [img('photo-1522708323590-d24dbb6b0267'), img('photo-1600607687920-4e2a09cf159d'), img('photo-1556912167-f556f1f39fdf')],
    summary: 'A lake-facing flat with evening light across the whole living room.',
    summaryBn: 'লেকের দিকে মুখ করা ফ্ল্যাট — সন্ধ্যার আলো পুরো বসার ঘর জুড়ে।',
    description: 'Residence 7B looks straight over the Uttara lake. A long balcony runs along the living room, the kitchen gets morning sun, and the building adds a rooftop garden and a small residents club.',
    descriptionBn: 'রেসিডেন্স ৭বি সরাসরি উত্তরার লেকের দিকে মুখ করা। বসার ঘর জুড়ে লম্বা বারান্দা, রান্নাঘরে সকালের রোদ, আর ভবনে আছে ছাদের বাগান ও ছোট্ট রেসিডেন্টস ক্লাব।',
    amenities: [...commonAmenities, 'Rooftop garden', 'Residents club'], amenitiesBn: [...commonAmenitiesBn, 'ছাদের বাগান', 'রেসিডেন্টস ক্লাব'],
    badges: ['Lake view'], featured: true, verified: true, has3d: false, has360: true, hasVideo: false,
    project: 'Lakeview Residences, Uttara', projectSlug: 'lakeview-uttara', completion: 'Ready to move',
  }),
  extraProperty({
    id: 'se-102', slug: 'pallabi-heights-5a', title: 'Pallabi Heights · 5A', titleBn: 'পল্লবী হাইটস · ৫এ',
    type: 'Flat', status: 'Available', location: 'Mirpur DOHS, Dhaka', locationBn: 'মিরপুর ডিওএইচএস, ঢাকা',
    price: 15800000, area: 1620, areaUnit: 'sq ft', beds: 3, baths: 2, floor: 'Level 05', facing: 'South',
    image: img('photo-1560448204-e02f11c3d0e2'),
    gallery: [img('photo-1560448204-e02f11c3d0e2'), img('photo-1600566753086-00f18fb6b3ea'), img('photo-1600210491892-03d54c0aaf87')],
    summary: 'A calm DOHS flat on a tree-lined internal road.',
    summaryBn: 'গাছপালা ঘেরা ভেতরের রাস্তায় শান্ত ডিওএইচএস ফ্ল্যাট।',
    description: 'Inside Mirpur DOHS, 5A is a practical family flat: three bedrooms, a separate dining space and a kitchen with a utility balcony. The DOHS lake and parade ground are a short walk away.',
    descriptionBn: 'মিরপুর ডিওএইচএসের ভেতরে ৫এ একটি প্রাণবন্ত পারিবারিক ফ্ল্যাট: তিন বেডরুম, আলাদা ডাইনিং আর ইউটিলিটি বারান্দাসহ রান্নাঘর। ডিওএইচএস লেক ও প্যারেড গ্রাউন্ড হাঁটা দূরত্বে।',
    amenities: [...commonAmenities, 'Community hall'], amenitiesBn: [...commonAmenitiesBn, 'কমিউনিটি হল'],
    badges: [], featured: false, verified: true, has3d: false, has360: false, hasVideo: false,
    project: 'Pallabi Heights, Mirpur DOHS', projectSlug: 'pallabi-heights', completion: 'Ready to move',
  }),
  extraProperty({
    id: 'se-103', slug: 'baridhara-diplomatic-villa', title: 'Diplomatic Villa · Baridhara', titleBn: 'ডিপ্লোম্যাটিক ভিলা · বারিধারা',
    type: 'House', status: 'Available', location: 'Baridhara, Dhaka', locationBn: 'বারিধারা, ঢাকা',
    price: 115000000, area: 6200, areaUnit: 'sq ft', beds: 5, baths: 6, floor: '3 levels', facing: 'East',
    image: img('photo-1613490493576-7fde63acd811'),
    gallery: [img('photo-1613490493576-7fde63acd811'), img('photo-1512917774080-9991f1c4c750'), img('photo-1600121848594-d8644e57abab')],
    summary: 'A full private villa in the diplomatic zone with a pool and deep garden.',
    summaryBn: 'ডিপ্লোম্যাটিক জোনে পুল ও বড় বাগানসহ সম্পূর্ণ ব্যক্তিগত ভিলা।',
    description: 'One of the few full villas in Baridhara: five bedrooms, staff quarters, a private pool and a garden deep enough to forget the city. Suitable for an embassy residence or a large family.',
    descriptionBn: 'বারিধারার হাতে গোনা পূর্ণাঙ্গ ভিলার একটি: পাঁচ বেডরুম, স্টাফ কোয়ার্টার, ব্যক্তিগত পুল আর শহর ভুলিয়ে দেওয়ার মতো বাগান। দূতাবাসের বাসভবন বা বড় পরিবারের জন্য উপযুক্ত।',
    amenities: [...commonAmenities, 'Private pool', 'Staff quarters', 'Deep garden'], amenitiesBn: [...commonAmenitiesBn, 'ব্যক্তিগত পুল', 'স্টাফ কোয়ার্টার', 'বড় বাগান'],
    badges: ['Featured', 'Rare'], featured: true, verified: true, has3d: true, has360: true, hasVideo: true,
    project: 'Baridhara Villas', projectSlug: 'baridhara-villas', completion: 'Ready to move',
  }),
  extraProperty({
    id: 'se-104', slug: 'purbachal-19-plot-214', title: 'Sector 19 Plot · Purbachal', titleBn: 'সেক্টর ১৯ প্লট · পূর্বাচল',
    type: 'Land', status: 'Available', location: 'Sector 19, Purbachal New Town', locationBn: 'সেক্টর ১৯, পূর্বাচল নিউ টাউন',
    price: 9800000, area: 5, areaUnit: 'katha',
    image: img('photo-1625246333195-78d9c38ad449'),
    gallery: [img('photo-1625246333195-78d9c38ad449'), img('photo-1472214103451-9374bd1c798e')],
    summary: 'A regular 5 katha plot near the proposed stadium and central park.',
    summaryBn: 'প্রস্তাবিত স্টেডিয়াম ও সেন্ট্রাল পার্কের কাছে নিয়মিত আকৃতির ৫ কাঠার প্লট।',
    description: 'A clean, regular-shaped 5 katha plot in Sector 19 with a 25-feet front road. Allotment papers are complete and mutation is done — ready for immediate registry and future construction.',
    descriptionBn: 'সেক্টর ১৯ এ ২৫ ফুট সামনের রাস্তাসহ পরিষ্কার, নিয়মিত আকৃতির ৫ কাঠার প্লট। বরাদ্দের কাগজপত্র সম্পূর্ণ, মিউটেশন করা — তাৎক্ষণিক রেজিস্ট্রি ও ভবিষ্যৎ নির্মাণের জন্য প্রস্তুত।',
    amenities: ['25 ft front road', 'Mutation complete'], amenitiesBn: ['২৫ ফুট সামনের রাস্তা', 'মিউটেশন সম্পূর্ণ'],
    badges: [], featured: false, verified: true, has3d: false, has360: false, hasVideo: false,
    project: 'Purbachal Sector 19 Plots', projectSlug: 'purbachal-19-plots', completion: 'Ready for registry',
  }),
  extraProperty({
    id: 'se-105', slug: 'banani-sky-12c', title: 'Banani Sky · 12C', titleBn: 'বনানী স্কাই · ১২সি',
    type: 'Flat', status: 'Available', location: 'Road 11, Banani', locationBn: 'রোড ১১, বনানী',
    price: 26500000, area: 2100, areaUnit: 'sq ft', beds: 3, baths: 3, floor: 'Level 12', facing: 'North-east',
    image: img('photo-1502005229762-cf1b2da7c5d6'),
    gallery: [img('photo-1502005229762-cf1b2da7c5d6'), img('photo-1600607688969-a5bfcd646154'), img('photo-1552321554-5fefe8c9ef14')],
    summary: 'High-floor living above Banani Road 11 with the city spread out below.',
    summaryBn: 'বনানী রোড ১১ এর উপরে উঁচু তলার বাস — নিচে ছড়িয়ে পুরো শহর।',
    description: 'On the 12th floor of Banani Sky, 12C gets light from two sides and a view over the Banani rooftops. Concierge, gym and a club floor are in the building; Road 11 cafes are downstairs.',
    descriptionBn: 'বনানী স্কাইয়ের ১২ তলায় ১২সি দুই দিক থেকে আলো পায়, বারান্দা থেকে বনানীর ছাদগুলোর দৃশ্য। ভবনে কনসিয়ার্জ, জিম ও ক্লাব ফ্লোর; রোড ১১ এর ক্যাফে নিচেই।',
    amenities: [...commonAmenities, 'Concierge', 'Gym', 'Club floor'], amenitiesBn: [...commonAmenitiesBn, 'কনসিয়ার্জ', 'জিম', 'ক্লাব ফ্লোর'],
    badges: ['High floor'], featured: false, verified: true, has3d: false, has360: true, hasVideo: false,
    project: 'Banani Sky', projectSlug: 'banani-sky', completion: 'Ready to move',
  }),
  extraProperty({
    id: 'se-106', slug: 'lake-terrace-9d', title: 'Lake Terrace · 9D', titleBn: 'লেক টেরেস · ৯ডি',
    type: 'Flat', status: 'Booked', location: 'Dhanmondi 27, Dhaka', locationBn: 'ধানমন্ডি ২৭, ঢাকা',
    price: 23500000, area: 1980, areaUnit: 'sq ft', beds: 3, baths: 3, floor: 'Level 09', facing: 'West (lake side)',
    image: img('photo-1493809842364-78817add7ffb'),
    gallery: [img('photo-1493809842364-78817add7ffb'), img('photo-1600210492486-724fe5c67fb0'), img('photo-1600585152220-90363fe7e115')],
    summary: 'A lake-side Dhanmondi flat with a terrace made for slow evenings.',
    summaryBn: 'লেকের ধারের ধানমন্ডি ফ্ল্যাট — ধীর সন্ধ্যার জন্য বানানো টেরেস।',
    description: '9D faces the Dhanmondi lake from the ninth floor. The terrace is deep enough for a garden of potted plants, and the living room catches the sunset over the water every clear evening.',
    descriptionBn: '৯ডি নবম তলা থেকে ধানমন্ডি লেকের দিকে মুখ করা। টেরেসে টবের বাগান করার মতো জায়গা, আর পরিষ্কার সন্ধ্যায় বসার ঘরে পানির উপর সূর্যাস্ত ধরা দেয়।',
    amenities: [...commonAmenities, 'Deep terrace'], amenitiesBn: [...commonAmenitiesBn, 'বড় টেরেস'],
    badges: ['Lake view'], featured: false, verified: true, has3d: false, has360: false, hasVideo: false,
    project: 'Lake Terrace, Dhanmondi', projectSlug: 'lake-terrace-dhanmondi', completion: 'Ready to move',
  }),
  extraProperty({
    id: 'se-107', slug: 'uttara-courtyard-villa', title: 'Courtyard Villa · Uttara 7', titleBn: 'আঙিনা ভিলা · উত্তরা ৭',
    type: 'House', status: 'Available', location: 'Sector 7, Uttara', locationBn: 'সেক্টর ৭, উত্তরা',
    price: 59000000, area: 4100, areaUnit: 'sq ft', beds: 4, baths: 5, floor: '2 levels', facing: 'South',
    image: img('photo-1568605114967-8130f3a36994'),
    gallery: [img('photo-1568605114967-8130f3a36994'), img('photo-1600047509807-ba8f99d2cdde'), img('photo-1600585154340-be6161a56a0c')],
    summary: 'A two-storey villa around its own courtyard in Uttara Sector 7.',
    summaryBn: 'উত্তরা সেক্টর ৭ এ নিজস্ব আঙিনা ঘিরে দোতলা ভিলা।',
    description: 'Every room in this villa opens to the central courtyard, so the house breathes all day. Four bedrooms, a family room upstairs and a garden that wraps around two sides.',
    descriptionBn: 'এই ভিলার প্রতিটি ঘর মাঝের আঙিনার দিকে খোলে, তাই সারাদিন বাড়িতে হাওয়া চলাচল করে। চার বেডরুম, উপরে ফ্যামিলি রুম আর দুই দিকে ঘেরা বাগান।',
    amenities: [...commonAmenities, 'Central courtyard', 'Wrap-around garden'], amenitiesBn: [...commonAmenitiesBn, 'মাঝের আঙিনা', 'ঘেরা বাগান'],
    badges: ['Featured'], featured: true, verified: true, has3d: false, has360: true, hasVideo: false,
    project: 'Uttara Courtyards', projectSlug: 'uttara-courtyards', completion: 'Ready to move',
  }),
  extraProperty({
    id: 'se-108', slug: 'bashundhara-north-plot-n77', title: 'Corner Plot N77 · Bashundhara', titleBn: 'কর্নার প্লট এন৭৭ · বসুন্ধরা',
    type: 'Land', status: 'Available', location: 'Block N, Bashundhara R/A', locationBn: 'ব্লক এন, বসুন্ধরা আ/এ',
    price: 14500000, area: 7.5, areaUnit: 'katha',
    image: img('photo-1472214103451-9374bd1c798e'),
    gallery: [img('photo-1472214103451-9374bd1c798e'), img('photo-1625246333195-78d9c38ad449')],
    summary: 'A 7.5 katha corner plot with roads on two sides in Block N.',
    summaryBn: 'ব্লক এন এ দুই দিকে রাস্তাসহ ৭.৫ কাঠার কর্নার প্লট।',
    description: 'Corner plots build better houses — light and air from two sides. N77 is a 7.5 katha corner plot in Block N with RAJUK approval history in the same row and all utilities at the boundary.',
    descriptionBn: 'কর্নার প্লটে ভালো বাড়ি হয় — দুই দিক থেকে আলো আর হাওয়া। এন৭৭ ব্লক এন এর ৭.৫ কাঠার কর্নার প্লট; একই সারিতে রাজউক অনুমোদনের ইতিহাস আছে, সব ইউটিলিটি সীমানায়।',
    amenities: ['Corner plot', 'All utilities at boundary'], amenitiesBn: ['কর্নার প্লট', 'সব ইউটিলিটি সীমানায়'],
    badges: ['Corner'], featured: false, verified: true, has3d: false, has360: false, hasVideo: false,
    project: 'Bashundhara North Plots', projectSlug: 'bashundhara-north-plots', completion: 'Ready for registry',
  }),
  extraProperty({
    id: 'se-109', slug: 'townhall-residence-4b', title: 'Town Hall Residence · 4B', titleBn: 'টাউন হল রেসিডেন্স · ৪বি',
    type: 'Flat', status: 'Available', location: 'Mohammadpur, Dhaka', locationBn: 'মোহাম্মদপুর, ঢাকা',
    price: 9800000, area: 1250, areaUnit: 'sq ft', beds: 3, baths: 2, floor: 'Level 04', facing: 'South-east',
    image: img('photo-1484154218962-a197022b5858'),
    gallery: [img('photo-1484154218962-a197022b5858'), img('photo-1600607687939-ce8a6c25118c'), img('photo-1556912167-f556f1f39fdf')],
    summary: 'An honest, bright family flat minutes from Mohammadpur Town Hall.',
    summaryBn: 'মোহাম্মদপুর টাউন হল থেকে কয়েক মিনিটে উজ্জ্বল পারিবারিক ফ্ল্যাট।',
    description: '4B is a sensible first home: three bedrooms, cross-ventilation and a kitchen that fits a family table. Schools, the Town Hall market and bus routes are all within a few minutes.',
    descriptionBn: '৪বি একটি যুক্তিসংগত প্রথম বাড়ি: তিন বেডরুম, ক্রস ভেন্টিলেশন আর পারিবারিক টেবিল বসার মতো রান্নাঘর। স্কুল, টাউন হল বাজার আর বাস রুট কয়েক মিনিটের মধ্যে।',
    amenities: [...commonAmenities], amenitiesBn: [...commonAmenitiesBn],
    badges: ['Good value'], featured: false, verified: true, has3d: false, has360: false, hasVideo: false,
    project: 'Town Hall Residences', projectSlug: 'townhall-residences', completion: 'Ready to move',
  }),
  extraProperty({
    id: 'se-110', slug: 'gulshan-avenue-15a', title: 'Avenue Residence · 15A', titleBn: 'অ্যাভিনিউ রেসিডেন্স · ১৫এ',
    type: 'Flat', status: 'Available', location: 'Gulshan 1, Dhaka', locationBn: 'গুলশান ১, ঢাকা',
    price: 38500000, area: 2650, areaUnit: 'sq ft', beds: 4, baths: 4, floor: 'Level 15', facing: 'East',
    image: img('photo-1600121848594-d8644e57abab'),
    gallery: [img('photo-1600121848594-d8644e57abab'), img('photo-1600607688969-a5bfcd646154'), img('photo-1600566752355-35792bedcfea')],
    summary: 'A large four-bedroom residence just off Gulshan Avenue.',
    summaryBn: 'গুলশান অ্যাভিনিউয়ের কাছেই বড় চার বেডরুমের বাসস্থান।',
    description: '15A is built for families who host: a formal living room, a family room, four full bedrooms and a kitchen with a dry store. The building runs a concierge and valet parking.',
    descriptionBn: '১৫এ মেহমানদারি করা পরিবারের জন্য: ফরমাল বসার ঘর, ফ্যামিলি রুম, চারটি পূর্ণ বেডরুম আর ড্রাই স্টোরসহ রান্নাঘর। ভবনে কনসিয়ার্জ ও ভ্যালে পার্কিং আছে।',
    amenities: [...commonAmenities, 'Concierge', 'Valet parking'], amenitiesBn: [...commonAmenitiesBn, 'কনসিয়ার্জ', 'ভ্যালে পার্কিং'],
    badges: ['Featured'], featured: true, verified: true, has3d: true, has360: true, hasVideo: false,
    project: 'Gulshan Avenue Residences', projectSlug: 'gulshan-avenue', completion: 'Ready to move',
  }),
  extraProperty({
    id: 'se-111', slug: 'aftabnagar-lakeside-plot-88', title: 'Lakeside Plot 88 · Aftabnagar', titleBn: 'লেকসাইড প্লট ৮৮ · আফতাবনগর',
    type: 'Land', status: 'Upcoming', location: 'Aftabnagar, Dhaka', locationBn: 'আফতাবনগর, ঢাকা',
    price: 8800000, area: 4, areaUnit: 'katha',
    image: img('photo-1500076656116-558758c991c1'),
    gallery: [img('photo-1500076656116-558758c991c1'), img('photo-1500382017468-9049fed747ef')],
    summary: 'A 4 katha plot a short walk from the Aftabnagar lake.',
    summaryBn: 'আফতাবনগর লেক থেকে হাঁটা দূরত্বে ৪ কাঠার প্লট।',
    description: 'Plot 88 sits two lanes from the Aftabnagar lake in a part of the neighbourhood that is filling up quickly. Handover of the plot documents is scheduled with the next release.',
    descriptionBn: 'প্লট ৮৮ আফতাবনগর লেক থেকে দুই গলি ভেতরে — এলাকাটি দ্রুত ভরে উঠছে। পরের রিলিজের সঙ্গে প্লটের কাগজপত্র হস্তান্তরের সূচি ঠিক আছে।',
    amenities: ['Near the lake'], amenitiesBn: ['লেকের কাছে'],
    badges: ['New release'], featured: false, verified: false, has3d: false, has360: false, hasVideo: false,
    project: 'Aftabnagar Lakeside Plots', projectSlug: 'aftabnagar-lakeside', completion: 'Documents in process',
  }),
  extraProperty({
    id: 'se-112', slug: 'heritage-dhanmondi-2a', title: 'Heritage Residence · 2A', titleBn: 'হেরিটেজ রেসিডেন্স · ২এ',
    type: 'Flat', status: 'Available', location: 'Dhanmondi 8/A, Dhaka', locationBn: 'ধানমন্ডি ৮/এ, ঢাকা',
    price: 21000000, area: 1760, areaUnit: 'sq ft', beds: 3, baths: 3, floor: 'Level 02', facing: 'South',
    image: img('photo-1600210492486-724fe5c67fb0'),
    gallery: [img('photo-1600210492486-724fe5c67fb0'), img('photo-1600607687644-c7171b42498f'), img('photo-1600585152220-90363fe7e115')],
    summary: 'High ceilings and thick walls in a restored Dhanmondi 8/A building.',
    summaryBn: 'সংস্কার করা ধানমন্ডি ৮/এ ভবনে উঁচু ছাদ আর মোটা দেয়াল।',
    description: 'A restored older residence with 11-feet ceilings, terrazzo floors kept from the original house and a shaded veranda. Old Dhanmondi calm, five minutes from the lake.',
    descriptionBn: 'সংস্কার করা পুরনো বাসস্থান — ১১ ফুট উঁচু ছাদ, মূল বাড়ির টেরাজো মেঝে আর ছায়াঘেরা বারান্দা। লেক থেকে পাঁচ মিনিটে পুরনো ধানমন্ডির শান্তি।',
    amenities: [...commonAmenities, '11 ft ceilings', 'Shaded veranda'], amenitiesBn: [...commonAmenitiesBn, '১১ ফুট উঁচু ছাদ', 'ছায়াঘেরা বারান্দা'],
    badges: ['Heritage'], featured: false, verified: true, has3d: false, has360: false, hasVideo: false,
    project: 'Heritage Dhanmondi', projectSlug: 'heritage-dhanmondi', completion: 'Ready to move',
  }),
]

const TYPE_TO_DB = { Land: 'LAND', House: 'HOUSE', Flat: 'FLAT' } as const
const STATUS_TO_DB = { Available: 'AVAILABLE', Booked: 'BOOKED', Sold: 'SOLD', Upcoming: 'UPCOMING' } as const

async function syncProject(seed: ProjectSeed) {
  const data = {
    name: seed.name,
    location: seed.location,
    description: seed.description,
    coverImage: seed.coverImage,
    gallery: seed.gallery,
    totalUnits: seed.totalUnits,
    deliveredAt: seed.deliveredAt ? new Date(seed.deliveredAt) : null,
  }
  await prisma.project.upsert({ where: { slug: seed.slug }, update: data, create: { slug: seed.slug, ...data } })
}

async function syncProperty(property: Property, sortOrder: number) {
  const project = property.projectSlug
    ? await prisma.project.findUnique({ where: { slug: property.projectSlug }, select: { id: true } })
    : null
  const data = {
    title: property.title,
    type: TYPE_TO_DB[property.type],
    status: 'PUBLISHED' as const,
    inventory: STATUS_TO_DB[property.status],
    location: property.location,
    city: 'Dhaka',
    description: property.description,
    priceMinor: BigInt(Math.round(property.price)),
    area: property.area,
    areaUnit: property.areaUnit,
    bedrooms: property.beds ?? null,
    bathrooms: property.baths ?? null,
    floor: null,
    facing: property.facing ?? null,
    featured: property.featured,
    verified: property.verified,
    focalX: property.focalPoint.x,
    focalY: property.focalPoint.y,
    webFields: buildWebFields(property),
    sortOrder,
    publishedAt: new Date(),
    projectId: project?.id ?? null,
  }
  await prisma.property.upsert({ where: { slug: property.slug }, update: data, create: { slug: property.slug, ...data } })
}

async function main() {
  // Admin account — display name is just "Admin" (owner's instruction).
  await prisma.user.upsert({
    where: { email: 'manager@swadheen.example' },
    update: { name: 'Admin' },
    create: {
      email: 'manager@swadheen.example',
      name: 'Admin',
      role: 'MANAGER',
      passwordHash: process.env.SEED_ADMIN_PASSWORD
        ? await hashPassword(process.env.SEED_ADMIN_PASSWORD)
        : null,
    },
  })

  // Projects first (properties link to them): the original project + 20 more.
  for (const project of staticProjects) {
    await syncProject({
      slug: project.slug,
      name: project.name,
      location: project.location,
      description: project.description,
      coverImage: project.coverImage,
      gallery: [project.coverImage],
      totalUnits: project.totalUnits,
      deliveredAt: project.deliveredAt,
    })
  }
  for (const project of extraProjects) await syncProject(project)

  // Properties: the original 12 listings, then 12 more.
  const all = [...staticProperties, ...extraProperties]
  for (let i = 0; i < all.length; i++) await syncProperty(all[i], i)
}

main().finally(() => prisma.$disconnect())
