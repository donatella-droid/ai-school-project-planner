import type { ProjectCourse } from '@/stores/project-store'
import { costoTotaleCorso, costoDirettoCorso, costoIndirettoCorso, fmtEur, MAX_PROGETTO, UCS_FORMATORE, UCS_TUTOR, QUOTA_INDIRETTI } from '@/lib/costs'
import * as XLSX from 'xlsx'

interface Props {
  courses: ProjectCourse[]
  schoolName: string
  projectTitle: string
}

export function BudgetSummary({ courses, schoolName, projectTitle }: Props) {
  const percorsi = courses.filter((c) => c.type === 'P')
  const laboratori = courses.filter((c) => c.type === 'L')

  const totalePercorsi = percorsi.reduce((s, c) => s + costoTotaleCorso(c.type, c.hours), 0)
  const totaleLaboratori = laboratori.reduce((s, c) => s + costoTotaleCorso(c.type, c.hours), 0)
  const totale = totalePercorsi + totaleLaboratori

  const direttiPercorsi = percorsi.reduce((s, c) => s + costoDirettoCorso(c.type, c.hours), 0)
  const direttiLab = laboratori.reduce((s, c) => s + costoDirettoCorso(c.type, c.hours), 0)
  const indirettiPercorsi = percorsi.reduce((s, c) => s + costoIndirettoCorso(c.type, c.hours), 0)
  const indirettiLab = laboratori.reduce((s, c) => s + costoIndirettoCorso(c.type, c.hours), 0)

  const quotaLab = totale > 0 ? (totaleLaboratori / totale) * 100 : 0
  const percentUsed = (totale / MAX_PROGETTO) * 100

  const totaleOreP = percorsi.reduce((s, c) => s + c.hours, 0)
  const totaleOreL = laboratori.reduce((s, c) => s + c.hours, 0)
  const totaleAttestatiP = percorsi.reduce((s, c) => s + c.participants, 0)
  const totaleAttestatiL = laboratori.reduce((s, c) => s + c.participants, 0)

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()

    // --- Sheet 1: Riepilogo ---
    const riepilogo = [
      ['BUDGET PROGETTO DM 219/2025'],
      ['Scuola', schoolName],
      ['Progetto', projectTitle],
      ['Data export', new Date().toLocaleDateString('it-IT')],
      [],
      ['RIEPILOGO'],
      ['', 'Costi diretti', 'Costi indiretti (40%)', 'Totale', 'Ore', 'Attestati'],
      ['Percorsi (P)', direttiPercorsi, indirettiPercorsi, totalePercorsi, totaleOreP, totaleAttestatiP],
      ['Laboratori (L)', direttiLab, indirettiLab, totaleLaboratori, totaleOreL, totaleAttestatiL],
      ['TOTALE', direttiPercorsi + direttiLab, indirettiPercorsi + indirettiLab, totale, totaleOreP + totaleOreL, totaleAttestatiP + totaleAttestatiL],
      [],
      ['Budget massimo', MAX_PROGETTO],
      ['Residuo', MAX_PROGETTO - totale],
      ['% utilizzato', percentUsed / 100],
      ['% laboratori su totale', quotaLab / 100],
    ]
    const wsRiepilogo = XLSX.utils.aoa_to_sheet(riepilogo)
    wsRiepilogo['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 8 }, { wch: 10 }]
    // Format currency cells
    const currencyFmt = '#.##0,00 €'
    for (let r = 7; r <= 9; r++) {
      for (let c = 1; c <= 3; c++) {
        const cell = XLSX.utils.encode_cell({ r, c })
        if (wsRiepilogo[cell]) wsRiepilogo[cell].z = currencyFmt
      }
    }
    for (const r of [11, 12]) {
      const cell = XLSX.utils.encode_cell({ r, c: 1 })
      if (wsRiepilogo[cell]) wsRiepilogo[cell].z = currencyFmt
    }
    for (const r of [13, 14]) {
      const cell = XLSX.utils.encode_cell({ r, c: 1 })
      if (wsRiepilogo[cell]) wsRiepilogo[cell].z = '0,0%'
    }
    XLSX.utils.book_append_sheet(wb, wsRiepilogo, 'Riepilogo')

    // --- Sheet 2: Dettaglio corsi ---
    const header = ['Tipo', 'Codice', 'Nome corso', 'Ore', 'Partecipanti', 'Form. formatori', 'Costo formatore/h', 'Costo tutor/h', 'Costi diretti', 'Costi indiretti (40%)', 'Costo totale']
    const rows = courses.map((c) => [
      c.type === 'P' ? 'Percorso' : 'Laboratorio',
      c.catalogId ?? 'Personalizzato',
      c.name,
      c.hours,
      c.participants,
      c.isFormazioneFormatori ? 'Sì' : 'No',
      UCS_FORMATORE,
      c.type === 'P' ? UCS_TUTOR : 0,
      costoDirettoCorso(c.type, c.hours),
      costoIndirettoCorso(c.type, c.hours),
      costoTotaleCorso(c.type, c.hours),
    ])

    const dettaglio = [header, ...rows]
    const wsDettaglio = XLSX.utils.aoa_to_sheet(dettaglio)
    wsDettaglio['!cols'] = [
      { wch: 12 }, { wch: 16 }, { wch: 50 }, { wch: 6 }, { wch: 14 },
      { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 16 },
    ]
    XLSX.utils.book_append_sheet(wb, wsDettaglio, 'Dettaglio corsi')

    // --- Sheet 3: Parametri UCS ---
    const parametri = [
      ['PARAMETRI UCS — Bando DM 219/2025'],
      [],
      ['Figura', 'Costo orario'],
      ['Formatore', UCS_FORMATORE],
      ['Tutor (solo Percorsi)', UCS_TUTOR],
      [],
      ['Quota costi indiretti', QUOTA_INDIRETTI],
      [],
      ['Tipo attività', 'Costo diretto/h', 'Costi indiretti/h', 'Costo totale/h'],
      ['Percorso (P)', UCS_FORMATORE + UCS_TUTOR, (UCS_FORMATORE + UCS_TUTOR) * QUOTA_INDIRETTI, (UCS_FORMATORE + UCS_TUTOR) * (1 + QUOTA_INDIRETTI)],
      ['Laboratorio (L)', UCS_FORMATORE, UCS_FORMATORE * QUOTA_INDIRETTI, UCS_FORMATORE * (1 + QUOTA_INDIRETTI)],
      [],
      ['Budget massimo progetto', MAX_PROGETTO],
      ['Quota minima laboratori', '50%'],
      ['Min. partecipanti Percorso', 10],
      ['Min. partecipanti Laboratorio', 5],
      ['Min. attestati totali', 50],
    ]
    const wsParametri = XLSX.utils.aoa_to_sheet(parametri)
    wsParametri['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
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

      {/* Two columns */}
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
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Costi diretti</span>
              <span>{fmtEur(direttiPercorsi)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costi indiretti (40%)</span>
              <span>{fmtEur(indirettiPercorsi)}</span>
            </div>
            <div className="border-t border-border pt-1 flex justify-between font-medium text-foreground">
              <span>{percorsi.length} cors{percorsi.length === 1 ? 'o' : 'i'} · {totaleOreP}h</span>
              <span>{totaleAttestatiP} attestati</span>
            </div>
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
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Costi diretti</span>
              <span>{fmtEur(direttiLab)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costi indiretti (40%)</span>
              <span>{fmtEur(indirettiLab)}</span>
            </div>
            <div className="border-t border-border pt-1 flex justify-between font-medium text-foreground">
              <span>{laboratori.length} cors{laboratori.length === 1 ? 'o' : 'i'} · {totaleOreL}h</span>
              <span>{totaleAttestatiL} attestati</span>
            </div>
          </div>
          {laboratori.map((c) => (
            <div key={c.id} className="mt-1.5 flex justify-between text-xs">
              <span className="truncate pr-2">{c.name}</span>
              <span className="shrink-0 font-mono">{fmtEur(costoTotaleCorso(c.type, c.hours))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* UCS reference */}
      <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">UCS di riferimento:</span>{' '}
        Percorso (P) = Formatore {fmtEur(122)}/h + Tutor {fmtEur(34)}/h + 40% indiretti = <strong>{fmtEur(218.40)}/h</strong>{' '}
        | Laboratorio (L) = Formatore {fmtEur(122)}/h + 40% indiretti = <strong>{fmtEur(170.80)}/h</strong>
      </div>
    </div>
  )
}
