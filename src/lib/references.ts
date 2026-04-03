export interface Reference {
  id: string
  title: string
  shortTitle: string
  description: string
  url: string
  year: number
  issuer: string
}

export const REFERENCES: Reference[] = [
  {
    id: 'linee-guida-ia',
    title: 'Linee guida per l\'introduzione dell\'Intelligenza Artificiale nelle scuole',
    shortTitle: 'Linee guida IA',
    description: 'DM 9 agosto 2025, n. 166 — Quadro di riferimento per l\'integrazione dell\'AI nella didattica scolastica.',
    url: 'https://www.miur.gov.it/documents/20182/0/Linee+guida+per+l%27introduzione+dell%27intelligenza+artificiale+nelle+scuole.pdf',
    year: 2025,
    issuer: 'MIM',
  },
  {
    id: 'educazione-civica',
    title: 'Linee guida per l\'insegnamento dell\'educazione civica',
    shortTitle: 'Educazione Civica',
    description: 'DM 7 settembre 2024, n. 183 — Cittadinanza digitale, disinformazione, etica dell\'AI.',
    url: 'https://www.miur.gov.it/educazione-civica',
    year: 2024,
    issuer: 'MIM',
  },
  {
    id: 'digcomp-3',
    title: 'DigComp 3.0 — Digital Competence Framework for Citizens',
    shortTitle: 'DigComp 3.0',
    description: 'Quadro europeo sulle competenze digitali dei cittadini, inclusa l\'interazione con sistemi AI.',
    url: 'https://publications.jrc.ec.europa.eu/repository/handle/JRC141046',
    year: 2025,
    issuer: 'European Commission / JRC',
  },
  {
    id: 'digcompedu',
    title: 'DigCompEdu — European Framework for the Digital Competence of Educators',
    shortTitle: 'DigCompEdu',
    description: 'Quadro europeo per gli educatori: selezione risorse, progettazione, valutazione potenziata.',
    url: 'https://joint-research-centre.ec.europa.eu/digcompedu_en',
    year: 2017,
    issuer: 'European Commission / JRC',
  },
  {
    id: 'linee-guida-stem',
    title: 'Linee guida per le discipline STEM',
    shortTitle: 'Linee guida STEM',
    description: 'DM 15 settembre 2023, n. 184 — Orientamenti per l\'insegnamento delle discipline STEM.',
    url: 'https://www.miur.gov.it/documents/20182/6740384/Linee_guida_STEM.pdf',
    year: 2023,
    issuer: 'MIM',
  },
  {
    id: 'ai-act',
    title: 'Regolamento UE sull\'Intelligenza Artificiale (AI Act)',
    shortTitle: 'AI Act',
    description: 'Regolamento (UE) 2024/1689 — Primo quadro normativo completo sull\'AI a livello mondiale.',
    url: 'https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32024R1689',
    year: 2024,
    issuer: 'Unione Europea',
  },
  {
    id: 'legge-132',
    title: 'Legge 132/2025 — Disposizioni in materia di intelligenza artificiale',
    shortTitle: 'Legge AI Italia',
    description: 'Disposizioni e deleghe al Governo in materia di intelligenza artificiale.',
    url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2025-09-30;132',
    year: 2025,
    issuer: 'Parlamento italiano',
  },
  {
    id: 'unesco-ai-cft',
    title: 'UNESCO AI Competency Framework for Teachers',
    shortTitle: 'UNESCO AI CFT',
    description: 'Framework che articola le competenze AI degli insegnanti in 5 dimensioni su 3 livelli di progressione.',
    url: 'https://unesdoc.unesco.org/ark:/48223/pf0000391104',
    year: 2024,
    issuer: 'UNESCO',
  },
  {
    id: 'oecd-ai-literacy',
    title: 'OECD AI Literacy Framework',
    shortTitle: 'OECD AI Literacy',
    description: 'Framework che definisce 22 competenze in 4 domini per l\'alfabetizzazione AI dei cittadini.',
    url: 'https://www.oecd.org/en/publications/ai-literacy-in-education_a3781fd0-en.html',
    year: 2025,
    issuer: 'OECD / Commissione Europea',
  },
]
