import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Upload, UserRound } from 'lucide-react'
import { patientsTable } from '@/lib/supabase/role-tables'

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const table = patientsTable(profile?.role)

  const { data: patients, error } = await supabase
    .from(table as 'patients')
    .select('id, full_name, active, phone, email, birth_date')
    .order('full_name')

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/app/pacientes/importar" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
          </Link>
          <Link href="/app/pacientes/novo" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar por nome..." 
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {!patients || patients.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <UserRound className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Nenhum paciente ainda</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Comece adicionando seu primeiro paciente ou importe sua lista do Consultório Psi.
            </p>
          </div>
          <Link href="/app/pacientes/novo">
            <Button variant="outline" className="mt-2">Adicionar o primeiro</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Link key={patient.id} href={`/app/pacientes/${patient.id}`}>
              <div className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {patient.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-base group-hover:text-primary transition-colors line-clamp-1">
                        {patient.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.active ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal bg-muted/50">Em dia</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
