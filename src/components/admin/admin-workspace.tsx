'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  FileImage,
  Filter,
  GripVertical,
  Images,
  MoreHorizontal,
  Plus,
  Search,
  Building2,
  Pencil,
  Settings2,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { properties } from '@/data/properties'
import { Button, ButtonLink } from '@/components/ui/button'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { useLocale } from '@/i18n/locale-provider'
import { localizedText } from '@/i18n/localize'
import { cn } from '@/lib/utils'
import { formatDateTime, formatPrice } from '@/lib/format'
import { ListingDialog, type ListingKind } from '@/components/admin/listing-dialog'
import { MediaDropzone } from '@/components/admin/media-dropzone'
import { AdminProjectVideoManager } from '@/components/admin/project-video-manager'
import type { AdminProjectDto, AdminPropertyDto } from '@/features/listings/types'

const leads = [
  {
    name: 'Tanjila Rahman',
    initials: 'TR',
    propertyKey: 'admin.leadGrove3A',
    stage: 'New',
    score: 78,
    timeKey: 'admin.time12mAgo',
    color: 'bg-[#c8a49c]',
  },
  {
    name: 'Farhan Ahmed',
    initials: 'FA',
    propertyKey: 'admin.leadCourtyardHouse',
    stage: 'Visit scheduled',
    score: 92,
    timeKey: 'admin.time1hAgo',
    color: 'bg-[#9fae9d]',
  },
  {
    name: 'Maliha Karim',
    initials: 'MK',
    propertyKey: 'admin.leadSouthTerrace2',
    stage: 'Negotiation',
    score: 84,
    timeKey: 'admin.time3hAgo',
    color: 'bg-[#b8a88f]',
  },
  {
    name: 'Sabbir Hossain',
    initials: 'SH',
    propertyKey: 'admin.leadGreenEdge',
    stage: 'Contacted',
    score: 62,
    timeKey: 'admin.yesterday',
    color: 'bg-[#a1a7b7]',
  },
  {
    name: 'Rafiul Islam',
    initials: 'RI',
    propertyKey: 'admin.leadSkyCourt',
    stage: 'New',
    score: 55,
    timeKey: 'admin.yesterday',
    color: 'bg-[#d1b6a7]',
  },
]

const stages = ['New', 'Contacted', 'Visit scheduled', 'Negotiation']
const stageDisplayKeys: Record<string, string> = {
  New: 'admin.stageNew',
  Contacted: 'admin.stageContacted',
  'Visit scheduled': 'admin.stageVisitScheduled',
  Negotiation: 'admin.stageNegotiation',
}
const propertyTitleKeys = [
  'admin.groveInitiative',
  'admin.courtyardHouse',
  'admin.southTerrace',
  'admin.greenEdgePlot',
  'admin.skyCourt',
]
const stageColors: Record<string, string> = {
  New: 'bg-[hsl(var(--info)/.12)] text-[hsl(var(--info))]',
  Contacted: 'bg-stone text-ink/60',
  'Visit scheduled': 'bg-[hsl(var(--gold)/.18)] text-[hsl(var(--warning))]',
  Negotiation: 'bg-[hsl(var(--terracotta)/.12)] text-terracotta',
}

