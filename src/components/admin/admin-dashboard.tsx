'use client'

import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  MoreHorizontal,
  Phone,
  Plus,
  Target,
  UserRound,
  Users,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { Button, ButtonLink } from '@/components/ui/button'
import { useLocale } from '@/i18n/locale-provider'
import { cn } from '@/lib/utils'

const kpis = [
  {
    labelKey: 'admin.activeListings',
    value: '48',
    delta: '+8.4%',
    direction: 'up',
    noteKey: 'admin.vsLastMonth',
    color: 'bg-terracotta',
  },
  {
    labelKey: 'admin.openLeads',
    value: '126',
    delta: '+12.7%',
    direction: 'up',
    noteKey: 'admin.vsLastMonth',
    color: 'bg-moss',
  },
  {
    labelKey: 'admin.visitsToday',
    value: '08',
    delta: 'admin.threeUpcoming',
    direction: 'neutral',
    noteKey: 'admin.nextAt1130',
    color: 'bg-gold',
  },
  {
    labelKey: 'admin.closedThisMonth',
    value: '৳4.8 Cr',
    delta: '+18.2%',
    direction: 'up',
    noteKey: 'admin.vsLastMonth',
    color: 'bg-ink',
  },
]

const leads = [
  {
    name: 'Tanjila Rahman',
    initials: 'TR',
    propertyKey: 'admin.leadGroveResidence',
    sourceKey: 'admin.sourceWebsite',
    stageKey: 'admin.stageNew',
    score: 78,
    followKey: 'admin.followToday1400',
    color: 'bg-[#c8a49c]',
  },
  {
    name: 'Farhan Ahmed',
    initials: 'FA',
    propertyKey: 'admin.leadCourtyardHouse',
    sourceKey: 'admin.sourceReferral',
    stageKey: 'admin.stageVisitScheduled',
    score: 92,
    followKey: 'admin.followTomorrow1030',
    color: 'bg-[#9fae9d]',
  },
  {
    name: 'Maliha Karim',
    initials: 'MK',
    propertyKey: 'admin.leadSouthTerrace',
    sourceKey: 'admin.sourceWhatsapp',
    stageKey: 'admin.stageNegotiation',
    score: 84,
    followKey: 'admin.followToday1630',
    color: 'bg-[#b8a88f]',
  },
  {
    name: 'Sabbir Hossain',
    initials: 'SH',
    propertyKey: 'admin.leadGreenEdge',
    sourceKey: 'admin.sourceFacebook',
    stageKey: 'admin.stageContacted',
    score: 62,
    followKey: 'admin.followWed0900',
    color: 'bg-[#a1a7b7]',
  },
]

const stageDisplayKeys: Record<string, string> = {
  New: 'admin.stageNew',
  Contacted: 'admin.stageContacted',
  'Visit scheduled': 'admin.stageVisitScheduled',
  Negotiation: 'admin.stageNegotiation',
}

const filterStageKeys = [
  'admin.stageNew',
  'admin.stageContacted',
  'admin.stageVisitScheduled',
  'admin.stageNegotiation',
] as const

