import { useState } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { ProjectSidebar } from './ProjectSidebar'
import { ProjectEditor } from './ProjectEditor'

type Tab = 'corsi' | 'budget' | 'tecnologie' | 'testi' | 'riferimenti'

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('corsi')
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId)
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === s.selectedProjectId)
  )

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <ProjectSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              AI
            </div>
            <h1 className="text-base font-semibold">
              AI School Project Planner
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Bando DM 219/2025
              </span>
            </h1>
          </div>

          {/* Tabs */}
          {selectedProjectId && (
            <nav className="flex gap-1">
              {([
                ['corsi', 'Corsi'],
                ['budget', 'Budget'],
                ['tecnologie', 'Tecnologie'],
                ['testi', 'Testi'],
                ['riferimenti', 'Riferimenti'],
              ] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {project ? (
            <ProjectEditor project={project} activeTab={activeTab} />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl">
          AI
        </div>
        <h2 className="text-lg font-semibold">Nessun progetto selezionato</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea un nuovo progetto dalla sidebar per iniziare a progettare il tuo piano formativo.
        </p>
      </div>
    </div>
  )
}
