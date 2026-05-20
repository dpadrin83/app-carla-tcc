import Link from 'next/link'
import { ImportCsvClient } from './ImportCsvClient'

export default function ImportarPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/app/pacientes" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar para pacientes
      </Link>
      <h1 className="text-2xl font-semibold">Importar pacientes (CSV)</h1>
      <p className="text-sm text-muted-foreground">
        Importação única do Consultório Psi. Não importamos prontuário/sessões neste MVP — apenas cadastro.
      </p>
      <ImportCsvClient />
    
    </div>
  )
}
