'use client'

import Image from 'next/image'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  GripVertical,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { parseYouTubeUrl } from '@/features/videos/schemas/video.schema'
import type { ProjectVideo, VideoKind } from '@/types/video'
import { Badge } from '@/components/ui/badge'
import { Button, ButtonLink } from '@/components/ui/button'
import { useLocale } from '@/i18n/locale-provider'
import { cn } from '@/lib/utils'

// Fallback project list, replaced by the live catalogue from
// /api/admin/listings as soon as it loads.
const fallbackProjects = [
  { slug: 'the-grove-bashundhara', name: 'The Grove, Bashundhara' },
  { slug: 'parkside-banani', name: 'Parkside Banani' },
]

type FormState = {
  projectSlug: string
  kind: VideoKind
  title: string
  description: string
  youtubeUrl: string
  published: boolean
}
const emptyForm: FormState = {
  projectSlug: 'the-grove-bashundhara',
  kind: 'SHORT',
  title: '',
  description: '',
  youtubeUrl: '',
  published: true,
}

export function AdminProjectVideoManager({ projectSlug }: { projectSlug?: string }) {
  const { t } = useLocale()
  // The database is the only source of truth: videos load from the admin API
  // (published and drafts), and every change is written back through it.
  const [videos, setVideos] = useState<ProjectVideo[]>([])
  const [projects, setProjects] = useState(fallbackProjects)
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    projectSlug: projectSlug ?? emptyForm.projectSlug,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const visibleVideos = useMemo(
    () => videos.filter((video) => !projectSlug || video.projectSlug === projectSlug),
    [projectSlug, videos],
  )

  useEffect(() => {
    fetch(`/api/admin/videos${projectSlug ? `?projectSlug=${encodeURIComponent(projectSlug)}` : ''}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed')
        const result = (await response.json()) as ProjectVideo[]
        if (Array.isArray(result)) setVideos(result)
      })
      .catch(() => setError(t('videos.savedInBrowserNoSync')))
    fetch('/api/admin/listings')
      .then(async (response) => {
        if (!response.ok) return
        const data = (await response.json()) as { projects?: { slug: string; name: string }[] }
        if (data.projects?.length)
          setProjects(data.projects.map((project) => ({ slug: project.slug, name: project.name })))
      })
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug])

  // Reordering writes each changed sortOrder back to the database.
  function syncOrders(next: ProjectVideo[], previous: ProjectVideo[]) {
    setVideos(next)
    for (const video of next) {
      const before = previous.find((item) => item.id === video.id)
      if (before && before.sortOrder !== video.sortOrder)
        fetch(`/api/admin/videos/${video.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: video.sortOrder }),
        }).catch(() => undefined)
    }
  }

  function resetForm() {
    setForm({ ...emptyForm, projectSlug: projectSlug ?? emptyForm.projectSlug })
    setEditingId(null)
    setError('')
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const youtube = parseYouTubeUrl(form.youtubeUrl)
    if (!youtube) {
      setError(t('videos.invalidUrl'))
      return
    }
    const existing = editingId ? videos.find((video) => video.id === editingId) : undefined
    const payload = {
      projectSlug: form.projectSlug,
      kind: form.kind,
      title: form.title.trim(),
      description: form.description.trim(),
      youtubeUrl: form.youtubeUrl,
      published: form.published,
      sortOrder: existing?.sortOrder ?? visibleVideos.length,
    }
    try {
      const response = await fetch(editingId ? `/api/admin/videos/${editingId}` : '/api/admin/videos', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('save failed')
      const result = (await response.json()) as { video?: ProjectVideo }
      if (result.video) {
        const saved = {
          ...result.video,
          projectSlug: result.video.projectSlug ?? form.projectSlug,
          projectName:
            result.video.projectName ??
            projects.find((project) => project.slug === form.projectSlug)?.name ??
            form.projectSlug,
        }
        setVideos((current) =>
          editingId
            ? current.map((video) => (video.id === editingId ? saved : video))
            : [...current, saved],
        )
      }
      setMessage(t('videos.savedToCatalog'))
      resetForm()
    } catch {
      setError(t('videos.savedInBrowserNoSync'))
    }
  }

  function edit(video: ProjectVideo) {
    setEditingId(video.id)
    setForm({
      projectSlug: video.projectSlug,
      kind: video.kind,
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(video: ProjectVideo) {
    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('delete failed')
      setVideos((current) => current.filter((item) => item.id !== video.id))
      setMessage(`${t('videos.removedPrefix')} “${video.title}”.`)
    } catch {
      setError(t('videos.savedInBrowserNoSync'))
    }
  }

  async function togglePublished(video: ProjectVideo) {
    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !video.published }),
      })
      if (!response.ok) throw new Error('toggle failed')
      setVideos((current) =>
        current.map((item) => (item.id === video.id ? { ...item, published: !item.published } : item)),
      )
    } catch {
      setError(t('videos.savedInBrowserNoSync'))
    }
  }

  function moveVideo(videoId: string, direction: -1 | 1) {
    const scoped = [...visibleVideos].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = scoped.findIndex((video) => video.id === videoId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= scoped.length) return
    const current = scoped[index]
    const swap = scoped[target]
    if (!current || !swap) return
    const next = videos.map((video) =>
      video.id === current.id
        ? { ...video, sortOrder: swap.sortOrder }
        : video.id === swap.id
          ? { ...video, sortOrder: current.sortOrder }
          : video,
    )
    syncOrders(next, videos)
  }

  function dropVideo(targetId: string) {
    if (!draggedId || draggedId === targetId) return
    const scoped = [...visibleVideos].sort((a, b) => a.sortOrder - b.sortOrder)
    const from = scoped.findIndex((video) => video.id === draggedId)
    const to = scoped.findIndex((video) => video.id === targetId)
    if (from < 0 || to < 0) return
    const reordered = [...scoped]
    const [item] = reordered.splice(from, 1)
    if (!item) return
    reordered.splice(to, 0, item)
    const positions = new Map(reordered.map((video, index) => [video.id, index]))
    syncOrders(
      videos.map((video) =>
        positions.has(video.id) ? { ...video, sortOrder: positions.get(video.id) ?? video.sortOrder } : video,
      ),
      videos,
    )
    setDraggedId(null)
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('videos.eyebrow')}</p>
          <h1 className="display-type mt-3 text-5xl">{t('videos.title')}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink/55">{t('videos.copy')}</p>
        </div>
        <ButtonLink href="/admin" variant="outline" size="sm">
          {t('admin.overview')} <ExternalLink className="h-3.5 w-3.5" />
        </ButtonLink>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <form onSubmit={submit} className="rounded-panel border border-line bg-paper p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between border-b border-line pb-5">
            <div>
              <p className="eyebrow">{editingId ? t('videos.editStory') : t('videos.addStory')}</p>
              <h2 className="mt-2 text-xl font-bold">
                {editingId ? t('videos.updateVideo') : t('videos.newVideo')}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone"
                aria-label={t('a11y.cancelEditing')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-bold">{t('videos.project')}</span>
              <select
                value={form.projectSlug}
                disabled={Boolean(projectSlug)}
                onChange={(event) => setForm((current) => ({ ...current, projectSlug: event.target.value }))}
                className="mt-2 h-11 w-full rounded-xl border border-line bg-stone px-3 text-sm outline-none focus:border-terracotta"
              >
                {projects.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend className="text-xs font-bold">{t('videos.format')}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['SHORT', 'VIDEO'] as VideoKind[]).map((kind) => (
                  <label
                    key={kind}
                    className={cn(
                      'cursor-pointer rounded-xl border p-3 text-xs font-bold transition',
                      form.kind === kind
                        ? 'border-terracotta bg-terracotta/5 text-terracotta'
                        : 'border-line hover:bg-stone',
                    )}
                  >
                    <input
                      type="radio"
                      name="video-kind"
                      value={kind}
                      checked={form.kind === kind}
                      onChange={() => setForm((current) => ({ ...current, kind }))}
                      className="sr-only"
                    />
                    {kind === 'SHORT' ? t('videos.youtubeShort') : t('videos.fullVideo')}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-xs font-bold">{t('form.title')}</span>
              <input
                required
                minLength={2}
                maxLength={120}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder={t('videos.titlePlaceholder')}
                className="mt-2 h-11 w-full rounded-xl border border-line bg-stone px-3 text-sm outline-none focus:border-terracotta"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold">{t('videos.youtubeUrl')}</span>
              <input
                required
                type="url"
                value={form.youtubeUrl}
                onChange={(event) => setForm((current) => ({ ...current, youtubeUrl: event.target.value }))}
                placeholder="https://youtube.com/shorts/..."
                className="mt-2 h-11 w-full rounded-xl border border-line bg-stone px-3 text-sm outline-none focus:border-terracotta"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold">
                {t('videos.description')} <span className="font-normal text-ink/40">{t('request.optional')}</span>
              </span>
              <textarea
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder={t('videos.descriptionPlaceholder')}
                className="mt-2 w-full resize-none rounded-xl border border-line bg-stone px-3 py-3 text-sm outline-none focus:border-terracotta"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-stone p-3 text-xs font-semibold">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
                className="h-4 w-4 accent-terracotta"
              />{' '}
              {t('videos.showOnSite')}
            </label>
            {error && (
              <p role="alert" className="text-xs font-semibold text-danger">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="text-xs font-semibold text-moss">
                {message}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full">
              <Save className="h-4 w-4" /> {editingId ? t('videos.saveChanges') : t('videos.addToProject')}
            </Button>
          </div>
        </form>
        <section className="rounded-panel border border-line bg-paper p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="eyebrow">{t('videos.publicSequence')}</p>
              <h2 className="mt-2 text-xl font-bold">
                {projectSlug
                  ? (projects.find((project) => project.slug === projectSlug)?.name ?? projectSlug)
                  : t('videos.allStories')}
              </h2>
            </div>
            <Badge tone="neutral">{`${visibleVideos.length} ${t('videos.stories')}`}</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {visibleVideos
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((video, index) => (
                <article
                  key={video.id}
                  draggable
                  onDragStart={() => setDraggedId(video.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropVideo(video.id)}
                  className={cn(
                    'flex gap-3 rounded-2xl border border-line p-3 transition',
                    draggedId === video.id
                      ? 'border-terracotta bg-terracotta/5'
                      : 'bg-stone/35 hover:bg-stone',
                  )}
                >
                  <span className="flex items-center text-ink/25" aria-label={t('a11y.dragToReorder')}>
                    <GripVertical className="h-5 w-5" />
                  </span>
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-ink">
                    <Image src={video.thumbnailUrl} alt="" fill sizes="112px" className="object-cover" />
                    <span className="absolute bottom-2 left-2 rounded-full bg-ink/75 px-2 py-1 text-[9px] font-bold text-white">
                      {video.kind === 'SHORT' ? t('videos.short') : t('videos.video')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="truncate text-sm font-bold">{video.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/50">
                          {video.description || t('videos.noDescription')}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-[9px] font-bold',
                          video.published
                            ? 'bg-[hsl(var(--available)/.12)] text-[hsl(var(--available))]'
                            : 'bg-stone text-ink/45',
                        )}
                      >
                        {video.published ? t('videos.published') : t('videos.draft')}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveVideo(video.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-paper"
                        aria-label={`${t('videos.moveUpPrefix')} ${video.title}`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveVideo(video.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-paper"
                        aria-label={`${t('videos.moveDownPrefix')} ${video.title}`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublished(video)}
                        className="rounded-full border border-line bg-paper px-2.5 py-1.5 text-[10px] font-bold"
                      >
                        {video.published ? t('videos.unpublish') : t('videos.publish')}
                      </button>
                      <button
                        type="button"
                        onClick={() => edit(video)}
                        className="flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[10px] font-bold"
                      >
                        <Pencil className="h-3 w-3" /> {t('edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(video)}
                        className="flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[10px] font-bold text-danger"
                      >
                        <Trash2 className="h-3 w-3" /> {t('remove')}
                      </button>
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto flex items-center gap-1 text-[10px] font-bold text-terracotta"
                      >
                        {t('open')} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            {visibleVideos.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line py-16 text-center">
                <Play className="mx-auto h-6 w-6 text-terracotta" />
                <p className="mt-4 text-sm font-bold">{t('videos.noneYet')}</p>
                <p className="mt-2 text-xs text-ink/45">{t('videos.noneYetCopy')}</p>
              </div>
            )}
          </div>
          <p className="mt-5 flex items-center gap-2 text-[10px] text-ink/40">
            <GripVertical className="h-3.5 w-3.5" /> {t('videos.dragHint')}
          </p>
        </section>
      </div>
    </div>
  )
}
