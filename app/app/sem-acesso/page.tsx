import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function SemAcessoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <h1 className="text-2xl font-semibold mb-2">Acesso Restrito</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Você não tem permissão para acessar esta página. Esta área é restrita para o perfil de psicóloga devido ao sigilo de dados clínicos.
      </p>
      <a href="/app/tarefas" className="text-sm font-medium text-primary hover:underline">
        Voltar para o Painel de Tarefas
      </a>
    </div>
  )
}
