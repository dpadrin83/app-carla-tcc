'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { registerSessionPayment } from '@/app/app/financeiro/actions'

export function SessionPaymentBanner({
  sessionId,
  patientId,
  amount,
}: {
  sessionId: string
  patientId: string
  amount: number
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 space-y-3">
      <p>
        Registrar pagamento de <strong>R$ {amount.toFixed(2)}</strong>? (ex.: Pix recebido)
      </p>
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await registerSessionPayment(sessionId, patientId)
          })
        }
      >
        {pending ? 'Salvando…' : 'Sim, registrei via Pix'}
      </Button>
    </div>
  )
}