export function AdminPropertiesPage() {
  const { t, locale } = useLocale()
  const [propertyRows, setPropertyRows] = useState<AdminPropertyDto[]>([])
  const [projectRows, setProjectRows] = useState<AdminProjectDto[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState<{
    mode: 'create' | 'edit'
    kind: ListingKind | null
    property?: AdminPropertyDto
    project?: AdminProjectDto
  } | null>(null)

  const load = useCallback(() => {
    fetch('/api/admin/listings')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('load failed'))))
      .then((data: { properties?: AdminPropertyDto[]; projects?: AdminProjectDto[] }) => {
        setPropertyRows(data.properties ?? [])
        setProjectRows(data.projects ?? [])
        setLoadFailed(false)
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const lowerQuery = query.trim().toLowerCase()
  const filteredProperties = propertyRows.filter((item) =>
    `${item.title} ${item.location} ${item.slug}`.toLowerCase().includes(lowerQuery),
  )

  const removeListing = async (kind: ListingKind, id: string) => {
    if (!window.confirm(t('admin.confirmDeleteListing'))) return
    try {
      const response = await fetch(`/api/admin/listings/${id}?kind=${kind}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('delete failed')
      load()
    } catch {
      window.alert(t('admin.deleteFailed'))
    }
  }

  const exportCsv = () => {
    const rows = [
      ['Title', 'Slug', 'Type', 'Status', 'Price', 'Location', 'Updated'],
      ...filteredProperties.map((item) => [
        item.title,
        item.slug,
        item.type,
        item.dbStatus,
        String(item.price),
        item.location,
        item.updatedAt,
      ]),
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'properties.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('admin.inventory')}</p>
          <h1 className="display-type mt-3 text-5xl">{t('admin.propertyManagement')}</h1>
          <p className="mt-3 text-sm text-ink/55">{`${propertyRows.length} ${t('properties')}`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" /> {t('admin.exportCsv')}
          </Button>
          <Button size="sm" onClick={() => setDialog({ mode: 'create', kind: 'PROPERTY' })}>
            <Plus className="h-3.5 w-3.5" /> {t('admin.addListing')}
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-panel border border-line bg-paper shadow-soft">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-end">
          <label className="flex h-10 items-center gap-2 rounded-full border border-line bg-stone/50 px-3">
            <Search className="h-3.5 w-3.5 text-ink/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('admin.searchInventory')}
              className="w-full bg-transparent text-xs font-semibold outline-none placeholder:text-ink/35 sm:w-64"
            />
          </label>
        </div>

        {!loaded ? (
          <p className="px-5 py-10 text-center text-xs font-semibold text-ink/45">{t('notif.loading')}</p>
        ) : loadFailed ? (
          <p className="px-5 py-10 text-center text-xs font-bold text-danger">{t('admin.loadFailed')}</p>
        ) : filteredProperties.length === 0 ? (
          <p className="px-5 py-10 text-center text-xs font-semibold text-ink/45">
            {t('admin.noListings')}
          </p>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-stone/60 text-[10px] font-bold uppercase tracking-[.13em] text-ink/40">
                  <tr>
                    <th className="px-5 py-3">{t('property')}</th>
                    <th className="px-3 py-3">{t('admin.typeHeader')}</th>
                    <th className="px-3 py-3">{t('statusLower')}</th>
                    <th className="px-3 py-3">{t('price')}</th>
                    <th className="px-3 py-3">{t('admin.updated')}</th>
                    <th className="w-24 px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="group hover:bg-stone/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {property.image ? (
                            <div className="image-frame h-11 w-14 shrink-0 rounded-lg">
                              <Image
                                src={property.image}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-stone text-ink/30">
                              <Building2 className="h-4 w-4" />
                            </span>
                          )}
                          <div>
                            <p className="text-xs font-bold">
                              {localizedText(property.title, property.titleBn, locale)}
                            </p>
                            <p className="mt-1 text-[10px] text-ink/40">
                              {localizedText(property.location, property.locationBn, locale)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-ink/60">
                          {t(`type.${property.type.toLowerCase()}` as never)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={property.status} />
                          {property.dbStatus !== 'PUBLISHED' ? (
                            <span className="rounded-full bg-stone px-2 py-0.5 text-[9px] font-bold text-ink/50">
                              {t('admin.form.draft')}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs font-extrabold numeric">
                        {formatPrice(property.price)}
                      </td>
                      <td className="px-3 py-3 text-xs text-ink/45">
                        {formatDateTime(property.updatedAt, locale)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDialog({ mode: 'edit', kind: 'PROPERTY', property })}
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-stone"
                            aria-label={`${t('admin.editProperty')} — ${property.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeListing('PROPERTY', property.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-danger transition hover:bg-danger/10"
                            aria-label={`${t('admin.removeListing')} — ${property.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {dialog ? (
        <ListingDialog
          kind={dialog.kind}
          mode={dialog.mode}
          property={dialog.property ?? null}
          project={dialog.project ?? null}
          projects={projectRows}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            load()
          }}
        />
      ) : null}
    </div>
  )
}

// Projects live in their own section: this list holds only projects, and its
// Add listing button opens the dialog straight in PROJECT mode.
export function AdminProjectsPage() {
  const { t, locale } = useLocale()
  const [projectRows, setProjectRows] = useState<AdminProjectDto[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; project?: AdminProjectDto } | null>(
    null,
  )

  const load = useCallback(() => {
    fetch('/api/admin/listings')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('load failed'))))
      .then((data: { projects?: AdminProjectDto[] }) => {
        setProjectRows(data.projects ?? [])
        setLoadFailed(false)
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const lowerQuery = query.trim().toLowerCase()
  const filteredProjects = projectRows.filter((item) =>
    `${item.name} ${item.location} ${item.slug}`.toLowerCase().includes(lowerQuery),
  )

  const removeProject = async (id: string) => {
    if (!window.confirm(t('admin.confirmDeleteListing'))) return
    try {
      const response = await fetch(`/api/admin/listings/${id}?kind=PROJECT`, { method: 'DELETE' })
      if (!response.ok) throw new Error('delete failed')
      load()
    } catch {
      window.alert(t('admin.deleteFailed'))
    }
  }

  const exportCsv = () => {
    const rows = [
      ['Name', 'Slug', 'Location', 'Units', 'Listings', 'Updated'],
      ...filteredProjects.map((item) => [
        item.name,
        item.slug,
        item.location,
        String(item.totalUnits),
        String(item.propertyCount ?? 0),
        item.updatedAt,
      ]),
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'projects.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('admin.inventory')}</p>
          <h1 className="display-type mt-3 text-5xl">{t('admin.projectManagement')}</h1>
          <p className="mt-3 text-sm text-ink/55">{`${projectRows.length} ${t('projects')}`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" /> {t('admin.exportCsv')}
          </Button>
          <Button size="sm" onClick={() => setDialog({ mode: 'create' })}>
            <Plus className="h-3.5 w-3.5" /> {t('admin.addListing')}
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-panel border border-line bg-paper shadow-soft">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-end">
          <label className="flex h-10 items-center gap-2 rounded-full border border-line bg-stone/50 px-3">
            <Search className="h-3.5 w-3.5 text-ink/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('admin.searchInventory')}
              className="w-full bg-transparent text-xs font-semibold outline-none placeholder:text-ink/35 sm:w-64"
            />
          </label>
        </div>

        {!loaded ? (
          <p className="px-5 py-10 text-center text-xs font-semibold text-ink/45">
            {t('notif.loading')}
          </p>
        ) : loadFailed ? (
          <p className="px-5 py-10 text-center text-xs font-bold text-danger">
            {t('admin.loadFailed')}
          </p>
        ) : filteredProjects.length === 0 ? (
          <p className="px-5 py-10 text-center text-xs font-semibold text-ink/45">
            {t('admin.noListings')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-stone/60 text-[10px] font-bold uppercase tracking-[.13em] text-ink/40">
                <tr>
                  <th className="px-5 py-3">{t('admin.form.projectName')}</th>
                  <th className="px-3 py-3">{t('admin.form.locationEn')}</th>
                  <th className="px-3 py-3">{t('admin.units')}</th>
                  <th className="px-3 py-3">{t('properties')}</th>
                  <th className="px-3 py-3">{t('admin.updated')}</th>
                  <th className="w-24 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="group hover:bg-stone/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {project.coverImage ? (
                          <div className="image-frame h-11 w-14 shrink-0 rounded-lg">
                            <Image
                              src={project.coverImage}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-stone text-ink/30">
                            <Building2 className="h-4 w-4" />
                          </span>
                        )}
                        <div>
                          <p className="text-xs font-bold">{project.name}</p>
                          <p className="mt-1 text-[10px] text-ink/40">/projects/{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-ink/60">{project.location}</td>
                    <td className="px-3 py-3 text-xs font-bold numeric">{project.totalUnits}</td>
                    <td className="px-3 py-3 text-xs font-bold numeric">{project.propertyCount ?? 0}</td>
                    <td className="px-3 py-3 text-xs text-ink/45">
                      {project.updatedAt ? formatDateTime(project.updatedAt, locale) : ''}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: 'edit', project })}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-stone"
                          aria-label={`${t('admin.editProject')} — ${project.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProject(project.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-danger transition hover:bg-danger/10"
                          aria-label={`${t('admin.removeListing')} — ${project.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {dialog ? (
        <ListingDialog
          kind="PROJECT"
          mode={dialog.mode}
          project={dialog.project ?? null}
          projects={projectRows}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            load()
          }}
        />
      ) : null}
    </div>
  )
}

type ViewingRequest = {
  id: string
  name: string
  email: string
  phone: string
  note?: string | null
  property?: string | null
  createdAt: string
}

// A fresh account created through the public sign-up form.
type Registration = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AdminLeadsPage() {
  const { t, locale } = useLocale()
  const [requests, setRequests] = useState<ViewingRequest[]>([])
  const [requestsLoaded, setRequestsLoaded] = useState(false)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [registrationsLoaded, setRegistrationsLoaded] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/leads')
      .then((response) => (response.ok ? response.json() : { leads: [] }))
      .then((data: { leads?: ViewingRequest[] }) => {
        if (active) setRequests(data.leads ?? [])
      })
      .catch(() => {
        if (active) setRequests([])
      })
      .finally(() => {
        if (active) setRequestsLoaded(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/registrations')
      .then((response) => (response.ok ? response.json() : { registrations: [] }))
      .then((data: { registrations?: Registration[] }) => {
        if (active) setRegistrations(data.registrations ?? [])
      })
      .catch(() => {
        if (active) setRegistrations([])
      })
      .finally(() => {
        if (active) setRegistrationsLoaded(true)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('admin.crm')}</p>
          <h1 className="display-type mt-3 text-5xl">{t('admin.leadPipepline')}</h1>
          <p className="mt-3 text-sm text-ink/55">{t('admin.pipelineStats')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" /> {t('admin.export')}
          </Button>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> {t('admin.addLead')}
          </Button>
        </div>
      </div>
      <section className="mt-8 rounded-panel border border-line bg-paper p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{t('admin.recentRequests')}</p>
            <h2 className="display-type mt-2 text-3xl">{t('admin.recentRequestsTitle')}</h2>
            <p className="mt-2 text-sm text-ink/55">{t('admin.recentRequestsHint')}</p>
          </div>
          <span className="rounded-full bg-terracotta/10 px-3 py-1.5 text-[10px] font-extrabold text-terracotta">
            {requests.length}
          </span>
        </div>
        {requests.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-xs font-semibold text-ink/45">
            {requestsLoaded ? t('admin.noRequests') : t('notif.loading')}
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => (
              <li
                key={request.id}
                className="rounded-xl border border-line bg-stone/50 p-4 transition hover:shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta text-[10px] font-extrabold text-white">
                    {initialsOf(request.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{request.name}</p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-terracotta">
                      {request.property ?? t('admin.anyProperty')}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <a
                    href={`tel:${request.phone}`}
                    className="block truncate text-[11px] font-semibold text-ink/60 transition hover:text-terracotta"
                  >
                    {request.phone}
                  </a>
                  <a
                    href={`mailto:${request.email}`}
                    className="block truncate text-[11px] font-semibold text-ink/60 transition hover:text-terracotta"
                  >
                    {request.email}
                  </a>
                </div>
                {request.note && (
                  <p className="mt-3 line-clamp-2 rounded-lg bg-paper px-3 py-2 text-[11px] leading-4 text-ink/55">
                    {request.note}
                  </p>
                )}
                <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[10px] font-bold uppercase tracking-[.1em] text-ink/45">
                  <Clock3 className="h-3 w-3 shrink-0" />
                  {t('admin.requestedAt')}: {formatDateTime(request.createdAt, locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8 rounded-panel border border-line bg-paper p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{t('admin.newAccounts')}</p>
            <h2 className="display-type mt-2 text-3xl">{t('admin.newAccounts')}</h2>
            <p className="mt-2 text-sm text-ink/55">{t('admin.newAccountsHint')}</p>
          </div>
          <span className="rounded-full bg-moss/15 px-3 py-1.5 text-[10px] font-extrabold text-ink/70">
            {registrations.length}
          </span>
        </div>
        {registrations.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-xs font-semibold text-ink/45">
            {registrationsLoaded ? t('admin.noAccounts') : t('notif.loading')}
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {registrations.map((registration) => (
              <li
                key={registration.id}
                className="rounded-xl border border-line bg-stone/50 p-4 transition hover:shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss/30 text-[10px] font-extrabold text-ink">
                    {initialsOf(registration.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{registration.name}</p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-ink/55">
                      {registration.email}
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[10px] font-bold uppercase tracking-[.1em] text-ink/45">
                  <Clock3 className="h-3 w-3 shrink-0" />
                  {t('admin.joinedAt')}: {formatDateTime(registration.createdAt, locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="mt-8 grid gap-4 overflow-x-auto pb-4 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <section key={stage} className="min-w-[260px] rounded-panel border border-line bg-stone/55 p-3">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    stage === 'New'
                      ? 'bg-info'
                      : stage === 'Negotiation'
                        ? 'bg-terracotta'
                        : stage === 'Visit scheduled'
                          ? 'bg-gold'
                          : 'bg-ink/25',
                  )}
                />
                <h2 className="text-xs font-bold">{t(stageDisplayKeys[stage] as never)}</h2>
              </div>
              <span className="rounded-full bg-paper px-2 py-1 text-[10px] font-bold text-ink/45">
                {leads.filter((lead) => lead.stage === stage).length}
              </span>
            </div>
            <div className="mt-2 space-y-3">
              {leads
                .filter((lead) => lead.stage === stage)
                .map((lead) => (
                  <article
                    key={lead.name}
                    className="rounded-xl border border-line bg-paper p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-extrabold text-ink',
                            lead.color,
                          )}
                        >
                          {lead.initials}
                        </span>
                        <div>
                          <p className="text-xs font-bold">{lead.name}</p>
                          <p className="mt-0.5 text-[10px] text-ink/40">{t(lead.timeKey as never)}</p>
                        </div>
                      </div>
                      <GripVertical className="h-4 w-4 text-ink/25" />
                    </div>
                    <p className="mt-4 text-xs font-semibold text-ink/65">{t(lead.propertyKey as never)}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={cn('rounded-full px-2 py-1 text-[9px] font-bold', stageColors[stage])}>
                        `${lead.score} ${t('admin.scoreLower')}`
                      </span>
                      <button type="button" className="text-[10px] font-bold text-terracotta">
                        {t('open')} <ArrowUpRight className="ml-1 inline h-3 w-3" />
                      </button>
                    </div>
                  </article>
                ))}
            </div>
            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-[10px] font-bold text-ink/45 hover:border-terracotta hover:text-terracotta"
            >
              <Plus className="h-3.5 w-3.5" /> {t('admin.addLead')}
            </button>
          </section>
        ))}
      </div>
    </div>
  )
}

export function AdminVisitsPage() {
  const { t } = useLocale()
  const days = [
    `${t('admin.mon')} 02`,
    `${t('admin.tue')} 03`,
    `${t('admin.wed')} 04`,
    `${t('admin.thu')} 05`,
    `${t('admin.fri')} 06`,
    `${t('admin.sat')} 07`,
    `${t('admin.sun')} 08`,
  ]
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('admin.visitsAvailability')}</p>
          <h1 className="display-type mt-3 text-5xl">{t('admin.calendar')}</h1>
          <p className="mt-3 text-sm text-ink/55">{t('admin.calendarStats')}</p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" /> {t('admin.scheduleVisit')}
        </Button>
      </div>
      <div className="mt-8 overflow-x-auto rounded-panel border border-line bg-paper shadow-soft">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 border-b border-line">
            {days.map((day, index) => (
              <div
                key={day}
                className={cn('border-r border-line p-4 last:border-0', index === 0 && 'bg-terracotta/5')}
              >
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">
                  {day.split(' ')[0]}
                </p>
                <p className={cn('mt-2 text-xl font-extrabold', index === 0 && 'text-terracotta')}>
                  {day.split(' ')[1]}
                </p>
              </div>
            ))}
          </div>
          <div className="grid min-h-[520px] grid-cols-7 divide-x divide-line">
            <div className="space-y-3 p-3">
              <VisitCard time="11:30" name="Farhan Ahmed" color="bg-gold/30" />
              <VisitCard time="15:00" name="Maliha Karim" color="bg-moss/20" />
            </div>
            <div className="p-3">
              <VisitCard time="10:00" name="Rafiul Islam" color="bg-terracotta/15" />
            </div>
            <div className="p-3" />
            <div className="p-3">
              <VisitCard time="16:00" name="Tanjila Rahman" color="bg-moss/20" />
            </div>
            <div className="p-3">
              <VisitCard time="15:30" name="Imran Hossain" color="bg-gold/30" />
            </div>
            <div className="p-3">
              <VisitCard time="11:00" name={t('admin.walkInGrove')} color="bg-terracotta/15" />
            </div>
            <div className="p-3" />
          </div>
        </div>
      </div>
    </div>
  )
}

function VisitCard({ time, name, color }: { time: string; name: string; color: string }) {
  const { t } = useLocale()
  return (
    <article className={cn('rounded-xl border border-line p-3', color)}>
      <p className="flex items-center gap-1.5 text-[10px] font-extrabold text-ink/60">
        <Clock3 className="h-3 w-3" />
        {time}
      </p>
      <p className="mt-2 text-xs font-bold">{name}</p>
      <p className="mt-1 text-[10px] text-ink/45">{t('admin.leadGrove3A')}</p>
    </article>
  )
}

export function AdminMediaPage() {
  const { t, locale } = useLocale()
  const mediaTabs = [
    t('admin.tabImages'),
    t('admin.tabPanoramas'),
    t('admin.tabModels'),
    t('admin.tabFloorPlans'),
    t('admin.tabDocuments'),
    t('admin.tabProjectVideos'),
  ]
  const videosTab = mediaTabs[5] ?? 'videos'
  const imagesTab = mediaTabs[0] ?? 'images'
  const [active, setActive] = useState(imagesTab)
  const [showDropzone, setShowDropzone] = useState(false)
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('admin.assetsExperiences')}</p>
          <h1 className="display-type mt-3 text-5xl">{t('admin.mediaLibrary')}</h1>
          <p className="mt-3 text-sm text-ink/55">{t('admin.mediaStats')}</p>
        </div>
        <Button size="sm" onClick={() => setShowDropzone((current) => !current)}>
          <UploadCloud className="h-3.5 w-3.5" /> {t('admin.uploadAssets')}
        </Button>
      </div>
      <div className="mt-8 rounded-panel border border-line bg-paper p-4 shadow-soft sm:p-6">
        <div className="flex flex-wrap gap-1 border-b border-line pb-4">
          {mediaTabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActive(item)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-bold',
                active === item ? 'bg-ink text-paper' : 'text-ink/45 hover:bg-stone',
              )}
            >
              {item}
            </button>
          ))}
        </div>
        {showDropzone && active !== videosTab && <MediaDropzone />}
        {active === videosTab ? (
          <div className="mt-6">
            <AdminProjectVideoManager />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {properties.slice(0, 8).map((property, index) => (
              <article key={property.id} className="group">
                <div className="image-frame aspect-[4/3] rounded-xl">
                  <Image
                    src={property.gallery[index % property.gallery.length] ?? property.image}
                    alt={localizedText(property.title, property.titleBn, locale)}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/20" />
                  <button
                    type="button"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 opacity-0 transition group-hover:opacity-100"
                    aria-label={t('admin.moreOptionsFor', {
                      name: localizedText(property.title, property.titleBn, locale),
                    })}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="truncate text-xs font-bold">
                      {localizedText(property.title, property.titleBn, locale)}
                    </p>
                    <p className="mt-1 text-[10px] text-ink/40">
                      {active === imagesTab ? t('admin.webpSize') : `${active} · ${t('ready')}`}
                    </p>
                  </div>
                  <GripVertical className="h-4 w-4 shrink-0 text-ink/25" />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminReportsPage() {
  const { t } = useLocale()
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('admin.decisionsNotVanity')}</p>
          <h1 className="display-type mt-3 text-5xl">{t('admin.reports')}</h1>
          <p className="mt-3 text-sm text-ink/55">{t('admin.reportRange')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" /> {t('admin.pdf')}
          </Button>
          <Button size="sm">
            <ArrowDownToLine className="h-3.5 w-3.5" /> {t('admin.exportCsv')}
          </Button>
        </div>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <ReportCard
          title={t('admin.leadSources')}
          value="126"
          note={t('admin.websiteStrongest')}
          items={[
            [t('admin.sourceWebsite'), '62%', 'bg-terracotta'],
            [t('admin.sourceWhatsapp'), '18%', 'bg-moss'],
            [t('admin.sourceReferral'), '13%', 'bg-gold'],
            [t('admin.sourceFacebook2'), '7%', 'bg-info'],
          ]}
        />
        <ReportCard
          title={t('admin.agentPerformance')}
          value="34.6%"
          note={t('admin.avgConversion')}
          items={[
            [t('admin.userName'), '42%', 'bg-terracotta'],
            ['Tareq Mahmud', '35%', 'bg-moss'],
            ['Raisa Chowdhury', '28%', 'bg-gold'],
            [t('admin.teamAverage'), '34%', 'bg-ink/30'],
          ]}
        />
      </div>
      <div className="mt-5 rounded-panel border border-line bg-paper p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold text-ink/50">{t('admin.propertyPerformance')}</p>
            <p className="mt-1 text-xl font-bold">{t('admin.mostRequested')}</p>
          </div>
          <button type="button" className="flex items-center gap-2 text-xs font-bold text-terracotta">
            {t('admin.last30Days')} <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-7 space-y-5">
          {properties.slice(0, 5).map((property, index) => (
            <div key={property.id} className="flex items-center gap-3">
              <span className="w-5 text-xs font-extrabold text-ink/35">0{index + 1}</span>
              <div className="image-frame h-10 w-14 shrink-0 rounded-lg">
                <Image src={property.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <p className="min-w-0 flex-1 truncate text-xs font-bold">
                {t(propertyTitleKeys[index] as never)}
              </p>
              <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-stone sm:block">
                <span
                  className="block h-full rounded-full bg-terracotta"
                  style={{ width: `${86 - index * 12}%` }}
                />
              </div>
              <span className="numeric w-12 text-right text-xs font-extrabold">{86 - index * 12}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReportCard({
  title,
  value,
  note,
  items,
}: {
  title: string
  value: string
  note: string
  items: string[][]
}) {
  return (
    <section className="rounded-panel border border-line bg-paper p-6 shadow-soft">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-ink/50">{title}</p>
          <p className="numeric mt-3 text-3xl font-extrabold">{value}</p>
        </div>
        <Copy className="h-4 w-4 text-ink/25" />
      </div>
      <p className="mt-2 text-xs text-ink/45">{note}</p>
      <div className="mt-7 space-y-4">
        {items.map(([label, percentage, color]) => (
          <div key={label}>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink/60">{label}</span>
              <span className="font-extrabold">{percentage}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone">
              <div className={cn('h-full rounded-full', color)} style={{ width: percentage }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function AdminSettingsPage() {
  const { t } = useLocale()
  return (
    <div className="mx-auto max-w-[960px]">
      <p className="eyebrow">{t('admin.workspaceControls')}</p>
      <h1 className="display-type mt-3 text-5xl">{t('admin.settings')}</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-[180px_1fr]">
        <nav className="space-y-1">
          <button
            type="button"
            className="w-full rounded-xl bg-terracotta/10 px-3 py-3 text-left text-xs font-bold text-terracotta"
          >
            {t('admin.companyBrand')}
          </button>
          {/* Lead routing, notifications and security & access are not needed yet.
              Kept in the code on purpose; uncomment these buttons to bring them back. */}
          {/*
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-xs font-bold text-ink/50 hover:bg-stone"
          >
            {t('admin.leadRouting')}
          </button>
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-xs font-bold text-ink/50 hover:bg-stone"
          >
            {t('admin.notifications')}
          </button>
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-xs font-bold text-ink/50 hover:bg-stone"
          >
            {t('admin.securityAccess')}
          </button>
          */}
        </nav>
        <section className="rounded-panel border border-line bg-paper p-6 shadow-soft">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone text-terracotta">
              <Settings2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold">{t('admin.companyBrand')}</h2>
              <p className="mt-1 text-xs text-ink/45">{t('admin.companyDetailsCopy')}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold">{t('admin.companyName')}</span>
              <input
                defaultValue="স্বাধীন এস্টেটস "
                className="mt-2 h-11 w-full rounded-xl border border-line bg-stone px-3 text-sm outline-none focus:border-terracotta"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold">{t('admin.defaultCurrency')}</span>
              <select
                defaultValue="BDT"
                className="mt-2 h-11 w-full rounded-xl border border-line bg-stone px-3 text-sm outline-none focus:border-terracotta"
              >
                <option>BDT · ৳</option>
                <option>USD · $</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold">{t('admin.publicResponsePromise')}</span>
              <input
                defaultValue={t('admin.replyPromiseValue')}
                className="mt-2 h-11 w-full rounded-xl border border-line bg-stone px-3 text-sm outline-none focus:border-terracotta"
              />
            </label>
          </div>
          <div className="mt-7 flex justify-end border-t border-line pt-5">
            <Button>{t('admin.saveChanges')}</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
