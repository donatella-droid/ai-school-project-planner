import { useState } from 'react'
import type { SchoolProject } from '@/stores/project-store'
import { useProjectStore } from '@/stores/project-store'
import { costoTotaleCorso, costoIndirettoCorso, fmtEur, MAX_PROGETTO, COSTO_ORA_PERCORSO, COSTO_ORA_LABORATORIO } from '@/lib/costs'
import { validateProject } from '@/lib/validation'
import { FEM_PRODUCTS } from '@/lib/fem-products'
import * as XLSX from 'xlsx'

interface Props {
  project: SchoolProject
}

const IVA_RATE = 0.22

export function BudgetSummary({ project }: Props) {
  const { courses, customCosts, technologies, schoolName, projectTitle } = project
  const addCustomCost = useProjectStore((s) => s.addCustomCost)
  const updateCustomCost = useProjectStore((s) => s.updateCustomCost)
  const removeCustomCost = useProjectStore((s) => s.removeCustomCost)

  const [newTitle, setNewTitle] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const percorsi = courses.filter((c) => c.type === 'P')
  const laboratori = courses.filter((c) => c.type === 'L')

  const totalePercorsi = percorsi.reduce((s, c) => s + costoTotaleCorso(c.type, c.hours), 0)
  const totaleLaboratori = laboratori.reduce((s, c) => s + costoTotaleCorso(c.type, c.hours), 0)
  const totaleCorsi = totalePercorsi + totaleLaboratori
  const totaleCustomCosts = customCosts.reduce((s, c) => s + c.amount, 0)

  const totale = totaleCorsi
  const quotaLab = totale > 0 ? (totaleLaboratori / totale) * 100 : 0
  const percentUsed = (totale / MAX_PROGETTO) * 100

  const totaleOreP = percorsi.reduce((s, c) => s + c.hours, 0)
  const totaleOreL = laboratori.reduce((s, c) => s + c.hours, 0)
  const totaleAttestatiP = percorsi.reduce((s, c) => s + c.participants, 0)
  const totaleAttestatiL = laboratori.reduce((s, c) => s + c.participants, 0)

  // FEM tech with prices
  const femTechNames = new Set(FEM_PRODUCTS.map((p) => p.name))
  const includedFemTech = technologies.filter(
    (t) => t.included && t.category === 'platform-fem' && femTechNames.has(t.name)
  )
  const femTechWithPrices = includedFemTech.map((t) => {
    const product = FEM_PRODUCTS.find((p) => p.name === t.name)
    return { name: t.name, price: product?.price ?? 0, priceLabel: product?.priceLabel ?? '' }
  })
  const totaleTechIvato = femTechWithPrices.reduce((s, t) => s + t.price, 0)
  const totaleTechImponibile = totaleTechIvato / (1 + IVA_RATE)

  const handleAddCustomCost = () => {
    const amount = parseFloat(newAmount)
    if (!newTitle.trim() || isNaN(amount) || amount <= 0) return
    addCustomCost(project.id, newTitle.trim(), amount)
    setNewTitle('')
    setNewAmount('')
  }

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()

    const riepilogo: (string | number)[][] = [
      ['BUDGET PROGETTO DM 219/2025'],
      ['Scuola', schoolName],
      ['Progetto', projectTitle],
      ['Data export', new Date().toLocaleDateString('it-IT')],
      [],
      ['RIEPILOGO CORSI'],
      ['', 'Costo UCS', 'Ore', 'Attestati'],
      ['Percorsi (P)', totalePercorsi, totaleOreP, totaleAttestatiP],
      ['Laboratori (L)', totaleLaboratori, totaleOreL, totaleAttestatiL],
      ['TOTALE CORSI', totaleCorsi, totaleOreP + totaleOreL, totaleAttestatiP + totaleAttestatiL],
    ]

    if (customCosts.length > 0) {
      riepilogo.push([])
      riepilogo.push(['VOCI AGGIUNTIVE CONCORDATE'])
      for (const c of customCosts) {
        riepilogo.push([c.title, c.amount])
      }
      riepilogo.push(['Totale voci aggiuntive', totaleCustomCosts])
    }

    riepilogo.push([])
    riepilogo.push(['Budget massimo bando', MAX_PROGETTO])
    riepilogo.push(['Residuo', MAX_PROGETTO - totale])
    riepilogo.push(['% laboratori su totale', quotaLab / 100])

    const wsRiepilogo = XLSX.utils.aoa_to_sheet(riepilogo)
    wsRiepilogo['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 8 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, wsRiepilogo, 'Riepilogo')

    const header = ['Tipo', 'Codice', 'Nome corso', 'Ore', 'Partecipanti', 'Form. formatori', 'Costo/h', 'Costo totale']
    const rows = courses.map((c) => [
      c.type === 'P' ? 'Percorso' : 'Laboratorio',
      c.catalogId ?? 'Personalizzato',
      c.name,
      c.hours,
      c.participants,
      c.isFormazioneFormatori ? 'Sì' : 'No',
      c.type === 'P' ? COSTO_ORA_PERCORSO : COSTO_ORA_LABORATORIO,
      costoTotaleCorso(c.type, c.hours),
    ])
    const dettaglio = [header, ...rows]
    const wsDettaglio = XLSX.utils.aoa_to_sheet(dettaglio)
    wsDettaglio['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 50 }, { wch: 6 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, wsDettaglio, 'Dettaglio corsi')

    const parametri = [
      ['PARAMETRI UCS — Bando DM 219/2025'],
      [],
      ['Tipo attività', 'Costo UCS/h'],
      ['Percorso (P) — Formatore + Tutor', COSTO_ORA_PERCORSO],
      ['Laboratorio (L) — Formatore', COSTO_ORA_LABORATORIO],
      [],
      ['Budget massimo progetto', MAX_PROGETTO],
      ['Quota minima laboratori', '50%'],
      ['Min. partecipanti Percorso', 10],
      ['Min. partecipanti Laboratorio', 5],
      ['Min. attestati totali', 50],
    ]
    const wsParametri = XLSX.utils.aoa_to_sheet(parametri)
    wsParametri['!cols'] = [{ wch: 38 }, { wch: 28 }]
    XLSX.utils.book_append_sheet(wb, wsParametri, 'Parametri UCS')

    XLSX.writeFile(wb, `budget-${schoolName.replace(/\s+/g, '-').toLowerCase()}.xlsx`)
  }

  return (
    <div className="space-y-4">
      {/* ── Top: Progress + P/L + Tech ── */}
      <div className="rounded-xl border border-border bg-background p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Riepilogo Budget Complessivo</h3>
          <button
            onClick={handleExportExcel}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Esporta Excel
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-2xl font-bold">{fmtEur(totale)}</span>
            <span className="text-muted-foreground">su {fmtEur(MAX_PROGETTO)}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentUsed > 100 ? 'bg-danger' : percentUsed > 90 ? 'bg-warning' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{percentUsed.toFixed(1)}% utilizzato</span>
            <span>Residuo: {fmtEur(Math.max(0, MAX_PROGETTO - totale))}</span>
          </div>
        </div>

        {/* Three boxes: P, L, Tech */}
        <div className="grid grid-cols-3 gap-3">
          {/* Percorsi */}
          <div className="rounded-lg border border-area-2/20 bg-area-2/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-area-2">Percorsi (P)</span>
              <span className="text-[10px] text-muted-foreground">max 50%</span>
            </div>
            <div className="mt-1 text-lg font-bold">{fmtEur(totalePercorsi)}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {percorsi.length} cors{percorsi.length === 1 ? 'o' : 'i'} · {totaleOreP}h · {totaleAttestatiP} att.
            </div>
          </div>

          {/* Laboratori */}
          <div className="rounded-lg border border-area-3/20 bg-area-3/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-area-3">Laboratori (L)</span>
              <span className={`text-[10px] font-medium ${quotaLab >= 50 ? 'text-success' : 'text-danger'}`}>
                {quotaLab.toFixed(0)}%
              </span>
            </div>
            <div className="mt-1 text-lg font-bold">{fmtEur(totaleLaboratori)}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {laboratori.length} cors{laboratori.length === 1 ? 'o' : 'i'} · {totaleOreL}h · {totaleAttestatiL} att.
            </div>
          </div>

          {/* Tecnologie */}
          <div className="rounded-lg border border-area-4/20 bg-area-4/5 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-area-4">Tecnologie FEM</span>
            <div className="mt-1 text-lg font-bold">
              {femTechWithPrices.length > 0 ? fmtEur(totaleTechImponibile) : '—'}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {femTechWithPrices.length > 0
                ? femTechWithPrices.map((t) => t.name).join(', ')
                : 'Nessuna piattaforma'}
            </div>
          </div>
        </div>

        {/* Voci aggiuntive */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Voci aggiuntive concordate</span>

          {customCosts.length > 0 && (
            <div className="space-y-1">
              {customCosts.map((cost) => (
                <div key={cost.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1">
                  <input
                    type="text"
                    value={cost.title}
                    onChange={(e) => updateCustomCost(project.id, cost.id, { title: e.target.value })}
                    className="flex-1 bg-transparent text-xs outline-none"
                  />
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-muted-foreground">€</span>
                    <input
                      type="number"
                      value={cost.amount}
                      onChange={(e) => updateCustomCost(project.id, cost.id, { amount: Math.max(0, Number(e.target.value)) })}
                      min={0}
                      step={100}
                      className="w-20 bg-transparent text-right text-xs font-mono outline-none"
                    />
                  </div>
                  <button
                    onClick={() => removeCustomCost(project.id, cost.id)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-danger"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="flex justify-between text-[11px] text-muted-foreground px-1">
                <span>Totale voci</span>
                <span className="font-mono font-medium text-foreground">{fmtEur(totaleCustomCosts)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-1.5 items-center">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Es. Trasferte, Materiali..."
              className="flex-1 rounded-md border border-border px-2 py-1 text-xs outline-none focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCost()}
            />
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="€"
              min={0}
              step={100}
              className="w-20 rounded-md border border-border px-2 py-1 text-xs text-right outline-none focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCost()}
            />
            <button
              onClick={handleAddCustomCost}
              className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Aggiungi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Compact Validation ── */
export function ValidationCompact({ courses }: { courses: SchoolProject['courses'] }) {
  const results = validateProject(courses)
  const failed = results.filter((r) => !r.passed)
  const allPassed = failed.length === 0

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold">Vincoli del bando</span>
        {courses.length > 0 && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            allPassed ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            {allPassed ? 'OK' : `${failed.length} da risolvere`}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {results.map((r) => (
          <div key={r.id} className="flex items-center gap-1.5 text-[11px]">
            <span className="text-xs leading-none">{r.passed ? '\u2705' : '\u274C'}</span>
            <span className={r.passed ? 'text-muted-foreground' : 'text-danger font-medium'}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Indirect costs info ── */
export function IndirectCostsInfo({ courses }: { courses: SchoolProject['courses'] }) {
  const totaleIndiretti = courses.reduce((s, c) => s + costoIndirettoCorso(c.type, c.hours), 0)

  if (totaleIndiretti <= 0) return null

  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Costi indiretti maturati con questi corsi</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            40% dei costi diretti, riconosciuto automaticamente dal bando. Gestito dalla scuola.
          </p>
        </div>
        <span className="text-lg font-bold text-muted-foreground">{fmtEur(totaleIndiretti)}</span>
      </div>
    </div>
  )
}
