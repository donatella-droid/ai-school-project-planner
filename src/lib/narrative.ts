import type { ProjectCourse } from '@/stores/project-store'
import { CATALOG } from './catalog'

export interface NarrativeField {
  id: string
  title: string
  instruction: string
  maxChars: number
  minChars: number
}

export const NARRATIVE_FIELDS: NarrativeField[] = [
  {
    id: 'field1',
    title: 'Programmi e attività formative dei percorsi e workshop',
    instruction: 'Descrivere dettagliatamente i programmi e le attività formative dei percorsi e workshop di formazione e approfondimento sull\'utilizzo dell\'intelligenza artificiale nella didattica e nell\'organizzazione scolastica.',
    maxChars: 2500,
    minChars: 150,
  },
  {
    id: 'field2',
    title: 'Programma formazione formatori',
    instruction: 'Descrivere il programma di massima e le attività formative previste per il percorso obbligatorio di formazione per i formatori che avranno poi il compito di diffondere le competenze acquisite.',
    maxChars: 2500,
    minChars: 150,
  },
  {
    id: 'field3',
    title: 'Programmi formativi dei laboratori sul campo',
    instruction: 'Descrivere dettagliatamente i programmi formativi dei laboratori sul campo con l\'utilizzo di dispositivi e applicazioni di intelligenza artificiale, rivolti a docenti con il coinvolgimento degli studenti.',
    maxChars: 2500,
    minChars: 150,
  },
  {
    id: 'field4',
    title: 'Conformità a Linee guida',
    instruction: 'Descrivere in che modo le attività formative saranno realizzate conformemente a: 1. Linee guida IA; 2. Linee guida educazione civica; 3. DigComp 3.0; 4. DigCompEdu.',
    maxChars: 2500,
    minChars: 150,
  },
  {
    id: 'field5',
    title: 'Applicativi per l\'utilizzo dell\'AI',
    instruction: 'Descrivere i sistemi di software e applicativi per l\'utilizzo dell\'intelligenza artificiale nella didattica che si prevede di utilizzare.',
    maxChars: 2500,
    minChars: 150,
  },
  {
    id: 'field6',
    title: 'Modalità di diffusione',
    instruction: 'Descrivere le modalità di diffusione delle attività formative al fine di assicurare la partecipazione dei docenti della scuola e di quelli delle altre scuole del territorio regionale.',
    maxChars: 2500,
    minChars: 150,
  },
]

