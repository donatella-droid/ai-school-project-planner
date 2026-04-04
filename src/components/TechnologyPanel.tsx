import { useState } from 'react'
import { useProjectStore, type SchoolProject } from '@/stores/project-store'
import { costoIndirettoCorso, fmtEur } from '@/lib/costs'
import { FEM_PRODUCTS, type FemProduct } from '@/lib/fem-products'

interface Props {
  project: SchoolProject
}

export function TechnologyPanel({ project }: Props) {
  const addTechnology = useProjectStore((s) => s.addTechnology)
  const removeTechnology = useProjectStore((s) => s.removeTechnology)
  const toggleTechnology = useProjectStore((s) => s.toggleTechnology)
  const updateIndirectCosts = useProjectStore((s) => s.updateIndirectCosts)

  const [customName, setCustomName] = useState('')
  const [customDesc, setCustomDesc] = useState('')

  // Calculate indirect costs total
  const totaleIndiretti = project.courses.reduce(
    (sum, c) => sum + costoIndirettoCorso(c.type, c.hours), 0
  )

  const { softwarePercent, organizationPercent, materialsPercent } = project.indirectCosts
  const totalPercent = softwarePercent + organizationPercent + materialsPercent

  const existingNames = new Set(project.technologies.map((t) => t.name))
  const includedTech = project.technologies.filter((t) => t.included)

  const handleAddFemProduct = (product: FemProduct) => {
    addTechnology(project.id, {
      name: product.name,
      category: 'platform-fem',
      description: `${product.description} — ${product.priceLabel}`,
      included: true,
    })
  }

  const handleAddCustom = () => {
    if (!customName.trim()) return
    addTechnology(project.id, {
      name: customName.trim(),
      category: 'other',
      description: customDesc.trim(),
      included: true,
    })
    setCustomName('')
    setCustomDesc('')
  }

  const handlePercentChange = (field: keyof typeof project.indirectCosts, value: number) => {
    updateIndirectCosts(project.id, {
      ...project.indirectCosts,
      [field]: Math.max(0, Math.min(100, value)),
    })
  }

  const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
    'platform-fem': { label: 'Piattaforma FEM', color: 'bg-area-4/10 text-area-4' },
    'other': { label: 'Altro', color: 'bg-muted text-muted-foreground' },
  }

  return (
    <div className="space-y-4">
      {/* Piattaforme FEM */}
      <div className="rounded-xl border border-border bg-background p-5">
        <h3 className="text-sm font-semibold">Piattaforme FEM</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Piattaforme AI proprietarie FEM, validate pedagogicamente e testate sul campo.
          Le licenze rientrano nei costi indiretti (40%) del progetto.
        </p>

        <div className="mt-3 space-y-2">
          {FEM_PRODUCTS.map((product) => {
            const alreadyAdded = existingNames.has(product.name)
            return (
              <div
                key={product.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  alreadyAdded ? 'border-success/30 bg-success/5' : 'border-border hover:border-primary/30'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-area-4/10 px-1.5 py-0.5 text-[10px] font-bold text-area-4">
                      Piattaforma FEM
                    </span>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{product.description}</p>
                  <p className="mt-0.5 text-xs font-semibold">{product.priceLabel}</p>
                </div>
                {alreadyAdded ? (
                  <span className="shrink-0 rounded bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    Aggiunto
                  </span>
                ) : (
                  <button
                    onClick={() => handleAddFemProduct(product)}
                    className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    + Aggiungi
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Other software */}
      <div className="rounded-xl border border-border bg-background p-5">
        <h3 className="text-sm font-semibold">Altre tecnologie e software</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Aggiungi altri software e applicativi AI che la scuola prevede di utilizzare.
          Queste informazioni servono per compilare il Campo 5 della scheda ministeriale.
        </p>

        {/* Current technologies list */}
        {project.technologies.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {project.technologies.map((tech) => (
              <div
                key={tech.id}
                className={`flex items-center gap-3 rounded-lg border p-2.5 text-sm ${
                  tech.included ? 'border-primary/20 bg-primary/5' : 'border-border opacity-60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={tech.included}
                  onChange={() => toggleTechnology(project.id, tech.id)}
                  className="rounded"
                />
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  (CATEGORY_STYLES[tech.category] ?? CATEGORY_STYLES['other']).color
                }`}>
                  {(CATEGORY_STYLES[tech.category] ?? CATEGORY_STYLES['other']).label}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{tech.name}</span>
                  {tech.description && (
                    <span className="ml-1.5 text-xs text-muted-foreground">— {tech.description}</span>
                  )}
                </div>
                <button
                  onClick={() => removeTechnology(project.id, tech.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-danger hover:bg-danger/10"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add custom technology */}
        <div className="mt-3 flex gap-2 items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Nome</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Es. ChatGPT, Canva AI, Scratch..."
              className="w-full rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Descrizione (opzionale)</label>
            <input
              type="text"
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Es. AI generativa per la didattica"
              className="w-full rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            />
          </div>
          <button
            onClick={handleAddCustom}
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Aggiungi
          </button>
        </div>
      </div>

      {/* Indirect Costs Allocation */}
      <div className="rounded-xl border border-border bg-background p-5">
        <h3 className="text-sm font-semibold">Pianificazione Costi Indiretti (40%)</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Il 40% dei costi diretti viene riconosciuto automaticamente dalla piattaforma come costi indiretti.
          Non serve giustificazione analitica, ma è utile pianificare come allocarli internamente.
        </p>

        {totaleIndiretti > 0 ? (
          <>
            <div className="mt-3 text-lg font-bold">
              {fmtEur(totaleIndiretti)} <span className="text-sm font-normal text-muted-foreground">di costi indiretti disponibili</span>
            </div>

            <div className="mt-4 space-y-3">
              <AllocationRow
                label="Licenze software e applicativi AI"
                description={`Licenze per ${includedTech.length > 0 ? includedTech.map(t => t.name).join(', ') : 'piattaforme AI'}`}
                percent={softwarePercent}
                total={totaleIndiretti}
                onChange={(v) => handlePercentChange('softwarePercent', v)}
                color="bg-area-1"
              />
              <AllocationRow
                label="Organizzazione e gestione"
                description="Coordinamento, segreteria, comunicazione, logistica"
                percent={organizationPercent}
                total={totaleIndiretti}
                onChange={(v) => handlePercentChange('organizationPercent', v)}
                color="bg-area-3"
              />
              <AllocationRow
                label="Materiali didattici"
                description="Materiali, stampa, risorse digitali"
                percent={materialsPercent}
                total={totaleIndiretti}
                onChange={(v) => handlePercentChange('materialsPercent', v)}
                color="bg-area-4"
              />
            </div>

            {totalPercent !== 100 && (
              <div className="mt-2 rounded-md bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
                Le percentuali sommano a {totalPercent}% — dovrebbero essere 100%
              </div>
            )}
          </>
        ) : (
          <div className="mt-3 text-xs text-muted-foreground">
            Aggiungi corsi al progetto per calcolare i costi indiretti disponibili.
          </div>
        )}
      </div>
    </div>
  )
}

function AllocationRow({
  label,
  description,
  percent,
  total,
  onChange,
  color,
}: {
  label: string
  description: string
  percent: number
  total: number
  onChange: (value: number) => void
  color: string
}) {
  const amount = total * (percent / 100)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">{label}</span>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={percent}
            onChange={(e) => onChange(Number(e.target.value))}
            min={0}
            max={100}
            className="w-14 rounded-md border border-border px-2 py-1 text-right text-sm outline-none focus:border-primary"
          />
          <span className="text-xs text-muted-foreground">%</span>
          <span className="w-24 text-right text-sm font-medium">{fmtEur(amount)}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}
