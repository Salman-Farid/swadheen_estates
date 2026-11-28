'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Check, Mail, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ButtonLink } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { Reveal } from '@/components/motion/reveal'
import { useLocale } from '@/i18n/locale-provider'
import { localizedText } from '@/i18n/localize'
import { RequestForm } from '@/components/content/request-form'
import { PropertyCard } from '@/components/property/property-card'
import { properties } from '@/data/properties'
import { ProjectGallery } from '@/components/project/project-gallery'
import type { Property } from '@/types/property'
import type { Project } from '@/types/project'

const team = [
  {
    name: 'Ayesha Rahman',
    role: 'Managing partner',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Tareq Mahmud',
    role: 'Land & advisory',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Raisa Chowdhury',
    role: 'Project relationships',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=80',
  },
]

/** Team metadata (names, images) is locale-neutral; roles are translated in the dictionaries. */
const teamRoles = [
  { roleKey: 'about.teamRole1' },
  { roleKey: 'about.teamRole2' },
  { roleKey: 'about.teamRole3' },
]

export function RequestPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-shell py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-10">
            <p className="eyebrow">{t('request.eyebrow')}</p>
            <h1 className="display-type mt-4">
              {t('request.title1')}
              <br />
              <em className="font-normal text-terracotta">{t('request.title2')}</em>
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-7 text-ink/60">{t('request.intro')}</p>
            <div className="mt-9 space-y-4 text-sm text-ink/65">
              <p className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone text-terracotta">
                  <Check className="h-4 w-4" />
                </span>
                {t('request.bullet1')}
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone text-terracotta">
                  <Check className="h-4 w-4" />
                </span>
                {t('request.bullet2')}
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone text-terracotta">
                  <Check className="h-4 w-4" />
                </span>
                {t('request.bullet3')}
              </p>
            </div>
          </div>
          <RequestForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export function AboutPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="section-space container-shell">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow">{t('about.eyebrow')}</p>
              <h1 className="display-type mt-4">
                {t('about.title1')}
                <br />
                <em className="font-normal text-terracotta">{t('about.title2')}</em>
              </h1>
            </div>
            <p className="max-w-lg text-base leading-8 text-ink/65">{t('about.intro')}</p>
          </div>
          <div className="relative mt-16 aspect-[16/8] overflow-hidden rounded-panel">
            <Image
              src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2200&q=88"
              alt={t('about.imageAlt')}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            <p className="absolute bottom-7 left-7 max-w-md font-display text-3xl leading-tight text-white sm:text-5xl">
              {t('about.overlay')}
            </p>
          </div>
        </section>
        <section className="section-space bg-stone">
          <div className="container-shell grid gap-12 lg:grid-cols-3">
            <div>
              <p className="eyebrow">{t('about.bringEyebrow')}</p>
              <h2 className="display-type mt-4 text-5xl">
                {t('about.bringTitle1')}
                <br />
                {t('about.bringTitle2')}
              </h2>
            </div>
            <div className="lg:col-span-2 grid gap-8 sm:grid-cols-2">
              <div>
                <Sparkles className="h-5 w-5 text-terracotta" />
                <h3 className="mt-5 text-lg font-bold">{t('about.point1Title')}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/60">{t('about.point1Copy')}</p>
              </div>
              <div>
                <ShieldCheck className="h-5 w-5 text-terracotta" />
                <h3 className="mt-5 text-lg font-bold">{t('about.point2Title')}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/60">{t('about.point2Copy')}</p>
              </div>
              <div>
                <MapPin className="h-5 w-5 text-terracotta" />
                <h3 className="mt-5 text-lg font-bold">{t('about.point3Title')}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/60">{t('about.point3Copy')}</p>
              </div>
              <div>
                <Check className="h-5 w-5 text-terracotta" />
                <h3 className="mt-5 text-lg font-bold">{t('about.point4Title')}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/60">{t('about.point4Copy')}</p>
              </div>
            </div>
          </div>
        </section>
        <section className="container-shell section-space">
          <SectionHeading
            eyebrow={t('about.teamEyebrow')}
            title={t('about.teamTitle')}
            description={t('about.teamDescription')}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {team.map((person, index) => (
              <div key={person.name}>
                <div className="image-frame aspect-[4/5] rounded-panel">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition duration-700"
                  />
                </div>
                <p className="mt-4 text-sm font-bold">{person.name}</p>
                <p className="mt-1 text-xs text-ink/45">
                  {t(index === 0 ? 'about.teamRole1' : index === 1 ? 'about.teamRole2' : 'about.teamRole3')}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export function ContactPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-shell section-space">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">{t('contact.eyebrow')}</p>
            <h1 className="display-type mt-4">
              {t('contact.title1')}
              <br />
              <em className="font-normal text-terracotta">{t('contact.title2')}</em>
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-7 text-ink/60">{t('contact.intro')}</p>
            <div className="mt-10 space-y-5 text-sm">
              <a href="tel:+8801810774478" className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone text-terracotta">
                  <Phone className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">
                    {t('form.call')}
                  </span>
                  <span className="mt-1 block font-semibold">+880 1810 774 478</span>
                </span>
              </a>
              <a href="mailto:info@eliteroyalhomes.com" className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone text-terracotta">
                  <Mail className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">
                    {t('form.emailShort')}
                  </span>
                  <span className="mt-1 block font-semibold">info@eliteroyalhomes.com</span>
                </span>
              </a>
              <p className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone text-terracotta">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">
                    {t('contact.studio')}
                  </span>
                  <span className="mt-1 block font-semibold">{t('contact.studioAddress')}</span>
                </span>
              </p>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-panel border border-line bg-stone lg:min-h-[520px]">
            <iframe
              title={t('contact.mapTag')}
              src="https://www.google.com/maps?q=Road%2011%2C%20Banani%2C%20Dhaka%201213&output=embed"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-[11px] font-bold text-paper shadow-float">
              <MapPin className="h-3.5 w-3.5 text-gold" /> {t('contact.studioAddress')}
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export function JournalPage() {
  const { t } = useLocale()
  // The journal shows the same real editorial notes as the homepage preview
  // (design audit fix, 2026-11-28). It previously generated fake article
  // cards from property listings — templated titles that only swapped the
  // area name, sequential 04–09 minute read times, and titles that did not
  // match the homepage's journal section.
  const articles = [
    {
      category: t('journal.categoryFieldNotes'),
      title: t('journal.titleNeighbourhood'),
      date: t('journal.readMinutes05'),
      image:
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85',
    },
    {
      category: t('journal.categoryBetterBrief'),
      title: t('journal.titleFiveQuestions'),
      date: t('journal.readMinutes07'),
      image:
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85',
    },
    {
      category: t('journal.categoryInsideGrove'),
      title: t('journal.titleChangingLight'),
      date: t('journal.readMinutes04'),
      image:
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85',
    },
  ]
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-shell section-space">
        <p className="eyebrow">{t('journal.eyebrow')}</p>
        <h1 className="display-type mt-4">
          {t('journal.title1')}
          <br />
          <em className="font-normal text-terracotta">{t('journal.title2')}</em>
        </h1>
        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <Reveal key={article.title} delay={index * 0.04}>
              <article>
                <div className="image-frame aspect-[4/3] rounded-panel">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 flex items-center justify-between text-[11px] font-bold uppercase tracking-[.14em] text-terracotta">
                  <span>{article.category}</span>
                  <span className="text-ink/40">{article.date}</span>
                </div>
                <h2 className="display-type mt-3">{article.title}</h2>
              </article>
            </Reveal>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

// `properties` comes from the server page — the live catalogue filtered for
// this project (static catalogue as the no-database fallback).
export function ProjectsPage({
  slug,
  properties: projectProperties,
}: {
  slug: string
  properties: Property[]
}) {
  const { t } = useLocale()
  const stages = [
    { statusKey: 'project.statusComplete', labelKey: 'project.stage1', date: t('project.dateJan2025') },
    { statusKey: 'project.statusComplete', labelKey: 'project.stage2', date: t('project.dateJun2025') },
    { statusKey: 'project.statusInProgress', labelKey: 'project.stage3', date: t('project.dateNow') },
    { statusKey: 'project.statusUpcoming', labelKey: 'project.stage4', date: t('project.dateQ42026') },
  ]
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative min-h-[620px] overflow-hidden bg-moss text-white">
          <ProjectGallery
            images={projectProperties.flatMap((property) => property.gallery).slice(0, 6)}
            title={t('project.galleryTitle')}
          />
          <div className="container-shell relative flex min-h-[620px] items-end pb-24">
            <div>
              <p className="eyebrow text-gold">{t('project.eyebrow')}</p>
              <h1 className="display-type mt-5 max-w-3xl">
                {t('project.title1')}
                <br />
                <em className="font-normal text-gold">{t('project.title2')}</em>
              </h1>
              <p className="mt-7 max-w-md text-sm leading-7 text-white/65">{t('project.heroCopy')}</p>
            </div>
          </div>
        </section>
        <section className="container-shell section-space">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="eyebrow">{t('project.ideaEyebrow')}</p>
              <h2 className="display-type mt-4 text-5xl">
                {t('project.ideaTitle1')}
                <br />
                <em className="font-normal text-terracotta">{t('project.ideaTitle2')}</em>
              </h2>
            </div>
            <div className="max-w-2xl text-sm leading-8 text-ink/65">
              <p>{t('project.ideaCopy1')}</p>
              <p className="mt-5">{t('project.ideaCopy2')}</p>
            </div>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <div className="rounded-panel bg-stone p-6">
              <p className="numeric text-4xl font-extrabold">48</p>
              <p className="mt-2 text-xs text-ink/50">{t('project.statResidences')}</p>
            </div>
            <div className="rounded-panel bg-stone p-6">
              <p className="numeric text-4xl font-extrabold">2026</p>
              <p className="mt-2 text-xs text-ink/50">{t('project.statReady')}</p>
            </div>
            <div className="rounded-panel bg-stone p-6">
              <p className="numeric text-4xl font-extrabold">5,200</p>
              <p className="mt-2 text-xs text-ink/50">{t('project.statGarden')}</p>
            </div>
          </div>
        </section>
        <section className="bg-stone py-20">
          <div className="container-shell">
            <SectionHeading
              eyebrow={t('project.availableEyebrow')}
              title={t('project.availableTitle')}
              description={t('project.availableDescription')}
            />
            <div
              className={
                projectProperties.length === 2
                  ? 'mt-10 grid max-w-5xl gap-8 sm:grid-cols-2'
                  : 'mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'
              }
            >
              {projectProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
        <section className="container-shell section-space">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="eyebrow">{t('project.progressEyebrow')}</p>
              <h2 className="display-type mt-4 text-5xl">
                {t('project.progressTitle1')}
                <br />
                {t('project.progressTitle2')}
              </h2>
            </div>
            <div className="space-y-7">
              {stages.map((stage, index) => (
                <div key={stage.labelKey} className="flex gap-4">
                  <span
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${stage.statusKey === 'project.statusComplete' ? 'bg-moss text-white' : stage.statusKey === 'project.statusInProgress' ? 'bg-gold text-ink' : 'bg-line text-ink/45'}`}
                  >
                    {stage.statusKey === 'project.statusComplete' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">0{index + 1}</span>
                    )}
                  </span>
                  <div className="flex flex-1 items-start justify-between gap-4 border-b border-line pb-6">
                    <div>
                      <p className="text-sm font-bold">{t(stage.labelKey as never)}</p>
                      <p className="mt-1 text-xs text-ink/45">{t(stage.statusKey as never)}</p>
                    </div>
                    <p className="text-xs text-ink/45">{stage.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="container-shell pb-24">
          <div className="rounded-panel bg-moss p-8 text-paper sm:p-14">
            <p className="eyebrow text-gold">{t('project.ctaEyebrow')}</p>
            <div className="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <h2 className="display-type max-w-2xl">
                {t('project.ctaTitle1')}
                <br />
                <em className="font-normal text-gold">{t('project.ctaTitle2')}</em>
              </h2>
              <ButtonLink href="/request" variant="dark">
                {t('arrangeViewing')} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

// Public Projects index — every project the admin publishes (DB-backed, with
// the static catalogue as the no-database fallback).
export function ProjectsIndex({ projects }: { projects: Project[] }) {
  const { t } = useLocale()
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="border-b border-line bg-paper">
          <div className="container-shell py-16 sm:py-24">
            <p className="eyebrow">{t('projectsIndex.eyebrow')}</p>
            <h1 className="display-type mt-4 text-5xl sm:text-7xl">{t('projects')}</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-ink/60">{t('projectsIndex.description')}</p>
          </div>
        </section>
        <section className="container-shell section-space">
          {projects.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-12 text-center text-sm font-semibold text-ink/45">
              {t('projectsIndex.empty')}
            </p>
          ) : (
            <div className={projects.length === 1 ? 'grid max-w-2xl gap-8' : 'grid gap-8 sm:grid-cols-2'}>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group overflow-hidden rounded-panel border border-line bg-paper shadow-soft transition hover:-translate-y-1 hover:shadow-float"
                >
                  <div className="image-frame relative aspect-[16/10]">
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-terracotta">
                      <MapPin className="h-3 w-3 shrink-0" /> {project.location}
                    </p>
                    <h2 className="display-type mt-3 text-3xl">{project.name}</h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/55">{project.description}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs font-bold">
                      <span className="text-ink/50">
                        {project.totalUnits > 0
                          ? t('projectsIndex.units', { n: project.totalUnits })
                          : t('projectsIndex.listingsCount', { n: project.propertyCount ?? 0 })}
                      </span>
                      <span className="flex items-center gap-1 text-terracotta">
                        {t('projectsIndex.viewProject')}{' '}
                        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

// Detail page for admin-created projects — brand-level sections driven by the
// DB row (The Grove keeps its curated page instead).
export function DbProjectPage({
  project,
  properties: projectProperties,
}: {
  project: Project
  properties: Property[]
}) {
  const { t } = useLocale()
  const deliveredYear = project.deliveredAt ? new Date(project.deliveredAt).getFullYear() : null
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative min-h-[560px] overflow-hidden bg-moss text-white">
          {project.coverImage ? (
            <Image src={project.coverImage} alt="" fill sizes="100vw" className="object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20" />
          <div className="container-shell relative flex min-h-[560px] items-end pb-16">
            <div>
              <p className="eyebrow text-gold">{t('projectsIndex.eyebrow')}</p>
              <h1 className="display-type mt-5 max-w-3xl">{project.name}</h1>
              <p className="mt-5 flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4 shrink-0" /> {project.location}
              </p>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/65">{project.description}</p>
            </div>
          </div>
        </section>
        <section className="border-b border-line bg-paper">
          <div className="container-shell grid gap-4 py-10 sm:grid-cols-3">
            <div className="rounded-panel bg-stone p-6">
              <p className="numeric text-4xl font-extrabold">{project.totalUnits}</p>
              <p className="mt-2 text-xs text-ink/50">{t('project.statResidences')}</p>
            </div>
            <div className="rounded-panel bg-stone p-6">
              <p className="numeric text-4xl font-extrabold">{projectProperties.length}</p>
              <p className="mt-2 text-xs text-ink/50">{t('project.statListings')}</p>
            </div>
            <div className="rounded-panel bg-stone p-6">
              <p className="text-4xl font-extrabold">
                {deliveredYear ? <span className="numeric">{deliveredYear}</span> : t('project.statusInProgress')}
              </p>
              <p className="mt-2 text-xs text-ink/50">{t('project.statCompletion')}</p>
            </div>
          </div>
        </section>
        <section className="container-shell section-space">
          <SectionHeading
            eyebrow={t('project.availableEyebrow')}
            title={t('project.availableListingsTitle')}
            description={t('projectsIndex.description')}
          />
          {projectProperties.length === 0 ? (
            <p className="mt-10 rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm font-semibold text-ink/45">
              {t('project.noListings')}
            </p>
          ) : (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {projectProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>
        <section className="container-shell pb-24">
          <div className="rounded-panel bg-moss p-8 text-paper sm:p-14">
            <p className="eyebrow text-gold">{t('project.ctaEyebrow')}</p>
            <div className="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <h2 className="display-type max-w-2xl">{t('project.genericCtaTitle')}</h2>
              <ButtonLink href="/request" variant="dark">
                {t('arrangeViewing')} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

