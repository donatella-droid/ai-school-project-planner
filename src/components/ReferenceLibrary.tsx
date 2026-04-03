import { REFERENCES } from '@/lib/references'

export function ReferenceLibrary() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-5">
        <h3 className="text-sm font-semibold">Riferimenti Normativi e Framework</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Documentazione di riferimento richiamata dal bando DM 219/2025. Clicca per accedere al documento completo.
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
