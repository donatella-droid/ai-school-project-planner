import { REFERENCES } from '@/lib/references'
import { CATALOG, AREA_NAMES } from '@/lib/catalog'
import { FEM_PRODUCTS } from '@/lib/fem-products'
import * as XLSX from 'xlsx'

function exportCatalog() {
  const wb = XLSX.utils.book_new()

  const corsi = CATALOG.map((c) => ({
    Codice: c.code,
    Area: `${c.area} — ${AREA_NAMES[c.area]}`,
    'Tipologia ammessa': c.allowedTypes,
    'Ore default': c.defaultHours,
    Target: c.target,
    Nome: c.name,
    Abstract: c.abstract,
  }))
  const wsCorsi = XLSX.utils.json_to_sheet(corsi)
  wsCorsi['!cols'] = [{ wch: 14 }, { wch: 55 }, { wch: 18 }, { wch: 12 }, { wch: 35 }, { wch: 80 }, { wch: 120 }]
  XLSX.utils.book_append_sheet(wb, wsCorsi, 'Corsi a catalogo')

  const licenze = FEM_PRODUCTS.map((p) => ({
    Codice: p.code,
    Nome: p.name,
    Descrizione: p.description,
    'Prezzo (IVA inclusa)': p.price,
  }))
  const wsLicenze = XLSX.utils.json_to_sheet(licenze)
  wsLicenze['!cols'] = [{ wch: 18 }, { wch: 35 }, { wch: 60 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsLicenze, 'Licenze edtech')

  XLSX.writeFile(wb, 'Catalogo-FEM-DM219.xlsx')
}

export function ReferenceLibrary() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Riferimenti Normativi e Framework</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Documentazione di riferimento richiamata dal bando DM 219/2025. Clicca per accedere al documento completo.
            </p>
          </div>
          <button
            onClick={exportCatalog}
            className="shrink-0 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Scarica catalogo (Excel)
          </button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          L'export contiene tutti i corsi del catalogo formativo con codice e tipologia, e le licenze edtech disponibili (LINDA, AI for Learning).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {REFERENCES.map((ref) => (
          <a
            key={ref.id}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                {getIssuerIcon(ref.issuer)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {ref.shortTitle}
                </h4>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  {ref.issuer} · {ref.year}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
              {ref.description}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Apri documento
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function getIssuerIcon(issuer: string): string {
  if (issuer.includes('MIM')) return 'MIM'
  if (issuer.includes('European') || issuer.includes('JRC')) return 'EU'
  if (issuer.includes('Unione Europea')) return 'UE'
  if (issuer.includes('UNESCO')) return 'UN'
  if (issuer.includes('OECD')) return 'OE'
  if (issuer.includes('Parlamento')) return 'IT'
  return issuer.substring(0, 2).toUpperCase()
}
