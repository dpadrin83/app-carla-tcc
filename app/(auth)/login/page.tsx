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
    <Card className="w-full max-w-[420px] border-border shadow-sm">
      <CardHeader className="space-y-3 text-center pb-0">
        <div className="flex justify-center pt-2">
          <BrandLogo size="lg" priority />
        </div>
        {expired && (
          <p className="text-sm text-amber-900 bg-[#fffbeb] border border-[#fde68a] rounded-lg p-3">
            Sessão expirada. Entre novamente.
          </p>
        )}
        <CardDescription className="text-[15px]">
          Acesso restrito ao consultório.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4 pt-6">
          {state?.error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              disabled={isPending}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[#f5f5f5]">
      <Suspense
        fallback={
          <Card className="w-full max-w-[420px] p-8 text-center text-muted-foreground">
            Carregando…
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
