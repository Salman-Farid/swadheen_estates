'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Play, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ProjectVideo } from '@/types/video'
import { youtubeEmbedUrl } from '@/data/videos'
import { ButtonLink } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { Reveal } from '@/components/motion/reveal'
import { useMotionPreferences } from '@/experience/motion/motion-provider'
import { cn } from '@/lib/utils'

function YouTubeFrame({ video, className }: { video: ProjectVideo; className?: string }) {
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const start = window.setTimeout(() => setPlaying(true), 150)
    const markReady = window.setTimeout(() => setReady(true), 4000)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(markReady)
    }
  }, [video.id])

  return (
    <div className={cn('relative overflow-hidden rounded-panel bg-ink', className)}>
      {!playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 z-10 block w-full text-left"
          aria-label={`Play ${video.title}`}
        >
          <Image
            src={video.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover opacity-85 transition duration-700 hover:scale-105 hover:opacity-100"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/10" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink shadow-float transition hover:scale-105">
            <Play className="ml-1 h-5 w-5 fill-current" />
          </span>
          <span className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white">
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-[.17em] text-gold">
                {video.projectName}
              </span>
              <span className="mt-2 block font-display text-3xl leading-none">{video.title}</span>
            </span>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-gold" />
          </span>
        </button>
      )}
      {playing && (
        <iframe
          key={video.id}
          title={video.title}
          src={`${youtubeEmbedUrl(video)}&autoplay=1&mute=1`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setReady(true)}
        />
      )}
      {playing && !ready && (
        <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-ink/40">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </span>
      )}
    </div>
  )
}

export function YouTubeShowcase({ videos }: { videos: ProjectVideo[] }) {
  const { reducedMotion } = useMotionPreferences()
  // The catalogue comes from the server (database first, static fallback) —
  // the admin panel is the single source of truth for what plays here.
  const catalog = videos
  const [activeShort, setActiveShort] = useState(
    () => catalog.find((video) => video.kind === 'SHORT')?.id ?? '',
  )
  const [activeFilm, setActiveFilm] = useState(
    () => catalog.find((video) => video.kind === 'VIDEO')?.id ?? '',
  )

  const shorts = useMemo(() => catalog.filter((video) => video.kind === 'SHORT'), [catalog])
  const films = useMemo(() => catalog.filter((video) => video.kind === 'VIDEO'), [catalog])
  const selectedShort = shorts.find((video) => video.id === activeShort) ?? shorts[0]
  const featuredFilm = films.find((video) => video.id === activeFilm) ?? films[0]

  useEffect(() => {
    if (reducedMotion || shorts.length < 2) return
    const timer = window.setInterval(() => {
      setActiveShort((current) => {
        const currentIndex = shorts.findIndex((video) => video.id === current)
        return shorts[(currentIndex + 1 + shorts.length) % shorts.length]?.id ?? current
      })
    }, 6500)
    return () => window.clearInterval(timer)
  }, [reducedMotion, shorts])

  useEffect(() => {
    if (reducedMotion || films.length < 2) return
    const timer = window.setInterval(() => {
      setActiveFilm((current) => {
        const currentIndex = films.findIndex((video) => video.id === current)
        return films[(currentIndex + 1 + films.length) % films.length]?.id ?? current
      })
    }, 12000)
    return () => window.clearInterval(timer)
  }, [films, reducedMotion])

  if (!selectedShort && !featuredFilm) return null

  return (
    <>
      {shorts.length > 0 && (
        <section className="section-space bg-stone">
          <div className="container-shell">
            <SectionHeading
              eyebrow="From the field · YouTube Shorts"
              title="Small moments. A different feeling."
              description="A closer look at the thresholds, materials and light that make a place feel like yours."
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
              <Reveal className="relative">
                <div className="relative mx-auto aspect-[9/14] max-w-[350px] overflow-hidden rounded-panel bg-ink shadow-float">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedShort?.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0"
                    >
                      {selectedShort && (
                        <YouTubeFrame video={selectedShort} className="h-full rounded-none" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <span className="pointer-events-none absolute left-4 top-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-ink/60 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur">
                    <VolumeX className="h-3 w-3 text-gold" /> Auto-playing · sound off
                  </span>
                </div>
              </Reveal>
              <div className="flex flex-col justify-center">
                <p className="max-w-md text-sm leading-7 text-ink/60">
                  Vertical stories made for the details you pass quickly in real life — a shadow line, a
                  courtyard, a view opening at the end of a hall.
                </p>
                <div className="mt-8 grid max-h-[570px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
                  {shorts.map((video, index) => (
                    <button
                      type="button"
                      key={video.id}
                      onClick={() => setActiveShort(video.id)}
                      className={cn(
                        'group flex items-center gap-4 rounded-2xl border p-3 text-left transition',
                        selectedShort?.id === video.id
                          ? 'border-terracotta bg-paper shadow-soft'
                          : 'border-transparent hover:border-line hover:bg-paper/70',
                      )}
                    >
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-ink">
                        <Image src={video.thumbnailUrl} alt="" fill sizes="48px" className="object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center bg-ink/20">
                          <Play className="h-3.5 w-3.5 fill-white text-white" />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-terracotta">
                          0{index + 1} · Short
                        </span>
                        <span className="mt-1 block truncate text-sm font-bold group-hover:text-terracotta">
                          {video.title}
                        </span>
                        <span className="mt-1 block truncate text-xs text-ink/45">{video.description}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/30 transition group-hover:text-terracotta" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      {featuredFilm && (
        <section className="section-space border-y border-line bg-white/70 text-ink shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-paper/10">
          <div className="container-shell">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
              <Reveal>
                <YouTubeFrame video={featuredFilm} className="aspect-video" />
              </Reveal>
              <Reveal delay={0.12}>
                <div>
                  <p className="eyebrow">Wide films · YouTube</p>
                  <h2 className="display-type mt-4 text-5xl leading-[.88] sm:text-7xl">
                    Stay for
                    <br />
                    <em className="font-normal text-terracotta">the long view.</em>
                  </h2>
                  <p className="mt-6 max-w-md text-sm leading-7 text-ink/60">{featuredFilm.description}</p>
                  <div className="mt-8 grid gap-2">
                    {films.map((film, index) => (
                      <button
                        key={film.id}
                        type="button"
                        onClick={() => setActiveFilm(film.id)}
                        aria-pressed={featuredFilm.id === film.id}
                        className={cn(
                          'group flex items-center gap-3 rounded-2xl border p-2 text-left transition',
                          featuredFilm.id === film.id
                            ? 'border-terracotta bg-white shadow-soft dark:bg-white/5'
                            : 'border-line hover:border-terracotta/60 hover:bg-white/70 dark:hover:bg-white/5',
                        )}
                      >
                        <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl bg-ink/60">
                          <Image
                            src={film.thumbnailUrl}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-ink/20">
                            <Play className="h-3.5 w-3.5 fill-white text-white" />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-terracotta">
                            0{index + 1} · Wide film
                          </span>
                          <span className="mt-1 block truncate text-sm font-bold text-ink group-hover:text-terracotta">
                            {film.title}
                          </span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/35 transition group-hover:text-terracotta" />
                      </button>
                    ))}
                  </div>
                  <ButtonLink
                    href={featuredFilm.youtubeUrl}
                    variant="primary"
                    className="mt-8"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Watch on YouTube <ArrowUpRight className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
