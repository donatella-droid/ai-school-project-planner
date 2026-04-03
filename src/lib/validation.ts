import type { ProjectCourse } from '@/stores/project-store'
import { costoTotaleCorso, MAX_PROGETTO, MIN_QUOTA_LAB } from './costs'

export const MIN_PARTECIPANTI_PERCORSO = 10
export const MIN_PARTECIPANTI_LABORATORIO = 5
export const MIN_ATTESTATI_TOTALI = 50

export interface ValidationResult {
  id: string
  label: string
  passed: boolean
  detail: string
}

export function validateProject(courses: ProjectCourse[]): ValidationResult[] {
  const totalePercorsi = courses
    .filter(c => c.type === 'P')
    .reduce((sum, c) => sum + costoTotaleCorso(c.type, c.hours), 0)

  const totaleLaboratori = courses
    .filter(c => c.type === 'L')
    .reduce((sum, c) => sum + costoTotaleCorso(c.type, c.hours), 0)

  const totale = totalePercorsi + totaleLaboratori

  const attestatiPercorsi = courses
    .filter(c => c.type === 'P')
    .reduce((sum, c) => sum + c.participants, 0)

  const attestatiLab = courses
    .filter(c => c.type === 'L')
    .reduce((sum, c) => sum + c.participants, 0)

  const attestatiTotali = attestatiPercorsi + attestatiLab

  const hasFormazioneFormatori = courses.some(c => c.isFormazioneFormatori)
  const hasPercorsi = courses.some(c => c.type === 'P')
  const hasLaboratori = courses.some(c => c.type === 'L')

  const quotaLab = totale > 0 ? totaleLaboratori / totale : 0

  const percorsiSottoMinimo = courses.filter(c => c.type === 'P' && c.participants < MIN_PARTECIPANTI_PERCORSO)
  const labSottoMinimo = courses.filter(c => c.type === 'L' && c.participants < MIN_PARTECIPANTI_LABORATORIO)

  return [
    {
      id: 'V1',
      label: 'Budget massimo',
      passed: totale <= MAX_PROGETTO,
      detail: totale <= MAX_PROGETTO
        ? `${fmtNum(totale)} / ${fmtNum(MAX_PROGETTO)}`
        : `${fmtNum(totale)} supera il massimo di ${fmtNum(MAX_PROGETTO)}`,
    },
    {
      id: 'V2',
      label: 'Laboratori >= 50%',
      passed: quotaLab >= MIN_QUOTA_LAB || courses.length === 0,
      detail: courses.length === 0
        ? 'Nessun corso inserito'
        : `Laboratori al ${(quotaLab * 100).toFixed(1)}% del totale`,
    },
    {
      id: 'V3',
      label: 'Formazione formatori',
      passed: hasFormazioneFormatori,
      detail: hasFormazioneFormatori
        ? 'Almeno 1 percorso formazione formatori presente'
        : 'Manca il percorso obbligatorio di formazione formatori',
    },
    {
      id: 'V4',
      label: 'Min. partecipanti percorsi',
      passed: percorsiSottoMinimo.length === 0,
      detail: percorsiSottoMinimo.length === 0
        ? 'Tutti i percorsi hanno >= 10 partecipanti'
        : `${percorsiSottoMinimo.length} percors${percorsiSottoMinimo.length === 1 ? 'o' : 'i'} sotto il minimo di 10`,
    },
    {
      id: 'V5',
      label: 'Min. partecipanti laboratori',
      passed: labSottoMinimo.length === 0,
      detail: labSottoMinimo.length === 0
        ? 'Tutti i laboratori hanno >= 5 partecipanti'
        : `${labSottoMinimo.length} laborator${labSottoMinimo.length === 1 ? 'io' : 'i'} sotto il minimo di 5`,
    },
    {
      id: 'V6',
      label: 'Target attestati >= 50',
      passed: attestatiTotali >= MIN_ATTESTATI_TOTALI || courses.length === 0,
      detail: courses.length === 0
        ? 'Nessun corso inserito'
        : `${attestatiTotali} attestati previsti (minimo ${MIN_ATTESTATI_TOTALI})`,
    },
    {
      id: 'V7',
      label: 'Almeno 1 percorso (P)',
      passed: hasPercorsi,
      detail: hasPercorsi
        ? `${courses.filter(c => c.type === 'P').length} percors${courses.filter(c => c.type === 'P').length === 1 ? 'o' : 'i'} inserit${courses.filter(c => c.type === 'P').length === 1 ? 'o' : 'i'}`
        : 'Nessun percorso (P) inserito',
    },
    {
      id: 'V8',
      label: 'Almeno 1 laboratorio (L)',
      passed: hasLaboratori,
      detail: hasLaboratori
        ? `${courses.filter(c => c.type === 'L').length} laborator${courses.filter(c => c.type === 'L').length === 1 ? 'io' : 'i'} inserit${courses.filter(c => c.type === 'L').length === 1 ? 'o' : 'i'}`
        : 'Nessun laboratorio (L) inserito',
    },
  ]
}

function fmtNum(n: number): string {
  return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}