export function generateNarrativeTemplate(fieldId: string, courses: ProjectCourse[], schoolName: string): string {
  const percorsi = courses.filter(c => c.type === 'P')
  const laboratori = courses.filter(c => c.type === 'L')
  const formazioneFormatori = courses.find(c => c.isFormazioneFormatori)

  const getCatalogAbstract = (catalogId: string | null) => {
    if (!catalogId) return ''
    return CATALOG.find(c => c.id === catalogId)?.abstract ?? ''
  }

  switch (fieldId) {
    case 'field1': {
      const courseList = percorsi
        .map(c => `"${c.name}" (${c.hours} ore, ${c.participants} partecipanti)`)
        .join('; ')
      return `Il programma formativo dello snodo si articola in ${percorsi.length} percorsi e workshop strutturati secondo una progressione che riflette i principali framework internazionali di riferimento — l'AI Competency Framework for Teachers di UNESCO (2024) e l'AI Literacy Framework di OECD/Commissione Europea (2025).\n\nI percorsi previsti sono: ${courseList}.\n\n${percorsi.map(c => {
        const abstract = getCatalogAbstract(c.catalogId)
        return abstract ? `${c.name}: ${abstract.substring(0, 200)}...` : ''
      }).filter(Boolean).join('\n\n')}\n\nI percorsi sono erogati in modalità mista (presenza e sincrona online), con rilascio di attestazione finale. Ogni percorso prevede gruppi di almeno 10 partecipanti e combina lezioni interattive con sessioni laboratoriali.\n\nI percorsi sono realizzati in collaborazione con FEM — Future Education Modena, centro di ricerca e sviluppo EdTech, ente accreditato MIUR.`
    }

    case 'field2': {
      if (!formazioneFormatori) {
        return '[ATTENZIONE: Nessun corso è stato contrassegnato come "Formazione Formatori". Selezionare almeno un percorso come formazione formatori per generare questo testo.]'
      }
      return `Il percorso di formazione dei formatori è progettato per preparare un gruppo selezionato di docenti interni a diventare riferimenti stabili per l'integrazione dell'AI nella didattica del proprio istituto.\n\nIl percorso "${formazioneFormatori.name}" (${formazioneFormatori.hours} ore) fornisce competenze approfondite sull'uso dell'intelligenza artificiale nella pratica educativa.\n\n${getCatalogAbstract(formazioneFormatori.catalogId).substring(0, 400)}\n\nAl termine del percorso, i formatori ricevono un kit di risorse (materiali, schede operative, prompt testati) per condurre sessioni interne di disseminazione. È previsto un incontro di follow-up per monitorare l'efficacia del trasferimento.`
    }

    case 'field3': {
      const labList = laboratori
        .map(c => `"${c.name}" (${c.hours} ore, ${c.participants} partecipanti)`)
        .join('; ')
      return `I laboratori sul campo rappresentano il nucleo operativo del progetto e costituiscono almeno il 50% del budget complessivo. Sono svolti in presenza, rivolti a docenti con il coinvolgimento diretto degli studenti.\n\nI laboratori previsti sono: ${labList}.\n\n${laboratori.map(c => {
        const abstract = getCatalogAbstract(c.catalogId)
        return abstract ? `${c.name}: ${abstract.substring(0, 200)}...` : ''
      }).filter(Boolean).join('\n\n')}\n\nOgni laboratorio prevede cicli di incontri in presenza con tutoraggio, mentoring e job shadowing. I gruppi sono composti da almeno 5 unità di personale che conseguono l'attestato finale.`
    }

    case 'field4':
      return `Le attività formative sono progettate in conformità con ciascuno dei quattro framework richiesti dal bando.\n\nLinee guida per l'introduzione dell'IA nelle scuole (DM 166/2025). Il programma copre dalla comprensione dei principi fondamentali dell'AI all'uso critico degli strumenti, fino alla sperimentazione diretta in classe.\n\nLinee guida per l'educazione civica (DM 183/2024). I laboratori sviluppano competenze di cittadinanza digitale: analisi critica delle fonti, comprensione dei bias algoritmici, consapevolezza dell'impatto sociale dell'AI.\n\nDigComp 3.0. La progressione formativa riflette le aree del quadro europeo: dall'alfabetizzazione informativa alla creazione di contenuti digitali, dalla comunicazione in ambienti digitali alla sicurezza.\n\nDigCompEdu. I percorsi coprono: selezione e integrazione delle risorse digitali, progettazione di attività di apprendimento potenziate dall'AI, valutazione formativa, personalizzazione e inclusione.`

    case 'field5':
      return `Le attività formative utilizzeranno sistemi software e applicativi di intelligenza artificiale scelti per efficacia didattica, conformità al Regolamento UE sull'IA (2024/1689) e rispetto della privacy (GDPR).\n\nPer i percorsi e workshop: piattaforme di AI generativa testuale (ChatGPT, Claude, Gemini); strumenti di AI per materiali visivi (Canva AI); ambienti per valutazione e feedback automatizzato; piattaforme per agenti conversazionali e tutor AI personalizzati.\n\nPer i laboratori con studenti: ambienti di coding assistito dall'AI, Google AI Studio, piattaforme di machine learning accessibile (Teachable Machine), ambienti di programmazione visuale (Scratch, Code.org), strumenti di data visualization.\n\nFEM sviluppa inoltre piattaforme AI proprietarie validate pedagogicamente (AI for Learning, LINDA). Le licenze rientrano nella quota dei costi indiretti del progetto.\n\nTutti gli applicativi rispettano le Linee guida IA e la normativa sulla protezione dei dati personali, con particolare attenzione all'uso con studenti minorenni.`

    case 'field6': {
      const totaleAttestati = courses.reduce((sum, c) => sum + c.participants, 0)
      return `${schoolName || 'Lo snodo formativo'} adotta una strategia di diffusione articolata su più livelli per garantire la massima partecipazione.\n\nComunicazione e promozione: comunicazioni istituzionali alle scuole del territorio tramite gli Uffici scolastici; pubblicazione su "Scuola Futura" e sul sito istituzionale; diffusione attraverso le reti di scuole; campagna informativa ai dirigenti scolastici della regione.\n\nAccessibilità e flessibilità: percorsi in modalità mista (presenza e sincrona online) per ampliare la partecipazione territoriale. Laboratori in presenza calendarizzati in orari compatibili con l'attività didattica.\n\nDisseminazione interna: il percorso di formazione dei formatori garantisce il trasferimento delle competenze all'interno dei singoli istituti. I formatori ricevono un kit di risorse operative.\n\nMonitoraggio: iscrizioni, distribuzione territoriale, tasso di completamento e rilascio attestati (target: ${totaleAttestati > 0 ? totaleAttestati : 50} attestati). Dati gestiti tramite "Scuola Futura".`
    }

    default:
      return ''
  }
}
