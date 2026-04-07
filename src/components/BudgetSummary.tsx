import { useState } from 'react'
import type { SchoolProject } from '@/stores/project-store'
import { useProjectStore } from '@/stores/project-store'
import { costoTotaleCorso, costoIndirettoCorso, fmtEur, MAX_PROGETTO, UCS_FORMATORE, UCS_TUTOR, QUOTA_INDIRETTI, COSTO_ORA_PERCORSO, COSTO_ORA_LABORATORIO } from '@/lib/costs'
import * as XLSX from 'xlsx'

interface Props {
  project: SchoolProject
}

export function BudgetSummary({ project }: Props) {
  const { courses, customCosts, schoolName, projectTitle } = project
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

  const totaleIndiretti = courses.reduce((s, c) => s + costoIndirettoCorso(c.type, c.hours), 0)
  const totaleCustomCosts = customCosts.reduce((s, c) => s + c.amount, 0)
  const montanteResiduo = Math.max(0, totaleIndiretti - totaleCustomCosts)

  const totale = totaleCorsi // il totale bando non cambia: è sempre diretti * 1.40
  const quotaLab = totale > 0 ? (totaleLaboratori / totale) * 100 : 0
  const percentUsed = (totale / MAX_PROGETTO) * 100

  const totaleOreP = percorsi.reduce((s, c) => s + c.hours, 0)
  const totaleOreL = laboratori.reduce((s, c) => s + c.hours, 0)
  const totaleAttestatiP = percorsi.reduce((s, c) => s + c.participants, 0)
  const totaleAttestatiL = laboratori.reduce((s, c) => s + c.participants, 0)

  const handleAddCustomCost = () => {
    const amount = parseFloat(newAmount)
    if (!newTitle.trim() || isNaN(amount) || amount <= 0) return
    addCustomCost(project.id, newTitle.trim(), amount)
    setNewTitle('')
    setNewAmount('')
  }

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()

    const riepilogo = [
      ['BUDGET PROGETTO DM 219/2025'],
      ['Scuola', schoolName],
      ['Progetto', projectTitle],
      ['Data export', new Date().toLocaleDateString('it-IT')],
      [],
      ['RIEPILOGO'],
      ['', 'Costo totale', 'Ore', 'Attestati'],
      ['Percorsi (P)', totalePercorsi, totaleOreP, totaleAttestatiP],
      ['Laboratori (L)', totaleLaboratori, totaleOreL, totaleAttestatiL],
      ['TOTALE CORSI', totaleCorsi, totaleOreP + totaleOreL, totaleAttestatiP + totaleAttestatiL],
      [],
      ['MONTANTE COSTI INDIRETTI (40%)'],
      ['Montante disponibile', totaleIndiretti],
    ]

    if (customCosts.length > 0) {
      riepilogo.push(['', ''])
      riepilogo.push(['Voci concordate:'])
      for (const c of customCosts) {
        riepilogo.push([c.title, c.amount])
      }
      riepilogo.push(['Totale voci concordate', totaleCustomCosts])
      riepilogo.push(['Montante residuo per la scuola', montanteResiduo])
    }

    riepilogo.push([])
    riepilogo.push(['Budget massimo', MAX_PROGETTO])
    riepilogo.push(['Residuo', MAX_PROGETTO - totale])
    riepilogo.push(['% utilizzato', percentUsed / 100])
    riepilogo.push(['% laboratori su totale', quotaLab / 100])

    const wsRiepilogo = XLSX.utils.aoa_to_sheet(riepilogo)
    wsRiepilogo['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 8 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, wsRiepilogo, 'Riepilogo')

    // Dettaglio corsi
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
    wsDettaglio['!cols'] = [
      { wch: 12 }, { wch: 16 }, { wch: 50 }, { wch: 6 }, { wch: 14 },
      { wch: 16 }, { wch: 12 }, { wch: 16 },
    ]
    XLSX.utils.book_append_sheet(wb, wsDettaglio, 'Dettaglio corsi')

    // Parametri UCS
    const parametri = [
      ['PARAMETRI UCS — Bando DM 219/2025'],
      [],
      ['Tipo attività', 'Costo totale/h (incl. 40% indiretti)'],
      ['Percorso (P) — Formatore + Tutor', COSTO_ORA_PERCORSO],
      ['Laboratorio (L) — Formatore', COSTO_ORA_LABORATORIO],
      [],
      ['Figura', 'Costo orario'],
      ['Formatore', UCS_FORMATORE],
      ['Tutor (solo Percorsi)', UCS_TUTOR],
      ['Quota costi indiretti', QUOTA_INDIRETTI],
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

    const fileName = `budget-${schoolName.replace(/\s+/g, '-').toLowerCase()}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-5">
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

      {/* Two columns: P and L */}
      <div className="grid grid-cols-2 gap-4">
        {/* Percorsi */}
        <div className="rounded-lg border border-area-2/20 bg-area-2/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-area-2">
              Percorsi (P)
            </span>
            <span className="text-xs text-muted-foreground">max 50%</span>
          </div>
          <div className="mt-2 text-xl font-bold">{fmtEur(totalePercorsi)}</div>
          <div className="mt-2 border-t border-border pt-1 flex justify-between text-xs font-medium text-foreground">
            <span>{percorsi.length} cors{percorsi.length === 1 ? 'o' : 'i'} · {totaleOreP}h</span>
            <span>{totaleAttestatiP} attestati</span>
          </div>
          {percorsi.map((c) => (
            <div key={c.id} className="mt-1.5 flex justify-between text-xs">
              <span className="truncate pr-2">{c.name}</span>
              <span className="shrink-0 font-mono">{fmtEur(costoTotaleCorso(c.type, c.hours))}</span>
            </div>
          ))}
        </div>

        {/* Laboratori */}
        <div className="rounded-lg border border-area-3/20 bg-area-3/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-area-3">
              Laboratori (L)
            </span>
            <span className={`text-xs font-medium ${quotaLab >= 50 ? 'text-success' : 'text-danger'}`}>
              {quotaLab.toFixed(1)}% (min 50%)
            </span>
          </div>
          <div className="mt-2 text-xl font-bold">{fmtEur(totaleLaboratori)}</div>
          <div className="mt-2 border-t border-border pt-1 flex justify-between text-xs font-medium text-foreground">
            <span>{laboratori.length} cors{laboratori.length === 1 ? 'o' : 'i'} · {totaleOreL}h</span>
            <span>{totaleAttestatiL} attestati</span>
          </div>
          {laboratori.map((c) => (
            <div key={c.id} className="mt-1.5 flex justify-between text-xs">
              <span className="truncate pr-2">{c.name}</span>
              <span className="shrink-0 font-mono">{fmtEur(costoTotaleCorso(c.type, c.hours))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Montante costi indiretti */}
      {totaleIndiretti > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Montante costi indiretti (40%)
              </span>
              <span className="text-lg font-bold">{fmtEur(totaleIndiretti)}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Budget riconosciuto dal bando come 40% dei costi diretti. La scuola lo gestisce autonomamente (trasferte, materiali, organizzazione, licenze, ecc.).
            </p>
          </div>

          {/* Custom cost items */}
          {customCosts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Voci concordate con la scuola:</span>
              {customCosts.map((cost) => (
                <div key={cost.id} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
                  <input
                    type="text"
                    value={cost.title}
                    onChange={(e) => updateCustomCost(project.id, cost.id, { title: e.target.value })}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">€</span>
                    <input
                      type="number"
                      value={cost.amount}
                      onChange={(e) => updateCustomCost(project.id, cost.id, { amount: Math.max(0, Number(e.target.value)) })}
                      min={0}
                      step={100}
                      className="w-24 bg-transparent text-right text-sm font-mono outline-none"
                    />
                  </div>
                  <button
                    onClick={() => removeCustomCost(project.id, cost.id)}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:text-danger hover:bg-danger/10"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="flex justify-between text-xs pt-1">
                <span className="text-muted-foreground">Totale voci concordate</span>
                <span className="font-mono font-medium">{fmtEur(totaleCustomCosts)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Montante residuo per la scuola</span>
                <span className={`font-mono font-medium ${montanteResiduo <= 0 ? 'text-danger' : ''}`}>
                  {fmtEur(montanteResiduo)}
                </span>
              </div>
            </div>
          )}

          {/* Add new custom cost */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Es. Trasferte formatore, Materiali..."
                className="w-full rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCost()}
              />
            </div>
            <div className="w-28">
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Importo €"
                min={0}
                step={100}
                className="w-full rounded-md border border-border px-2.5 py-1.5 text-sm text-right outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCost()}
              />
            </div>
            <button
              onClick={handleAddCustomCost}
              className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Aggiungi voce
            </button>
          </div>
        </div>
      )}

      {/* UCS reference */}
      <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">UCS di riferimento:</span>{' '}
        Percorso (P) = {fmtEur(COSTO_ORA_PERCORSO)}/h (formatore + tutor + 40% indiretti){' '}
        | Laboratorio (L) = {fmtEur(COSTO_ORA_LABORATORIO)}/h (formatore + 40% indiretti)
      </div>
    </div>
  )
}
