'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { uploadAttachment, deleteAttachment, getAttachmentDownloadUrl } from '@/app/app/pacientes/[id]/attachments/actions'

type Attachment = {
  id: string
  file_name: string
  file_type: string | null
  category: string | null
  created_at: string
}

export function AttachmentsPanel({
  patientId,
  attachments,
  isPsicologa,
}: {
  patientId: string
  attachments: Attachment[]
  isPsicologa: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const categories = isPsicologa
    ? (['contrato', 'documento', 'exame', 'outro'] as const)
    : (['contrato', 'documento', 'outro'] as const)

  function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      setMessage(null)
      const res = await uploadAttachment(patientId, fd)
      if (res.error) setMessage(res.error)
      else {
        setMessage('Arquivo enviado.')
        form.reset()
      }
    })
  }

  function onDownload(id: string) {
    startTransition(async () => {
      const res = await getAttachmentDownloadUrl(id, patientId)
      if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer')
      else setMessage(res.error ?? 'Erro ao baixar')
    })
  }

  function onDelete(id: string) {
    if (!confirm('Excluir este anexo?')) return
    startTransition(async () => {
      const res = await deleteAttachment(id, patientId)
      if (res.error) setMessage(res.error)
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="border rounded-xl p-4 space-y-3 bg-card">
        <p className="text-sm font-medium">Enviar arquivo (máx. 10MB)</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input name="file" type="file" required className="text-sm flex-1" disabled={pending} />
          <select
            name="category"
            required
            defaultValue="documento"
            className="border rounded-lg px-3 py-2 text-sm"
            disabled={pending}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Enviando…' : 'Enviar'}
          </Button>
        </div>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </form>

      <div className="border rounded-xl divide-y">
        {!attachments.length ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Nenhum anexo ainda.</p>
        ) : (
          attachments.map((a) => (
            <div
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 text-sm"
            >
              <div>
                <p className="font-medium">{a.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.category ?? 'outro'} · {new Date(a.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onDownload(a.id)} disabled={pending}>
                  Baixar
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(a.id)} disabled={pending}>
                  Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
