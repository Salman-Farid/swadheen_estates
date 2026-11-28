'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { motionConfig } from '@/experience/motion/motion.config'
import { motionFeatureFlags } from '@/experience/motion/feature-flags'
import { useMotionPreferences } from '@/experience/motion/motion-provider'
import { cn } from '@/lib/utils'

// Hero background: the images come from the admin panel (Hero images tab)
// and rotate with a slow crossfade; the gentle zoom keeps the screen alive.
export function CinematicHeroMedia({ images, alt }: { images: string[]; alt: string }) {
  const { reducedMotion, slowMotion, timeScale } = useMotionPreferences()
  const [hovered, setHovered] = useState(false)
  const [index, setIndex] = useState(0)
  const enabled = motionFeatureFlags.cinematicMotion && motionFeatureFlags.heroJourney && !reducedMotion
  const duration =
    motionConfig.durations.hero / (slowMotion ? Math.max(timeScale, 0.25) : 1) / (hovered ? 0.35 : 1)

  useEffect(() => {
    if (images.length < 2 || reducedMotion) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [images.length, reducedMotion])

  const active = images[index % Math.max(images.length, 1)] ?? images[0]

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="absolute inset-[-3%]"
        initial={enabled ? { scale: 1.04, x: 0 } : false}
        animate={enabled ? { scale: hovered ? 1.07 : 1.1, x: hovered ? '-0.5%' : '0.5%' } : { scale: 1 }}
        transition={{
          duration,
          ease: motionConfig.easings.slowSettle,
          repeat: enabled ? Infinity : 0,
          repeatType: 'reverse',
        }}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className={cn(
              'absolute inset-0 transition-opacity duration-[1600ms]',
              src === active ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden={src !== active}
          >
            <Image
              src={src}
              alt={src === active ? alt : ''}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center opacity-75"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
