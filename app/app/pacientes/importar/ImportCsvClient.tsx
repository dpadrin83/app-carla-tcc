'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { importPatients } from './actions'

const FIELDS = [
  { key: 'full_name', label: 'Nome completo *' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefone' },
  { key: 'birth_date', label: 'Data nascimento' },
]

export function ImportCsvClient() {
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function onFile(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const data = res.data as Record<string, string>[]
        setRows(data.slice(0, 1000))
        const h = res.meta.fields ?? []
        setHeaders(h)
        const saved = localStorage.getItem('atena_csv_mapping')
        if (saved) setMapping(JSON.parse(saved))
      },
      error: () => setResult('Arquivo corrompido ou inválido.'),
    })
  }

  async function runImport() {
    setLoading(true)
    localStorage.setItem('atena_csv_mapping', JSON.stringify(mapping))
    const r = await importPatients(rows, mapping)
    setResult(`Criados: ${r.created}, atualizados: ${r.updated}, ignorados: ${r.skipped}, erros: ${r.errors}`)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="text-sm"
      />

      {headers.length > 0 && (
        <>
          <div className="space-y-2">
            <h2 className="font-medium text-sm">Mapeamento de colunas</h2>
            {FIELDS.map((f) => (
              
              <div key={f.key} className="flex items-center gap-2 text-sm">
                <span className="w-40">{f.label}</span>
                <select
                  className="border rounded-lg px-2 py-1 flex-1"
                  value={mapping[f.key] ?? ''}
                  onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                >
                  <option value="">— ignorar —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {headers.map((h) => (
                    <th key={h} className="p-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b">
                    {headers.map((h) => (
                      <td key={h} className="p-2">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button onClick={runImport} disabled={loading || !mapping.full_name}>
            {loading ? 'Importando...' : `Confirmar importação (${rows.length} linhas)`}
          </Button>
        </>
      )}

      {result && <p className="text-sm bg-muted p-4 rounded-lg">{result}</p>}
    </div>
  )
}
