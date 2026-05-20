'use client'

import { Suspense, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login } from './actions'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'

function LoginForm() {
  const searchParams = useSearchParams()
  const expired = searchParams.get('expired') === '1'

  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => login(formData),
    null
  )

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80 rounded-2xl">
      <CardHeader className="space-y-4 text-center pb-2">
        <div className="flex justify-center pt-2">
          <BrandLogo size="lg" priority />
        </div>
        {expired && (
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">
            Sessão expirada por inatividade. Entre novamente.
          </p>
        )}
        <CardDescription className="text-base">
          Acesso restrito ao consultório. Esqueceu a senha? Contate o administrador.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-5">
          {state?.error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              disabled={isPending}
              autoComplete="email"
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
              autoComplete="current-password"
              className="h-11 rounded-lg"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button className="w-full h-11 rounded-lg text-base" type="submit" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 app-canvas">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)] pointer-events-none" />
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8 text-center text-muted-foreground rounded-2xl">
            Carregando…
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
