# AI School Project Planner — Guida per il team Sales

## Cos'è

È un tool online che ti permette di costruire un piano formativo per una scuola nell'ambito del **bando DM 219/2025** (PNRR — AI nella didattica, fino a €50.000 per scuola).

Il tool calcola automaticamente i costi, verifica i vincoli del bando, genera i testi per la scheda ministeriale e produce il preventivo FEM in formato Word ed Excel.

**Link:** https://aiedplan.netlify.app

---

## Come si usa — passo per passo

### 1. Crea un nuovo progetto

- Clicca **"+ Nuovo"** nella sidebar a sinistra
- Inserisci il **nome della scuola** e un **titolo progetto** (es. "AI nella didattica 2026")
- Clicca **"Crea"**

### 2. Aggiungi i corsi (tab Corsi)

**Dal catalogo FEM:**
- Clicca **"+ Aggiungi da catalogo FEM"**
- Sfoglia i corsi per area o cerca per nome
- Clicca **"+ P"** per aggiungere come Percorso o **"+ L"** come Laboratorio
- I corsi con badge **P/L** possono essere aggiunti in entrambe le modalità
- Lo stesso corso può essere aggiunto più volte (es. più edizioni)

**Corsi non FEM:**
- Clicca **"+ Altro corso"** per aggiungere un corso esterno al catalogo
- Inserisci nome, tipologia (P o L) e ore

**Per ogni corso puoi configurare:**
- **Ore**: per i corsi FEM, modificabili di ±2/+3 ore rispetto alla durata standard
- **Partecipanti**: il numero di docenti previsti (min 10 per P, min 5 per L)
- **Formazione formatori**: spunta questa casella su **almeno 1 percorso** — è un obbligo del bando

### 3. Controlla il budget (tab Budget)

Qui trovi tre sezioni:

- **Riepilogo Budget Complessivo**: barra di progresso su €50.000, breakdown Percorsi vs Laboratori con costi diretti e indiretti, percentuale laboratori (deve essere ≥50%)
- **Preventivo FEM**: il riepilogo di quello che FEM fattura alla scuola (formazione + eventuali piattaforme), con esportazione in **Word (.docx)** ed **Excel (.xlsx)**
- **Vincoli del Bando**: checklist verde/rosso con gli 8 vincoli da rispettare

### 4. Aggiungi tecnologie (tab Tecnologie)

- **Piattaforme FEM**: aggiungi LINDA o AI for Learning con i prezzi a listino
- **Altre tecnologie**: aggiungi qualsiasi software AI che la scuola userà (ChatGPT, Canva AI, etc.)
- **Pianificazione costi indiretti**: alloca il 40% tra licenze software, organizzazione e materiali

### 5. Genera i testi (tab Testi)

- Clicca **"Genera tutti i testi"** per compilare i 6 campi della scheda ministeriale
- I testi vengono generati in base ai corsi selezionati
- Puoi modificarli liberamente
- Usa **"Copia"** accanto a ogni campo per incollare su Scuola Futura
- Usa **"Copia tutti"** o **"Scarica .txt"** per esportare tutto

### 6. Consulta i riferimenti (tab Riferimenti)

Link ai documenti normativi del bando: Linee guida IA, DigComp, AI Act, UNESCO, OECD, etc.

---

## Come esportare il preventivo FEM

Nel tab **Budget**, nella sezione "Preventivo FEM":
- **"Scarica .docx"** → Word su carta intestata FEM, pronto da inviare alla scuola
- **"Scarica .xlsx"** → Excel con dettaglio corsi e costi

Il preventivo include:
- Titolo corso, tipologia, breve descrizione, ore
- Prezzo senza IVA per la formazione (esente IVA art. 10)
- Prezzo licenze con IVA 22% scorporata
- Termini di esecuzione e validità (60 giorni)

---

## Cose importanti da ricordare

| Cosa | Regola |
|------|--------|
| Budget massimo | €50.000 per progetto |
| Laboratori | Devono essere ≥ 50% del budget totale |
| Formazione formatori | Almeno 1 percorso (P) deve avere la spunta |
| Partecipanti | Min 10 per Percorso, min 5 per Laboratorio |
| Attestati totali | Almeno 50 persone con attestato nel progetto |
| Scadenza bando | **17 aprile 2026, ore 15:00** |

---

## I dati sono sicuri?

Sì. Tutto resta nel browser della persona che usa il tool. Non c'è nessun server, nessun database, nessun dato viene trasmesso. Se cancelli i dati del browser, i progetti vengono persi.

---

## Problemi?

- **Pagina bianca**: ricarica con Cmd+Shift+R (hard refresh)
- **Dati persi**: i progetti sono nel localStorage del browser — se cambi browser o lo pulisci, riparti da zero
- **Preventivo Word formattato male**: assicurati di aprirlo con Word (non Google Docs o Pages)
