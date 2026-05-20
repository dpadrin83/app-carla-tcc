import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Página não encontrada</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link href="/app/hoje">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  )
}
