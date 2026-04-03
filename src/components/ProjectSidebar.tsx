import { useState } from 'react'
import { useProjectStore, type SchoolProject } from '@/stores/project-store'
import { costoTotaleCorso, fmtEur } from '@/lib/costs'

export function ProjectSidebar() {
  const projects = useProjectStore((s) => s.projects)
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId)
  const addProject = useProjectStore((s) => s.addProject)
  const selectProject = useProjectStore((s) => s.selectProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const duplicateProject = useProjectStore((s) => s.duplicateProject)

  const [showForm, setShowForm] = useState(false)
  const [schoolName, setSchoolName] = useState('')
  const [projectTitle, setProjectTitle] = useState('')

  const handleCreate = () => {
    if (!schoolName.trim()) return
    addProject(schoolName.trim(), projectTitle.trim() || 'Progetto DM219')
    setSchoolName('')
    setProjectTitle('')
    setShowForm(false)
  }

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-border bg-background">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-semibold">Progetti</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nuovo
        </button>
      </div>

      {showForm && (
        <div className="border-b border-border p-3 space-y-2">
          <input
            type="text"
            placeholder="Nome scuola *"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full rounded-md border border-border bg-muted px-2.5 py-1.5 text-sm outline-none focus:border-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <input
            type="text"
            placeholder="Titolo progetto"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-muted px-2.5 py-1.5 text-sm outline-none focus:border-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Crea
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-md border border-border py-1.5 text-xs font-medium hover:bg-muted"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            Nessun progetto creato
          </div>
        ) : (
          projects.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              isSelected={project.id === selectedProjectId}
              onSelect={() => selectProject(project.id)}
              onDelete={() => deleteProject(project.id)}
              onDuplicate={() => duplicateProject(project.id)}
            />
          ))
        )}
      </div>
    </aside>
  )
}

function ProjectItem({
  project,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  project: SchoolProject
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const total = project.courses.reduce(
    (sum, c) => sum + costoTotaleCorso(c.type, c.hours),
    0
  )

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer border-b border-border px-4 py-3 transition-colors ${
        isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{project.schoolName}</div>
          <div className="truncate text-xs text-muted-foreground">{project.projectTitle}</div>
        </div>
        <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate() }}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Duplica"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="rounded p-0.5 text-muted-foreground hover:text-danger hover:bg-danger/10"
            title="Elimina"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{project.courses.length} cors{project.courses.length === 1 ? 'o' : 'i'}</span>
        <span>·</span>
        <span className="font-medium text-foreground">{fmtEur(total)}</span>
      </div>
    </div>
  )
}
