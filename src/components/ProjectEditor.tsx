import type { SchoolProject } from '@/stores/project-store'
import { useProjectStore } from '@/stores/project-store'
import { CoursePicker } from './CoursePicker'
import { CourseCard } from './CourseCard'
import { BudgetSummary, ValidationCompact, IndirectCostsInfo } from './BudgetSummary'
import { NarrativeGenerator } from './NarrativeGenerator'
import { ReferenceLibrary } from './ReferenceLibrary'
import { TechnologyPanel } from './TechnologyPanel'
import { FemQuote } from './FemQuote'

interface Props {
  project: SchoolProject
  activeTab: 'corsi' | 'budget' | 'tecnologie' | 'testi' | 'riferimenti'
}

export function ProjectEditor({ project, activeTab }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject)
  const removeCourse = useProjectStore((s) => s.removeCourse)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header card — only on Corsi tab */}
      {activeTab === 'corsi' && (
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Nome scuola
              </label>
              <input
                type="text"
                value={project.schoolName}
                onChange={(e) => updateProject(project.id, { schoolName: e.target.value })}
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Titolo progetto
              </label>
              <input
                type="text"
                value={project.projectTitle}
                onChange={(e) => updateProject(project.id, { projectTitle: e.target.value })}
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'corsi' && (
        <div className="space-y-4">
          <CoursePicker projectId={project.id} existingCourses={project.courses} />

          {project.courses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Corsi inseriti ({project.courses.length})
              </h3>
              {project.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  projectId={project.id}
                  onRemove={() => removeCourse(project.id, course.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-4">
          <BudgetSummary project={project} />
          <FemQuote project={project} />
          <ValidationCompact courses={project.courses} />
          <IndirectCostsInfo courses={project.courses} />
        </div>
      )}

      {activeTab === 'tecnologie' && (
        <TechnologyPanel project={project} />
      )}

      {activeTab === 'testi' && (
        <NarrativeGenerator project={project} />
      )}

      {activeTab === 'riferimenti' && (
        <ReferenceLibrary />
      )}
    </div>
  )
}
