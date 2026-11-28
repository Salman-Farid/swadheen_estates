'use client'

import Image from 'next/image'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n/locale-provider'

type HeroImageRow = { id: string; url: string; sortOrder: number }

// The home-page hero screen images. The database is the only source of
// truth — every change here is written through the admin API and shows on
// the public site within a minute.
export function AdminHeroImageManager() {
  const { t } = useLocale()
  const [images, setImages] = useState<HeroImageRow[]>([])
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/hero-images')
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed')
        const rows = (await response.json()) as HeroImageRow[]
        if (Array.isArray(rows)) setImages(rows)
      })
      .catch(() => setError(t('videos.savedInBrowserNoSync')))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const value = url.trim()
    if (!value.startsWith('https://')) {
      setError(t('hero.invalidUrl'))
      return
    }
    try {
      const response = await fetch('/api/admin/hero-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value, sortOrder: images.length }),
      })
      if (!response.ok) throw new Error('save failed')
      const result = (await response.json()) as { image: HeroImageRow }
      setImages((current) => [...current, result.image])
      setUrl('')
      setMessage(t('videos.savedToCatalog'))
    } catch {
      setError(t('videos.savedInBrowserNoSync'))
    }
  }

  async function remove(image: HeroImageRow) {
    try {
      const response = await fetch(`/api/admin/hero-images/${image.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('delete failed')
      setImages((current) => current.filter((item) => item.id !== image.id))
    } catch {
      setError(t('videos.savedInBrowserNoSync'))
    }
  }

  function move(imageId: string, direction: -1 | 1) {
    const scoped = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = scoped.findIndex((image) => image.id === imageId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= scoped.length) return
    const current = scoped[index]
    const swap = scoped[target]
    if (!current || !swap) return
    const next = images.map((image) =>
      image.id === current.id
        ? { ...image, sortOrder: swap.sortOrder }
        : image.id === swap.id
          ? { ...image, sortOrder: current.sortOrder }
          : image,
    )
    setImages(next)
    for (const image of [current, swap])
      fetch(`/api/admin/hero-images/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sortOrder: image.id === current.id ? swap.sortOrder : current.sortOrder,
        }),
      }).catch(() => undefined)
  }

  const ordered = [...images].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div>
      <p className="max-w-xl text-sm leading-6 text-ink/55">{t('hero.copy')}</p>
      <form onSubmit={add} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={t('hero.urlPlaceholder')}
          className="h-11 flex-1 rounded-xl border border-line bg-stone px-3 text-sm outline-none focus:border-terracotta"
        />
        <Button type="submit" size="lg">
          <Plus className="h-4 w-4" /> {t('hero.add')}
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-xs font-semibold text-moss">
          {message}
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((image, index) => (
          <article key={image.id} className="rounded-2xl border border-line bg-stone/35 p-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-ink">
              <Image src={image.url} alt="" fill sizes="400px" className="object-cover" unoptimized />
              <span className="absolute left-2 top-2 rounded-full bg-ink/75 px-2 py-1 text-[10px] font-bold text-white">
                {index + 1}
              </span>
            </div>
            <p className="mt-3 break-all text-[11px] leading-4 text-ink/50">{image.url}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => move(image.id, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-paper"
                aria-label={`Move up ${index + 1}`}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(image.id, 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-paper"
                aria-label={`Move down ${index + 1}`}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => remove(image)}
                className="ml-auto flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[10px] font-bold text-danger"
              >
                <Trash2 className="h-3 w-3" /> {t('remove')}
              </button>
            </div>
          </article>
        ))}
        {ordered.length === 0 && (
          <p className="text-sm text-ink/45 sm:col-span-2 lg:col-span-3">{t('hero.empty')}</p>
        )}
      </div>
    </div>
  )
}
