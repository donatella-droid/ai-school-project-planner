import type { ProjectCourse } from '@/stores/project-store'
import { costoTotaleCorso, costoDirettoCorso, costoIndirettoCorso, fmtEur, MAX_PROGETTO } from '@/lib/costs'

interface Props {
  courses: ProjectCourse[]
}

export function BudgetSummary({ courses }: Props) {
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

  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-5">
      <h3 className="text-sm font-semibold">Riepilogo Budget</h3>

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