// Header/panel filter: narrows the Recent lead activity list to one stage.
function StageFilterMenu({
  variant,
  open,
  onToggle,
  value,
  onChange,
}: {
  variant: 'outline' | 'ghost'
  open: boolean
  onToggle: (open: boolean) => void
  value: string | null
  onChange: (value: string | null) => void
}) {
  const { t } = useLocale()
  return (
    <div className="relative">
      <Button
        variant={variant}
        size="sm"
        aria-expanded={open}
        onClick={() => onToggle(!open)}
        className={cn(value && 'border-terracotta text-terracotta')}
      >
        <Filter className="h-3.5 w-3.5" /> {value ? t(value as never) : t('filter')}
      </Button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-20"
            onMouseDown={() => onToggle(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-line bg-paper p-1 shadow-float">
            <button
              type="button"
              onClick={() => {
                onChange(null)
                onToggle(false)
              }}
              className={cn(
                'block w-full rounded-lg px-3 py-2 text-left text-xs font-bold transition hover:bg-stone',
                !value && 'text-terracotta',
              )}
            >
              {t('admin.allStages')}
            </button>
            {filterStageKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key)
                  onToggle(false)
                }}
                className={cn(
                  'block w-full rounded-lg px-3 py-2 text-left text-xs font-bold transition hover:bg-stone',
                  value === key && 'text-terracotta',
                )}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

const stageColors: Record<string, string> = {
  New: 'bg-[hsl(var(--info)/.12)] text-[hsl(var(--info))]',
  Contacted: 'bg-stone text-ink/60',
  'Visit scheduled': 'bg-[hsl(var(--gold)/.18)] text-[hsl(var(--warning))]',
  Negotiation: 'bg-[hsl(var(--terracotta)/.12)] text-terracotta',
}

function Sparkline({ variant }: { variant: number }) {
  const paths = [
    'M0 30 C15 26 18 31 28 23 S43 12 52 19 S67 9 78 13 S92 8 100 3',
    'M0 26 C12 20 18 26 29 19 S42 21 51 14 S67 17 78 9 S91 12 100 5',
    'M0 13 C15 18 18 9 29 16 S43 12 53 18 S67 11 79 16 S91 5 100 9',
    'M0 28 C15 20 21 21 30 22 S42 4 53 13 S65 5 77 11 S89 8 100 2',
  ]
  return (
    <svg viewBox="0 0 100 34" className="h-9 w-24 overflow-visible">
      <path
        d={paths[variant] ?? paths[0]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="text-terracotta"
      />
    </svg>
  )
}

function MetricCard({ item, index }: { item: (typeof kpis)[number]; index: number }) {
  const { t } = useLocale()
  return (
    <div className="rounded-panel border border-line bg-paper p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-ink/50">{t(item.labelKey as never)}</p>
          <p className="numeric mt-3 text-3xl font-extrabold tracking-[-.05em]">{item.value}</p>
        </div>
        <span className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <p
          className={cn(
            'flex items-center gap-1 text-[10px] font-bold',
            item.direction === 'up' ? 'text-[hsl(var(--available))]' : 'text-ink/45',
          )}
        >
          {item.direction === 'up' && <ArrowUpRight className="h-3 w-3" />}
          {item.direction === 'neutral' ? t(item.delta as never) : item.delta}
        </p>
        <Sparkline variant={index} />
      </div>
      <p className="mt-1 text-[10px] text-ink/35">{t(item.noteKey as never)}</p>
    </div>
  )
}

export function AdminDashboard() {
  const { t, locale } = useLocale()
  const today = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const ranges = [t('admin.last7Days'), t('admin.last30Days'), t('admin.thisYear')]
  const [range, setRange] = useState(ranges[1] ?? '')
  const [stageFilter, setStageFilter] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [panelFilterOpen, setPanelFilterOpen] = useState(false)
  // The Filter button narrows the Recent lead activity list to one stage.
  const visibleLeads = stageFilter ? leads.filter((lead) => lead.stageKey === stageFilter) : leads
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('admin.todayDate', { date: today })}</p>
          <h1 className="display-type mt-3 text-5xl leading-[.9]">
            {t('admin.goodMorning')},
            <br />
            <em className="font-normal text-terracotta">{t('admin.userName')}.</em>
          </h1>
        </div>
        <div className="flex gap-2">
          <StageFilterMenu
            variant="outline"
            open={filterOpen}
            onToggle={setFilterOpen}
            value={stageFilter}
            onChange={setStageFilter}
          />
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item, index) => (
          <MetricCard key={item.labelKey} item={item} index={index} />
        ))}
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
        <section className="rounded-panel border border-line bg-paper p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-ink/50">{t('admin.leadFlow')}</p>
              <p className="mt-1 text-xl font-bold">{t('admin.enquiriesConversions')}</p>
            </div>
            <div className="flex gap-1 rounded-full bg-stone p-1">
              {ranges.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRange(item)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[10px] font-bold transition',
                    range === item ? 'bg-paper text-ink shadow-soft' : 'text-ink/45',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-[1fr_auto] gap-4">
            <div className="relative h-64">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-ink/30">
                <span>120</span>
                <span>80</span>
                <span>40</span>
                <span>0</span>
              </div>
              <div className="absolute inset-0 ml-7 flex flex-col justify-between">
                <span className="border-t border-dashed border-line" />
                <span className="border-t border-dashed border-line" />
                <span className="border-t border-dashed border-line" />
                <span className="border-t border-line" />
              </div>
              <svg
                viewBox="0 0 600 260"
                preserveAspectRatio="none"
                className="absolute inset-0 ml-7 h-full w-[calc(100%-28px)]"
              >
                <defs>
                  <linearGradient id="lead-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="hsl(var(--terracotta))" stopOpacity=".25" />
                    <stop offset="1" stopColor="hsl(var(--terracotta))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 220 C40 180 52 204 82 165 S126 174 160 130 S200 150 232 107 S271 124 304 92 S346 122 375 75 S417 104 449 66 S500 95 530 39 S570 52 600 20 L600 260 L0 260 Z"
                  fill="url(#lead-fill)"
                />
                <path
                  d="M0 220 C40 180 52 204 82 165 S126 174 160 130 S200 150 232 107 S271 124 304 92 S346 122 375 75 S417 104 449 66 S500 95 530 39 S570 52 600 20"
                  fill="none"
                  stroke="hsl(var(--terracotta))"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="absolute inset-x-7 bottom-[-24px] flex justify-between text-[10px] text-ink/35">
                <span>04 Oct</span>
                <span>11 Oct</span>
                <span>18 Oct</span>
                <span>25 Oct</span>
                <span>02 Nov</span>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 border-l border-line pl-4">
              <div>
                <span className="flex items-center gap-2 text-[10px] font-bold text-ink/45">
                  <span className="h-2 w-2 rounded-full bg-terracotta" /> {t('admin.enquiries')}
                </span>
                <p className="numeric mt-1 text-xl font-extrabold">126</p>
              </div>
              <div>
                <span className="flex items-center gap-2 text-[10px] font-bold text-ink/45">
                  <span className="h-2 w-2 rounded-full bg-moss" /> {t('admin.qualified')}
                </span>
                <p className="numeric mt-1 text-xl font-extrabold">54</p>
              </div>
              <div>
                <span className="flex items-center gap-2 text-[10px] font-bold text-ink/45">
                  <span className="h-2 w-2 rounded-full bg-gold" /> {t('visits')}
                </span>
                <p className="numeric mt-1 text-xl font-extrabold">28</p>
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-panel bg-ink p-6 text-paper shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-paper/50">{t('admin.todaysRhythm')}</p>
              <p className="mt-1 text-xl font-bold">{t('admin.yourNextVisits')}</p>
            </div>
            <CalendarDays className="h-5 w-5 text-gold" />
          </div>
          <div className="mt-7 space-y-5">
            {[
              { time: '11:30', name: 'Farhan Ahmed', type: t('admin.visitGrove3A'), icon: Video },
              { time: '14:00', name: 'Imran Hossain', type: t('admin.discoveryCall'), icon: Phone },
              { time: '16:30', name: 'Maliha Karim', type: t('admin.visitSouthTerrace'), icon: UserRound },
            ].map((visit) => (
              <div key={visit.time} className="flex gap-3">
                <div className="w-12 pt-1 text-xs font-extrabold text-gold">{visit.time}</div>
                <div className="flex min-w-0 flex-1 items-start gap-3 border-l border-white/15 pl-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <visit.icon className="h-3.5 w-3.5 text-paper/70" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{visit.name}</p>
                    <p className="mt-1 truncate text-[10px] text-paper/45">{visit.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/visits"
            className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-gold"
          >
            {t('admin.openCalendar')} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>
      <section className="mt-7 rounded-panel border border-line bg-paper shadow-soft">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="text-xs font-semibold text-ink/50">{t('admin.salesPipeline')}</p>
            <p className="mt-1 text-xl font-bold">{t('admin.recentLeadActivity')}</p>
          </div>
          <div className="flex gap-2">
            <StageFilterMenu
              variant="ghost"
              open={panelFilterOpen}
              onToggle={setPanelFilterOpen}
              value={stageFilter}
              onChange={setStageFilter}
            />
            <ButtonLink href="/admin/leads" variant="outline" size="sm">
              {t('viewAll')} <ArrowUpRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        </div>
        {visibleLeads.length === 0 ? (
          <p className="px-6 py-8 text-center text-xs font-semibold text-ink/45">
            {t('admin.noLeadsMatchFilter')}
          </p>
        ) : (
          <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-stone/60 text-[10px] font-bold uppercase tracking-[.13em] text-ink/40">
              <tr>
                <th className="px-6 py-3">{t('admin.lead')}</th>
                <th className="px-4 py-3">{t('property')}</th>
                <th className="px-4 py-3">{t('admin.stage')}</th>
                <th className="px-4 py-3">{t('admin.score')}</th>
                <th className="px-4 py-3">{t('admin.nextFollowUp')}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visibleLeads.map((lead) => (
                <tr key={lead.name} className="group transition hover:bg-stone/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-extrabold text-ink',
                          lead.color,
                        )}
                      >
                        {lead.initials}
                      </span>
                      <div>
                        <p className="text-xs font-bold">{lead.name}</p>
                        <p className="mt-1 text-[10px] text-ink/40">{t(lead.sourceKey as never)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-ink/60">{t(lead.propertyKey as never)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[10px] font-bold',
                        stageColors[lead.stageKey as string],
                      )}
                    >
                      {t(lead.stageKey as never)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2 text-xs font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                      {lead.score}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-ink/50">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {t(lead.followKey as never)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full opacity-40 transition hover:bg-stone hover:opacity-100"
                      aria-label={t('admin.moreActionsFor', { name: lead.name })}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-line md:hidden">
          {visibleLeads.map((lead) => (
            <div key={lead.name} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-extrabold text-ink',
                      lead.color,
                    )}
                  >
                    {lead.initials}
                  </span>
                  <div>
                    <p className="text-xs font-bold">{lead.name}</p>
                    <p className="mt-1 text-[10px] text-ink/40">{t(lead.propertyKey as never)}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-bold',
                    stageColors[lead.stageKey as string],
                  )}
                >
                  {t(lead.stageKey as never)}
                </span>
              </div>
              <div className="mt-4 flex justify-between text-[10px] text-ink/45">
                <span>
                  {t('admin.score')} <b className="text-ink">{lead.score}</b>
                </span>
                <span>{t(lead.followKey as never)}</span>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </section>
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-panel border border-line bg-paper p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink/50">{t('admin.inventoryPulse')}</p>
              <p className="mt-1 text-xl font-bold">{t('admin.propertyStatus')}</p>
            </div>
            <Link href="/admin/properties" className="text-xs font-bold text-terracotta">
              {t('manage')}
            </Link>
          </div>
          <div className="mt-7 flex items-center gap-8">
            <div
              className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  'conic-gradient(hsl(var(--available)) 0 58%, hsl(var(--booked)) 58% 72%, hsl(var(--sold)) 72% 86%, hsl(var(--upcoming)) 86% 100%)',
              }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-paper">
                <span className="numeric text-2xl font-extrabold">84</span>
                <span className="text-[9px] uppercase tracking-[.12em] text-ink/40">{t('admin.units')}</span>
              </div>
            </div>
            <div className="space-y-3 text-xs">
              {[
                [t('status.available'), '49', 'bg-[hsl(var(--available))]'],
                [t('status.booked'), '12', 'bg-[hsl(var(--booked))]'],
                [t('status.sold'), '13', 'bg-[hsl(var(--sold))]'],
                [t('status.upcoming'), '10', 'bg-[hsl(var(--upcoming))]'],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', color)} />
                  <span className="w-20 text-ink/55">{label}</span>
                  <span className="font-extrabold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-panel border border-line bg-paper p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink/50">{t('admin.tasks')}</p>
              <p className="mt-1 text-xl font-bold">{t('admin.closeTheLoop')}</p>
            </div>
            <Button variant="ghost" size="sm">
              <Plus className="h-3.5 w-3.5" /> {t('admin.addTask')}
            </Button>
          </div>
          <div className="mt-5 space-y-2">
            {[t('admin.task1'), t('admin.task2'), t('admin.task3'), t('admin.task4')].map((task, index) => (
              <label key={task} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-stone">
                <input type="checkbox" className="h-4 w-4 rounded border-line accent-terracotta" />
                <span className={cn('flex-1 text-xs font-semibold', index === 2 && 'text-ink/45')}>
                  {task}
                </span>
                <span className="text-[10px] text-ink/35">
                  {index === 0 || index === 1 ? t('today') : t('wed')}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
