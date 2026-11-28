'use client'

import { AlertCircle, CheckCircle2, FileImage, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n/locale-provider'
import { cn } from '@/lib/utils'

type UploadItem = {
  id: string
  file: File
  status: 'ready' | 'uploading' | 'uploaded' | 'error'
  message?: string
}

const acceptedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'model/gltf-binary',
  'application/pdf',
]
const maxSize = 150 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaDropzone() {
  const { t } = useLocale()
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState('')

  function addFiles(fileList: FileList | File[]) {
    const next: UploadItem[] = []
    for (const file of Array.from(fileList)) {
      if (!acceptedTypes.includes(file.type)) {
        next.push({
          id: `${file.name}-${file.lastModified}`,
          file,
          status: 'error',
          message: t('dropzone.unsupportedType', { name: file.name }),
        })
      } else if (file.size > maxSize) {
        next.push({
          id: `${file.name}-${file.lastModified}`,
          file,
          status: 'error',
          message: t('dropzone.tooLarge', { name: file.name, size: '150 MB' }),
        })
      } else {
        next.push({ id: `${file.name}-${file.lastModified}`, file, status: 'ready' })
      }
    }
    setItems((current) => [
      ...current,
      ...next.filter((item) => !current.some((existing) => existing.id === item.id)),
    ])
    setMessage(next.length > 0 ? `${next.length} ${t('dropzone.assetsReady')}` : '')
  }

  async function uploadItem(item: UploadItem) {
    setItems((current) =>
      current.map((entry) => (entry.id === item.id ? { ...entry, status: 'uploading' } : entry)),
    )
    try {
      const signResponse = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: item.file.type,
          size: item.file.size,
          originalName: item.file.name,
        }),
      })
      if (!signResponse.ok) {
        const result = (await signResponse.json().catch(() => null)) as { error?: string } | null
        throw new Error(result?.error ?? t('dropzone.storageNotConfigured'))
      }
      const signed = (await signResponse.json()) as { uploadUrl: string }
      const uploadResponse = await fetch(signed.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': item.file.type },
        body: item.file,
      })
      if (!uploadResponse.ok) throw new Error(t('dropzone.uploadFailed'))
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: 'uploaded', message: t('dropzone.awaitingProcessing') }
            : entry,
        ),
      )
    } catch (error) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                status: 'error',
                message: error instanceof Error ? error.message : t('dropzone.uploadFailed'),
              }
            : entry,
        ),
      )
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-line bg-stone/45 p-4 sm:p-5">
      <div
        className={cn(
          'rounded-2xl border-2 border-dashed p-6 text-center transition',
          dragging
            ? 'border-terracotta bg-terracotta/10'
            : 'border-line bg-paper/60 hover:border-terracotta/60',
        )}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFiles(event.dataTransfer.files)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files)
            event.currentTarget.value = ''
          }}
        />
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
          <UploadCloud className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-sm font-bold">{t('dropzone.heading')}</h2>
        <p className="mt-2 text-xs leading-5 text-ink/50">{t('dropzone.copy')}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          <FileImage className="h-3.5 w-3.5" /> {t('dropzone.chooseFiles')}
        </Button>
        <p className="mt-3 text-[10px] text-ink/35">{t('dropzone.dragHint')}</p>
      </div>
      {message && <p className="mt-3 text-xs font-semibold text-moss">{message}</p>}
      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-paper p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                <FileImage className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{item.file.name}</p>
                <p className="mt-1 text-[10px] text-ink/45">
                  {formatBytes(item.file.size)} ·{' '}
                  {item.status === 'ready'
                    ? t('dropzone.readyToUpload')
                    : item.status === 'uploading'
                      ? t('dropzone.uploading')
                      : item.status === 'uploaded'
                        ? item.message
                        : item.message}
                </p>
              </div>
              {item.status === 'ready' && (
                <Button type="button" size="sm" onClick={() => uploadItem(item)}>
                  {t('dropzone.upload')}
                </Button>
              )}
              {item.status === 'uploading' && (
                <span className="text-[10px] font-bold text-terracotta">{t('dropzone.uploading')}</span>
              )}
              {item.status === 'uploaded' && <CheckCircle2 className="h-4 w-4 text-moss" />}
              {item.status === 'error' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-danger">
                  <AlertCircle className="h-3.5 w-3.5" /> {item.message}
                </span>
              )}
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/35 hover:bg-stone hover:text-ink"
                aria-label={`${t('remove')} ${item.file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
