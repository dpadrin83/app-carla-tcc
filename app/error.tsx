'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Algo deu errado</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Respire um momento. Se persistir, tente novamente ou contate o suporte do consultório.
      </p>
      <Button onClick={() => reset()}>Tentar novamente</Button>
    
    </div>
  )
}
