'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { addComment, markCommentsRead } from '@/app/app/comentarios/actions'
import { useEffect } from 'react'

type Comment = {
  id: string
  content: string
  created_at: string
  author_id: string | null
  profiles?: { full_name: string } | null
}

export function CommentsThread({
  patientId,
  taskId,
  comments: initial,
  currentUserId,
}: {
  patientId?: string
  taskId?: string
  comments: Comment[]
  currentUserId: string
}) {
  const [comments, setComments] = useState(initial)
  const [text, setText] = useState('')

  useEffect(() => {
    if (patientId) markCommentsRead(patientId, currentUserId)
  }, [patientId, currentUserId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await addComment({ content: text, patient_id: patientId, task_id: taskId })
    setText('')
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum comentário ainda.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-muted/30 rounded-lg p-3 text-sm">
              <p className="font-medium text-xs text-muted-foreground mb-1">
                {c.profiles?.full_name ?? 'Usuário'} ·{' '}
                {new Date(c.created_at).toLocaleString('pt-BR')}
              </p>
              <p className="whitespace-pre-wrap">{c.content}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm min-h-[80px]"
        />
        <Button type="submit" size="sm" className="self-end">Enviar</Button>
      </form>
    </div>
  )
}
