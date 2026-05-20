'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, UserRound } from 'lucide-react'
import {
  getPatientAge,
  getPatientStatusTag,
  type PatientListItem,
} from '@/lib/patients/status'

type StatusFilter = 'all' | 'active' | 'inactive'

export function PacientesListClient({
  patients,
  canCreate,
}: {
  patients: PatientListItem[]
  canCreate: boolean
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return patients.filter((p) => {
      if (statusFilter === 'active' && !p.active) return false
      if (statusFilter === 'inactive' && p.active) return false
      if (q && !p.full_name.toLowerCase().includes(q)) return false
      return true
    })
  }, [patients, query, statusFilter])

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'active', label: 'Ativos' },
    { key: 'inactive', label: 'Inativos' },
    { key: 'all', label: 'Todos' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar por nome..."
            className="pl-9 bg-card"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar paciente por nome"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
          {filters.map((f) => (
            <Button
              key={f.key}
              type="button"
              size="sm"
              variant={statusFilter === f.key ? 'default' : 'outline'}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <UserRound className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">
              {patients.length === 0 ? 'Nenhum paciente ainda' : 'Nenhum resultado'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {patients.length === 0
                ? 'Comece adicionando seu primeiro paciente ou importe sua lista do Consultório Psi.'
                : 'Tente outro nome ou altere o filtro.'}
            </p>
          </div>
          {canCreate && patients.length === 0 && (
            <Link href="/app/pacientes/novo">
              <Button variant="outline">Adicionar o primeiro</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => {
            const tag = getPatientStatusTag(patient)
            const age = getPatientAge(patient.birth_date)
            return (
              <Link key={patient.id} href={`/app/pacientes/${patient.id}`}>
                <article className="panel p-5 hover:border-primary/30 transition-colors group cursor-pointer h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary font-semibold shrink-0"
                      aria-hidden
                    >
                      {patient.full_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-medium text-base group-hover:text-primary transition-colors line-clamp-1">
                        {patient.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.active ? 'Ativo' : 'Inativo'}
                        {age != null ? ` · ${age} anos` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t flex items-center gap-2 flex-wrap">
                    <Badge variant={tag.variant} className="font-normal">
                      {tag.label}
                    </Badge>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
