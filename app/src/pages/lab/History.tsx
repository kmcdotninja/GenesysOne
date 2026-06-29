import { useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Card,
  DataTable,
  MineralIcon,
  SearchInput,
  StatusPill,
  type Column,
} from '@/components/ui'
import { useStore } from '@/store/AppStore'
import type { TestResult } from '@/data/types'

export function LabHistory() {
  const { testResults } = useStore()
  const [query, setQuery] = useState('')

  const rows = testResults.filter(
    (r) =>
      r.batchId.toLowerCase().includes(query.toLowerCase()) ||
      r.mineral.toLowerCase().includes(query.toLowerCase()),
  )

  const columns: Column<TestResult>[] = [
    {
      key: 'batch',
      header: 'Batch · Mineral',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={r.mineral} />
          <div>
            <p className="font-mono font-semibold text-forest">{r.batchId}</p>
            <p className="text-xs capitalize text-forest-400">{r.mineral}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Measured grade',
      align: 'right',
      cell: (r) => (
        <span className="tnum font-semibold text-forest">
          {r.status === 'rejected' ? '—' : `${r.gradeMeasured}%`}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      cell: (r) => <span className="uppercase text-forest-400">{r.method}</span>,
    },
    { key: 'signed', header: 'Signed by', cell: (r) => <span className="text-forest-500">{r.signedBy}</span> },
    { key: 'date', header: 'Date', align: 'right', cell: (r) => <span className="text-forest-400">{r.signedAt}</span> },
    { key: 'status', header: 'Status', align: 'center', cell: (r) => <StatusPill status={r.status} /> },
    {
      key: 'cert',
      header: '',
      align: 'right',
      cell: (r) => (
        <button
          disabled={r.status === 'rejected'}
          className="inline-flex items-center gap-1.5 rounded-xl border border-hair bg-white px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-panel disabled:opacity-40"
        >
          <Download size={14} />
          Certificate
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Test history"
        subtitle="Every completed assay with downloadable, signed certificates."
      />

      <div className="mb-4">
        <SearchInput
          placeholder="Search by Batch ID or Mineral…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          wrapClassName="max-w-md"
        />
      </div>

      <Card pad={false} className="p-2 sm:p-3">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
      </Card>
    </div>
  )
}
