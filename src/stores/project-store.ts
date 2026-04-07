import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CourseType = 'P' | 'L'

export interface ProjectCourse {
  id: string
  catalogId: string | null
  name: string
  area: string
  type: CourseType
  hours: number
  participants: number
  isFormazioneFormatori: boolean
  notes: string
}

export interface TechnologyItem {
  id: string
  name: string
  category: 'platform-ai' | 'tool-ai' | 'platform-fem' | 'coding' | 'other'
  description: string
  included: boolean
}

export interface CustomCostItem {
  id: string
  title: string
  amount: number
}

export interface SchoolProject {
  id: string
  schoolName: string
  projectTitle: string
  region: string
  isMezzogiorno: boolean
  courses: ProjectCourse[]
  technologies: TechnologyItem[]
  customCosts: CustomCostItem[]
  narrativeTexts: Record<string, string>
  status: 'draft' | 'ready' | 'submitted'
  created_at: string
  updated_at: string
}

interface ProjectStore {
  projects: SchoolProject[]
  selectedProjectId: string | null

  addProject: (schoolName: string, projectTitle: string) => string
  updateProject: (id: string, updates: Partial<Omit<SchoolProject, 'id' | 'created_at' | 'courses'>>) => void
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => string
  selectProject: (id: string | null) => void

  addCourse: (projectId: string, course: Omit<ProjectCourse, 'id'>) => void
  updateCourse: (projectId: string, courseId: string, updates: Partial<Omit<ProjectCourse, 'id'>>) => void
  removeCourse: (projectId: string, courseId: string) => void

  addTechnology: (projectId: string, tech: Omit<TechnologyItem, 'id'>) => void
  removeTechnology: (projectId: string, techId: string) => void
  toggleTechnology: (projectId: string, techId: string) => void
  addCustomCost: (projectId: string, title: string, amount: number) => void
  updateCustomCost: (projectId: string, costId: string, updates: Partial<Omit<CustomCostItem, 'id'>>) => void
  removeCustomCost: (projectId: string, costId: string) => void
  updateNarrativeText: (projectId: string, fieldId: string, text: string) => void
}

function generateId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      selectedProjectId: null,

      addProject: (schoolName, projectTitle) => {
        const id = generateId()
        set((s) => ({
          projects: [
            {
              id,
              schoolName,
              projectTitle,
              region: '',
              isMezzogiorno: false,
              courses: [],
              technologies: [],
              customCosts: [],
              narrativeTexts: {},
              status: 'draft',
              created_at: now(),
              updated_at: now(),
            },
            ...s.projects,
          ],
          selectedProjectId: id,
        }))
        return id
      },

      updateProject: (id, updates) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updated_at: now() } : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          selectedProjectId: s.selectedProjectId === id ? null : s.selectedProjectId,
        }))
      },

      duplicateProject: (id) => {
        const newId = generateId()
        set((s) => {
          const original = s.projects.find((p) => p.id === id)
          if (!original) return s
          const clone: SchoolProject = {
            ...original,
            id: newId,
            projectTitle: `${original.projectTitle} (copia)`,
            status: 'draft',
            courses: original.courses.map((c) => ({ ...c, id: generateId() })),
            technologies: original.technologies.map((t) => ({ ...t, id: generateId() })),
            customCosts: original.customCosts.map((c) => ({ ...c, id: generateId() })),
            narrativeTexts: { ...original.narrativeTexts },
            created_at: now(),
            updated_at: now(),
          }
          return {
            projects: [clone, ...s.projects],
            selectedProjectId: newId,
          }
        })
        return newId
      },

      selectProject: (id) => {
        set({ selectedProjectId: id })
      },

      addCourse: (projectId, course) => {
        const courseWithId = { ...course, id: generateId() }
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, courses: [...p.courses, courseWithId], updated_at: now() }
              : p
          ),
        }))
      },

      updateCourse: (projectId, courseId, updates) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  courses: p.courses.map((c) =>
                    c.id === courseId ? { ...c, ...updates } : c
                  ),
                  updated_at: now(),
                }
              : p
          ),
        }))
      },

      removeCourse: (projectId, courseId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, courses: p.courses.filter((c) => c.id !== courseId), updated_at: now() }
              : p
          ),
        }))
      },

      addTechnology: (projectId, tech) => {
        const techWithId = { ...tech, id: generateId() }
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, technologies: [...p.technologies, techWithId], updated_at: now() }
              : p
          ),
        }))
      },

      removeTechnology: (projectId, techId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, technologies: p.technologies.filter((t) => t.id !== techId), updated_at: now() }
              : p
          ),
        }))
      },

      toggleTechnology: (projectId, techId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  technologies: p.technologies.map((t) =>
                    t.id === techId ? { ...t, included: !t.included } : t
                  ),
                  updated_at: now(),
                }
              : p
          ),
        }))
      },

      addCustomCost: (projectId, title, amount) => {
        const item: CustomCostItem = { id: generateId(), title, amount }
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, customCosts: [...p.customCosts, item], updated_at: now() }
              : p
          ),
        }))
      },

      updateCustomCost: (projectId, costId, updates) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  customCosts: p.customCosts.map((c) =>
                    c.id === costId ? { ...c, ...updates } : c
                  ),
                  updated_at: now(),
                }
              : p
          ),
        }))
      },

      removeCustomCost: (projectId, costId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, customCosts: p.customCosts.filter((c) => c.id !== costId), updated_at: now() }
              : p
          ),
        }))
      },

      updateNarrativeText: (projectId, fieldId, text) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  narrativeTexts: { ...p.narrativeTexts, [fieldId]: text },
                  updated_at: now(),
                }
              : p
          ),
        }))
      },
    }),
    {
      name: 'ai-school-project-planner',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>
        if (version === 0) {
          const projects = (state.projects ?? []) as Record<string, unknown>[]
          state.projects = projects.map((p) => ({
            ...p,
            technologies: (p.technologies as unknown[]) ?? [],
            customCosts: [],
          }))
        }
        if (version <= 1) {
          const projects = (state.projects ?? []) as Record<string, unknown>[]
          state.projects = projects.map((p) => ({
            ...p,
            customCosts: (p.customCosts as unknown[]) ?? [],
          }))
          // Remove old indirectCosts field
          for (const p of state.projects as Record<string, unknown>[]) {
            delete p.indirectCosts
          }
        }
        return state as unknown as ProjectStore
      },
    }
  )
)
