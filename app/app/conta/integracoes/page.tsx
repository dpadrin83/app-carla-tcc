import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function IntegracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  )

  const { data: integration } = await supabase
    .from('google_integrations')
    .select('updated_at')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <Link href="/app/hoje" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-semibold">Integrações</h1>

      {params.connected === '1' && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          Google Agenda conectado com sucesso.
        </p>
      )}
      {params.error && (
        <p className="text-sm text-destructive bg-destructive/10 border rounded-lg p-3">
          Não foi possível conectar. Tente novamente ou verifique as credenciais no .env.local.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Google Agenda</CardTitle>
          <CardDescription>
            Leitura da agenda profissional (horário comercial). Escopo: somente leitura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!googleConfigured && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Google Agenda está desativado (credenciais vazias no .env.local). O restante do
              sistema funciona normalmente — login é por e-mail e senha no Supabase, não pelo
              Google.
            </p>
          )}
          {integration ? (
            <p className="text-sm text-muted-foreground">
              Conectado. Última atualização:{' '}
              {new Date(integration.updated_at).toLocaleString('pt-BR')}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Não conectado.</p>
          )}
          {googleConfigured ? (
            <a
              href="/api/auth/google"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              {integration ? 'Reconectar Google Agenda' : 'Conectar Google Agenda'}
            </a>
          ) : (
            <Button type="button" disabled variant="secondary">
              Conectar Google Agenda (indisponível)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
