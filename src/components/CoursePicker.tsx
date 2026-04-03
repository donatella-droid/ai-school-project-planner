import { useState } from 'react'
import { CATALOG, AREA_NAMES, AREA_SUBTITLES, type CatalogCourse } from '@/lib/catalog'
import { costoTotaleCorso, fmtEur } from '@/lib/costs'
import { useProjectStore, type ProjectCourse, type CourseType } from '@/stores/project-store'

interface Props {
  projectId: string
  existingCourses: ProjectCourse[]
}

export function CoursePicker({ projectId, existingCourses }: Props) {
  const addCourse = useProjectStore((s) => s.addCourse)
  const [showCatalog, setShowCatalog] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [filterArea, setFilterArea] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Custom course form
  const [customName, setCustomName] = useState('')
  const [customType, setCustomType] = useState<CourseType>('P')
  const [customHours, setCustomHours] = useState(10)

  const existingIds = new Set(existingCourses.map((c) => c.catalogId))

  const filteredCatalog = CATALOG.filter((c) => {
    if (filterArea !== null && c.area !== filterArea) return false
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const groupedByArea = filteredCatalog.reduce<Record<number, CatalogCourse[]>>((acc, c) => {
    (acc[c.area] ??= []).push(c)
    return acc
  }, {})

  const handleAddFromCatalog = (course: CatalogCourse, type: CourseType) => {
    addCourse(projectId, {
      catalogId: course.id,
      name: course.name,
      area: String(course.area),
      type,
      hours: course.defaultHours,
      participants: type === 'P' ? 10 : 5,
      isFormazioneFormatori: false,
      notes: '',
    })
  }

  const handleAddCustom = () => {
    if (!customName.trim()) return
    addCourse(projectId, {
      catalogId: null,
      name: customName.trim(),
      area: 'custom',
      type: customType,
      hours: customHours,
      participants: customType === 'P' ? 10 : 5,
      isFormazioneFormatori: false,
      notes: '',
    })
    setCustomName('')
    setCustomHours(10)
    setShowCustom(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => { setShowCatalog(!showCatalog); setShowCustom(false) }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            showCatalog
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background hover:bg-muted'
          }`}
        >
          + Aggiungi da catalogo FEM
        </button>
        <button
          onClick={() => { setShowCustom(!showCustom); setShowCatalog(false) }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            showCustom
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background hover:bg-muted'
          }`}
        >
          + Altro corso
        </button>
      </div>

      {/* Custom course form */}
      {showCustom && (
        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
          <h4 className="text-sm font-semibold">Aggiungi altro corso</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Nome corso</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Es. Introduzione all'AI per ATA"
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Tipologia</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as CourseType)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary bg-background"
              >
                <option value="P">Percorso (P)</option>
                <option value="L">Laboratorio (L)</option>
              </select>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Ore</label>
              <input
                type="number"
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                min={1}
                className="w-20 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Costo: {fmtEur(costoTotaleCorso(customType, customHours))}
            </div>
            <div className="ml-auto">
              <button
                onClick={handleAddCustom}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog browser */}
      {showCatalog && (
        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Cerca corso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <select
              value={filterArea ?? ''}
              onChange={(e) => setFilterArea(e.target.value ? Number(e.target.value) : null)}
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary bg-background"
            >
              <option value="">Tutte le aree</option>
              {Object.entries(AREA_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{id}. {name}</option>
              ))}
            </select>
          </div>

          <div className="max-h-[500px] overflow-auto space-y-4">
            {Object.entries(groupedByArea)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([areaId, courses]) => (
                <div key={areaId}>
                  <div className="sticky top-0 bg-background pb-2 pt-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Area {areaId}: {AREA_NAMES[Number(areaId)]}
                      <span className="ml-2 font-normal normal-case">
                        {AREA_SUBTITLES[Number(areaId)]}
                      </span>
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    {courses.map((course) => {
                      const alreadyAdded = existingIds.has(course.id)
                      return (
                        <CatalogItem
                          key={course.id}
                          course={course}
                          alreadyAdded={alreadyAdded}
                          onAdd={(type) => handleAddFromCatalog(course, type)}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CatalogItem({
  course,
  alreadyAdded,
  onAdd,
}: {
  course: CatalogCourse
  alreadyAdded: boolean
  onAdd: (type: CourseType) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-lg border p-3 text-sm transition-colors ${
      alreadyAdded ? 'border-success/30 bg-success/5' : 'border-border hover:border-primary/30'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-left font-medium hover:text-primary"
          >
            {course.name}
          </button>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{course.code}</span>
            <span>·</span>
            <span>{course.defaultHours}h</span>
            <span>·</span>
            <span>{course.target}</span>
            <span>·</span>
            <TypeBadge type={course.allowedTypes} />
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {alreadyAdded ? (
            <span className="rounded bg-success/10 px-2 py-1 text-xs font-medium text-success">
              Aggiunto
            </span>
          ) : (
            <>
              {(course.allowedTypes === 'P' || course.allowedTypes === 'P/L') && (
                <button
                  onClick={() => onAdd('P')}
                  className="rounded bg-area-2/10 px-2 py-1 text-xs font-medium text-area-2 hover:bg-area-2/20"
                >
                  + P
                </button>
              )}
              {(course.allowedTypes === 'L' || course.allowedTypes === 'P/L') && (
                <button
                  onClick={() => onAdd('L')}
                  className="rounded bg-area-3/10 px-2 py-1 text-xs font-medium text-area-3 hover:bg-area-3/20"
                >
                  + L
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {expanded && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {course.abstract}
        </p>
      )}
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'P': 'bg-area-2/10 text-area-2',
    'L': 'bg-area-3/10 text-area-3',
    'P/L': 'bg-area-4/10 text-area-4',
  }
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${colors[type] ?? ''}`}>
      {type}
    </span>
  )
}
