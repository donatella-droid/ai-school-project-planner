import { useProjectStore, type ProjectCourse } from '@/stores/project-store'
import { costoTotaleCorso, fmtEur, COSTO_ORA_PERCORSO, COSTO_ORA_LABORATORIO } from '@/lib/costs'
import { CATALOG } from '@/lib/catalog'

interface Props {
  course: ProjectCourse
  projectId: string
  onRemove: () => void
}

export function CourseCard({ course, projectId, onRemove }: Props) {
  const updateCourse = useProjectStore((s) => s.updateCourse)
  const total = costoTotaleCorso(course.type, course.hours)
  const costoOra = course.type === 'P' ? COSTO_ORA_PERCORSO : COSTO_ORA_LABORATORIO

  const update = (updates: Partial<Omit<ProjectCourse, 'id'>>) => {
    updateCourse(projectId, course.id, updates)
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
              course.type === 'P'
                ? 'bg-area-2/10 text-area-2'
                : 'bg-area-3/10 text-area-3'
            }`}>
              {course.type === 'P' ? 'PERCORSO' : 'LABORATORIO'}
            </span>
            {course.catalogId && (
              <span className="text-xs font-mono text-muted-foreground">{course.catalogId}</span>
            )}
            {!course.catalogId && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                altro corso
              </span>
            )}
            {course.isFormazioneFormatori && (
              <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                FORMAZIONE FORMATORI
              </span>
            )}
          </div>
          <h4 className="mt-1 text-sm font-medium">{course.name}</h4>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{fmtEur(total)}</div>
          <div className="text-[10px] text-muted-foreground">
            {course.hours}h × {fmtEur(costoOra)}/h
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-0.5 block text-[10px] text-muted-foreground">Ore</label>
          {course.catalogId ? (
            (() => {
              const defaultH = CATALOG.find(c => c.id === course.catalogId)?.defaultHours ?? course.hours
              const minH = Math.max(1, defaultH - 2)
              const maxH = defaultH + 3
              return (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={course.hours}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      update({ hours: Math.max(minH, Math.min(maxH, v)) })
                    }}
                    min={minH}
                    max={maxH}
                    className="w-16 rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-primary"
                  />
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                    {minH}–{maxH}h
                  </span>
                </div>
              )
            })()
          ) : (
            <input
              type="number"
              value={course.hours}
              onChange={(e) => update({ hours: Math.max(1, Number(e.target.value)) })}
              min={1}
              className="w-16 rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-primary"
            />
          )}
        </div>
        <div>
          <label className="mb-0.5 block text-[10px] text-muted-foreground">Partecipanti</label>
          <input
            type="number"
            value={course.participants}
            onChange={(e) => update({ participants: Math.max(1, Number(e.target.value)) })}
            min={1}
            className="w-16 rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[10px] text-muted-foreground">Tipo</label>
          <select
            value={course.type}
            onChange={(e) => {
              const newType = e.target.value as 'P' | 'L'
              update({ type: newType, ...(newType === 'L' ? { isFormazioneFormatori: false } : {}) })
            }}
            className="rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-primary bg-background"
          >
            <option value="P">Percorso (P)</option>
            <option value="L">Laboratorio (L)</option>
          </select>
        </div>
        {course.type === 'P' && (
          <div className="flex items-center gap-1.5">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={course.isFormazioneFormatori}
                onChange={(e) => update({ isFormazioneFormatori: e.target.checked })}
                className="rounded"
              />
              Formazione formatori
            </label>
            <span className="relative group">
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground cursor-help">
                i
              </span>
              <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-lg bg-foreground px-3 py-2 text-xs leading-relaxed text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Il bando richiede almeno 1 percorso (P) dedicato alla formazione dei formatori: docenti che poi faranno da moltiplicatori interni, trasferendo le competenze ai colleghi. Seleziona questa opzione sul percorso che la scuola intende dedicare a questo scopo.
              </span>
            </span>
          </div>
        )}
        <div className="ml-auto">
          <button
            onClick={onRemove}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-danger hover:bg-danger/10"
          >
            Rimuovi
          </button>
        </div>
      </div>
    </div>
  )
}
