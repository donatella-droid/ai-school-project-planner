const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        LevelFormat, ExternalHyperlink } = require("docx");

const F = "Atkinson Hyperlegible";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function txt(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align,
    spacing: { before: opts.spaceBefore || 0, after: opts.spaceAfter || 120 },
    ...(opts.bullet ? { numbering: { reference: "bullets", level: 0 } } : {}),
    children: [new TextRun({ text, font: F, size: opts.size || 22, bold: opts.bold, italics: opts.italic, color: opts.color })],
  });
}

function boldInline(parts) {
  return new Paragraph({
    spacing: { after: 120 },
    numbering: { reference: "bullets", level: 0 },
    children: parts.map(p => new TextRun({ text: p.text, font: F, size: 22, bold: p.bold })),
  });
}

function heading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
    children: [new TextRun({ text, font: F, bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 28 : 24 })],
  });
}

function spacer(n = 200) {
  return new Paragraph({ spacing: { before: n, after: n }, children: [] });
}

function makeCell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    margins: cellMargins,
    ...(opts.shading ? { shading: { fill: opts.shading, type: ShadingType.CLEAR } } : {}),
    children: [new Paragraph({
      children: [new TextRun({ text, font: F, size: 20, bold: opts.bold })],
    })],
  });
}

const tableData = [
  ["Cosa", "Regola"],
  ["Budget massimo", "\u20ac50.000 per progetto"],
  ["Laboratori", "Devono essere \u2265 50% del budget totale"],
  ["Formazione formatori", "Almeno 1 percorso (P) deve avere la spunta"],
  ["Partecipanti", "Min 10 per Percorso, min 5 per Laboratorio"],
  ["Attestati totali", "Almeno 50 persone con attestato nel progetto"],
  ["Scadenza bando", "17 aprile 2026, ore 15:00"],
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: F, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: F, color: "2563EB" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: F },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: F },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } }, run: { font: F } } }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "AI School Project Planner", font: F, size: 40, bold: true, color: "2563EB" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: "Guida per il team Sales", font: F, size: 26, color: "666666" })],
      }),

      // Cos'e'
      heading("Cos\u2019\u00e8", HeadingLevel.HEADING_1),
      txt("\u00c8 un tool online che ti permette di costruire un piano formativo per una scuola nell\u2019ambito del bando DM 219/2025 (PNRR \u2014 AI nella didattica, fino a \u20ac50.000 per scuola)."),
      txt("Il tool calcola automaticamente i costi, verifica i vincoli del bando, genera i testi per la scheda ministeriale e produce il preventivo FEM in formato Word ed Excel."),
      spacer(80),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: "Link: ", font: F, size: 22, bold: true }),
          new ExternalHyperlink({
            children: [new TextRun({ text: "https://aiedplan.netlify.app", font: F, size: 22, style: "Hyperlink" })],
            link: "https://aiedplan.netlify.app",
          }),
        ],
      }),

      // Come si usa
      heading("Come si usa \u2014 passo per passo", HeadingLevel.HEADING_1),

      heading("1. Crea un nuovo progetto", HeadingLevel.HEADING_3),
      boldInline([{ text: "Clicca ", bold: false }, { text: "\u201c+ Nuovo\u201d", bold: true }, { text: " nella sidebar a sinistra", bold: false }]),
      boldInline([{ text: "Inserisci il ", bold: false }, { text: "nome della scuola", bold: true }, { text: " e un ", bold: false }, { text: "titolo progetto", bold: true }]),
      boldInline([{ text: "Clicca ", bold: false }, { text: "\u201cCrea\u201d", bold: true }]),

      heading("2. Aggiungi i corsi (tab Corsi)", HeadingLevel.HEADING_3),
      txt("Dal catalogo FEM:", { bold: true }),
      boldInline([{ text: "Clicca ", bold: false }, { text: "\u201c+ Aggiungi da catalogo FEM\u201d", bold: true }]),
      txt("Sfoglia i corsi per area o cerca per nome", { bullet: true }),
      boldInline([{ text: "Clicca ", bold: false }, { text: "\u201c+ P\u201d", bold: true }, { text: " per Percorso o ", bold: false }, { text: "\u201c+ L\u201d", bold: true }, { text: " per Laboratorio", bold: false }]),
      txt("I corsi con badge P/L possono essere aggiunti in entrambe le modalit\u00e0", { bullet: true }),
      txt("Lo stesso corso pu\u00f2 essere aggiunto pi\u00f9 volte (es. pi\u00f9 edizioni)", { bullet: true }),
      spacer(80),
      txt("Corsi non FEM:", { bold: true }),
      boldInline([{ text: "Clicca ", bold: false }, { text: "\u201c+ Altro corso\u201d", bold: true }, { text: " per aggiungere un corso esterno", bold: false }]),
      txt("Inserisci nome, tipologia (P o L) e ore", { bullet: true }),
      spacer(80),
      txt("Per ogni corso puoi configurare:", { bold: true }),
      boldInline([{ text: "Ore", bold: true }, { text: ": per i corsi FEM, modificabili di \u00b12/+3 ore rispetto alla durata standard", bold: false }]),
      boldInline([{ text: "Partecipanti", bold: true }, { text: ": il numero di docenti previsti (min 10 per P, min 5 per L)", bold: false }]),
      boldInline([{ text: "Formazione formatori", bold: true }, { text: ": spunta questa casella su almeno 1 percorso \u2014 \u00e8 un obbligo del bando", bold: false }]),

      heading("3. Controlla il budget (tab Budget)", HeadingLevel.HEADING_3),
      txt("Qui trovi tre sezioni:"),
      boldInline([{ text: "Riepilogo Budget Complessivo", bold: true }, { text: ": barra di progresso su \u20ac50.000, breakdown Percorsi vs Laboratori, percentuale laboratori (\u2265 50%)", bold: false }]),
      boldInline([{ text: "Preventivo FEM", bold: true }, { text: ": riepilogo costi FEM con esportazione in Word (.docx) ed Excel (.xlsx)", bold: false }]),
      boldInline([{ text: "Vincoli del Bando", bold: true }, { text: ": checklist verde/rosso con gli 8 vincoli da rispettare", bold: false }]),

      heading("4. Aggiungi tecnologie (tab Tecnologie)", HeadingLevel.HEADING_3),
      boldInline([{ text: "Piattaforme FEM", bold: true }, { text: ": aggiungi LINDA o AI for Learning con i prezzi a listino", bold: false }]),
      boldInline([{ text: "Altre tecnologie", bold: true }, { text: ": aggiungi qualsiasi software AI che la scuola user\u00e0", bold: false }]),
      boldInline([{ text: "Pianificazione costi indiretti", bold: true }, { text: ": alloca il 40% tra licenze, organizzazione e materiali", bold: false }]),

      heading("5. Genera i testi (tab Testi)", HeadingLevel.HEADING_3),
      boldInline([{ text: "Clicca ", bold: false }, { text: "\u201cGenera tutti i testi\u201d", bold: true }, { text: " per compilare i 6 campi della scheda ministeriale", bold: false }]),
      txt("I testi vengono generati in base ai corsi selezionati", { bullet: true }),
      txt("Puoi modificarli liberamente", { bullet: true }),
      boldInline([{ text: "Usa ", bold: false }, { text: "\u201cCopia\u201d", bold: true }, { text: " accanto a ogni campo per incollare su Scuola Futura", bold: false }]),
      boldInline([{ text: "Usa ", bold: false }, { text: "\u201cScarica .txt\u201d", bold: true }, { text: " per esportare tutto", bold: false }]),

      heading("6. Consulta i riferimenti (tab Riferimenti)", HeadingLevel.HEADING_3),
      txt("Link ai documenti normativi del bando: Linee guida IA, DigComp, AI Act, UNESCO, OECD, etc."),

      // Esportare il preventivo
      heading("Come esportare il preventivo FEM", HeadingLevel.HEADING_1),
      txt("Nel tab Budget, nella sezione \u201cPreventivo FEM\u201d:"),
      boldInline([{ text: "\u201cScarica .docx\u201d", bold: true }, { text: " \u2192 Word su carta intestata FEM, pronto da inviare alla scuola", bold: false }]),
      boldInline([{ text: "\u201cScarica .xlsx\u201d", bold: true }, { text: " \u2192 Excel con dettaglio corsi e costi", bold: false }]),
      spacer(80),
      txt("Il preventivo include:"),
      txt("Titolo corso, tipologia, breve descrizione, ore", { bullet: true }),
      txt("Prezzo senza IVA per la formazione (esente IVA art. 10)", { bullet: true }),
      txt("Prezzo licenze con IVA 22% scorporata", { bullet: true }),
      txt("Termini di esecuzione e validit\u00e0 (60 giorni)", { bullet: true }),

      // Tabella vincoli
      heading("Cose importanti da ricordare", HeadingLevel.HEADING_1),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [3000, 6026],
        rows: tableData.map((row, i) =>
          new TableRow({
            children: [
              makeCell(row[0], 3000, { bold: true, shading: i === 0 ? "2563EB" : undefined }),
              makeCell(row[1], 6026, { shading: i === 0 ? "2563EB" : undefined }),
            ],
          })
        ),
      }),

      // Privacy
      heading("I dati sono sicuri?", HeadingLevel.HEADING_1),
      txt("S\u00ec. Tutto resta nel browser della persona che usa il tool. Non c\u2019\u00e8 nessun server, nessun database, nessun dato viene trasmesso. Se cancelli i dati del browser, i progetti vengono persi."),

      // Problemi
      heading("Problemi?", HeadingLevel.HEADING_1),
      boldInline([{ text: "Pagina bianca", bold: true }, { text: ": ricarica con Cmd+Shift+R (hard refresh)", bold: false }]),
      boldInline([{ text: "Dati persi", bold: true }, { text: ": i progetti sono nel localStorage \u2014 se cambi browser o lo pulisci, riparti da zero", bold: false }]),
      boldInline([{ text: "Preventivo Word formattato male", bold: true }, { text: ": assicurati di aprirlo con Word (non Google Docs o Pages)", bold: false }]),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/ds/Documents/claude_SPM1/ai-school-project-planner/Guida-Sales-AISchoolPlanner.docx", buffer);
  console.log("Done!");
});
