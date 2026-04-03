import { useState } from 'react'
import { type SchoolProject, useProjectStore } from '@/stores/project-store'
import { NARRATIVE_FIELDS, generateNarrativeTemplate } from '@/lib/narrative'

interface Props {
  project: SchoolProject
}

export function NarrativeGenerator({ project }: Props) {
  const updateNarrativeText = useProjectStore((s) => s.updateNarrativeText)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null)

  const handleCopyField = async (fieldId: string) => {
    const text = project.narrativeTexts[fieldId] ?? ''
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedFieldId(fieldId)
    setTimeout(() => setCopiedFieldId(null), 2000)
  }

  const handleGenerate = (fieldId: string) => {
    const text = generateNarrativeTemplate(fieldId, project.courses, project.schoolName)
    updateNarrativeText(project.id, fieldId, text)
  }

  const buildExportText = () => {
    return NARRATIVE_FIELDS.map((field) => {
      const text = project.narrativeTexts[field.id] ?? ''
      return `=== CAMPO ${field.id.replace('field', '')} — ${field.title.toUpperCase()} ===\n${field.instruction}\n\n${text || '[non compilato]'}\n\n(${text.length} / ${field.maxChars} caratteri)`
    }).join('\n\n' + '─'.repeat(60) + '\n\n')
  }

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(buildExportText())
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  const handleDownload = () => {
    const header = `SCHEDA PROGETTO — ${project.projectTitle}\n${project.schoolName}\nEsportato il ${new Date().toLocaleDateString('it-IT')}\n\n` + '═'.repeat(60) + '\n\n'
    const blob = new Blob([header + buildExportText()], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `testi-scheda-${project.schoolName.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-5">
        <h3 className="text-sm font-semibold">Testi per la Scheda Ministeriale</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Genera i testi per i 6 campi obbligatori della candidatura. I template vengono popolati con i corsi selezionati nel tuo progetto.
          Puoi modificarli liberamente dopo la generazione.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => NARRATIVE_FIELDS.forEach((f) => handleGenerate(f.id))}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Genera tutti i testi
          </button>
          <button
            onClick={handleCopyAll}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {copyFeedback ? 'Copiato!' : 'Copia tutti'}
          </button>
          <button
            onClick={handleDownload}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Scarica .txt
          </button>
        </div>
      </div>

      {NARRATIVE_FIELDS.map((field) => {
        const text = project.narrativeTexts[field.id] ?? ''
        const charCount = text.length

        return (
          <div key={field.id} className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold">
                  Campo {field.id.replace('field', '')} — {field.title}
                </h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{field.instruction}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => handleGenerate(field.id)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Genera
                </button>
                <button
                  onClick={() => handleCopyField(field.id)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  {copiedFieldId === field.id ? 'Copiato!' : 'Copia'}
                </button>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => updateNarrativeText(project.id, field.id, e.target.value)}
              rows={8}
              className="mt-3 w-full rounded-lg border border-border p-3 text-sm leading-relaxed outline-none focus:border-primary resize-y"
              placeholder="Clicca 'Genera' per creare un testo di partenza basato sui corsi selezionati..."
            />

            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {field.minChars}–{field.maxChars} caratteri richiesti
              </span>
              <span className={
                charCount === 0
                  ? ''
                  : charCount < field.minChars
                    ? 'text-danger font-medium'
                    : charCount > field.maxChars
                      ? 'text-danger font-medium'
                      : 'text-success font-medium'
              }>
                {charCount} / {field.maxChars}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
