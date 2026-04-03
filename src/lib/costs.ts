import type { CourseType } from '@/stores/project-store'

// UCS dal bando DM 219/2025
export const UCS_FORMATORE = 122.00
export const UCS_TUTOR = 34.00
export const QUOTA_INDIRETTI = 0.40
export const MAX_PROGETTO = 50_000
export const MIN_QUOTA_LAB = 0.50

// Costo orario totale (diretto + indiretto)
export const COSTO_ORA_PERCORSO = (UCS_FORMATORE + UCS_TUTOR) * (1 + QUOTA_INDIRETTI) // 218.40
export const COSTO_ORA_LABORATORIO = UCS_FORMATORE * (1 + QUOTA_INDIRETTI) // 170.80

// Costo diretto orario
export const COSTO_DIRETTO_ORA_PERCORSO = UCS_FORMATORE + UCS_TUTOR // 156.00
export const COSTO_DIRETTO_ORA_LABORATORIO = UCS_FORMATORE // 122.00

export function costoTotaleCorso(type: CourseType, hours: number): number {
  return type === 'P'
    ? hours * COSTO_ORA_PERCORSO
    : hours * COSTO_ORA_LABORATORIO
}

export function costoDirettoCorso(type: CourseType, hours: number): number {
  return type === 'P'
    ? hours * COSTO_DIRETTO_ORA_PERCORSO
    : hours * COSTO_DIRETTO_ORA_LABORATORIO
}

export function costoIndirettoCorso(type: CourseType, hours: number): number {
  return costoDirettoCorso(type, hours) * QUOTA_INDIRETTI
}

export interface CostBreakdown {
  costiDiretti: number
  costiIndiretti: number
  totale: number
}

export function breakdownCorso(type: CourseType, hours: number): CostBreakdown {
  const diretti = costoDirettoCorso(type, hours)
  const indiretti = diretti * QUOTA_INDIRETTI
  return {
    costiDiretti: diretti,
    costiIndiretti: indiretti,
    totale: diretti + indiretti,
  }
}

export function fmtEur(n: number): string {
  return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}
