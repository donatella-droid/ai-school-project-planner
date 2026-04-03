import type { ProjectCourse } from '@/stores/project-store'
import { validateProject } from '@/lib/validation'

interface Props {
  courses: ProjectCourse[]
}

export function ValidationPanel({ courses }: Props) {
  const results = validateProject(courses)
  const allPassed = results.every((r) => r.passed)

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Vincoli del Bando</h3>
        {courses.length > 0 && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            allPassed
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}>
            {allPassed ? 'Tutti i vincoli rispettati' : `${results.filter(r => !r.passed).length} vincol${results.filter(r => !r.passed).length === 1 ? 'o' : 'i'} non rispettat${results.filter(r => !r.passed).length === 1 ? 'o' : 'i'}`}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {results.map((r) => (
          <div
            key={r.id}
            className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm ${
              r.passed
                ? 'border-success/20 bg-success/5'
                : 'border-danger/20 bg-danger/5'
            }`}
          >
            <span className="mt-0.5 text-base leading-none">
              {r.passed ? '\u2705' : '\u274C'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                <span className="font-medium">{r.label}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
