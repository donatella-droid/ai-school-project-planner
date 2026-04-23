import type { SchoolProject } from '@/stores/project-store'
import { MODALITY_LABELS, TARGET_LABELS } from '@/stores/project-store'
import { PROVINCES } from '@/lib/provinces'
import { costoDirettoCorso, fmtEur } from '@/lib/costs'
import { CATALOG } from '@/lib/catalog'
import { FEM_PRODUCTS } from '@/lib/fem-products'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, TableLayoutType } from 'docx'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface Props {
  project: SchoolProject
}

const IVA_RATE = 0.22

function scorporaIVA(prezzoIvato: number) {
  const imponibile = prezzoIvato / (1 + IVA_RATE)
  const iva = prezzoIvato - imponibile
  return { imponibile, iva, totale: prezzoIvato }
}

function getAbstract(catalogId: string | null): string {
  if (!catalogId) return ''
  const course = CATALOG.find((c) => c.id === catalogId)
  return course?.abstract ?? ''
}

function shortAbstract(text: string, maxLen = 150): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen).replace(/\s+\S*$/, '') + '...'
}

export function FemQuote({ project }: Props) {
  const femCourses = project.courses.filter((c) => c.catalogId !== null)

  const femTechNames = new Set(FEM_PRODUCTS.map((p) => p.name))
  const includedFemTech = project.technologies.filter(
    (t) => t.included && t.category === 'platform-fem' && femTechNames.has(t.name)
  )
  const femTechWithPrices = includedFemTech.map((t) => {
    const product = FEM_PRODUCTS.find((p) => p.name === t.name)
    return {
      code: product?.code ?? '',
      name: t.name,
      description: product?.description ?? '',
      priceIvato: product?.price ?? 0,
      ...scorporaIVA(product?.price ?? 0),
    }
  })

  const { customCosts } = project
  const totaleCustomCosts = customCosts.reduce((s, c) => s + c.amount, 0)

  const totaleCorsiFem = femCourses.reduce((s, c) => s + costoDirettoCorso(c.type, c.hours), 0)
  const totaleTechImponibile = femTechWithPrices.reduce((s, t) => s + t.imponibile, 0)
  const totaleTechIva = femTechWithPrices.reduce((s, t) => s + t.iva, 0)
  const totaleTechIvato = femTechWithPrices.reduce((s, t) => s + t.totale, 0)
  const totalePreventivo = totaleCorsiFem + totaleTechImponibile + totaleCustomCosts
  const totaleConIva = totaleCorsiFem + totaleTechIvato + totaleCustomCosts

  // ─── XLSX Export ───
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new()
    const rows: (string | number)[][] = [
      ['PREVENTIVO FEM — Future Education Modena'],
      ['Per', project.schoolName],
      ['Provincia', project.provincia ? `${project.provincia} — ${PROVINCES.find((p) => p.sigla === project.provincia)?.provincia ?? ''}` : '—'],
      ['Progetto', project.projectTitle],
      ['Codice commessa', project.commessaCode || '—'],
      ['Data', new Date().toLocaleDateString('it-IT')],
      [],
      ['FORMAZIONE'],
      ['Codice', 'Titolo corso', 'Tipologia', 'Modalità', 'Target', 'Estate', 'Descrizione', 'Ore', 'Partecipanti', 'Imponibile (no IVA)'],
    ]

    for (const c of femCourses) {
      const tipo = c.type === 'P'
        ? (c.isFormazioneFormatori ? 'Percorso (P) — Formazione formatori' : 'Percorso (P)')
        : 'Laboratorio (L)'
      const catalogCode = CATALOG.find((cc) => cc.id === c.catalogId)?.code ?? ''
      const codice = catalogCode ? `${catalogCode}-${c.type}` : ''
      rows.push([
        codice,
        c.name,
        tipo,
        MODALITY_LABELS[c.modality],
        TARGET_LABELS[c.targetAudience],
        c.summerExecution ? 'Sì' : 'No',
        shortAbstract(getAbstract(c.catalogId)),
        c.hours,
        c.participants,
        costoDirettoCorso(c.type, c.hours),
      ])
    }
    rows.push(['', '', '', '', '', '', '', '', 'Subtotale formazione', totaleCorsiFem])
    rows.push(['', '', '', '', '', '', '', '', '', '(esente IVA art. 10 DPR 633/72)'])
    rows.push([])

    if (femTechWithPrices.length > 0) {
      rows.push(['PIATTAFORME E LICENZE'])
      rows.push(['Codice', 'Prodotto', 'Descrizione', '', 'Imponibile', 'IVA 22%', 'Totale IVA incl.'])
      for (const t of femTechWithPrices) {
        rows.push([t.code, t.name, t.description, '', t.imponibile, t.iva, t.totale])
      }
      rows.push(['', '', '', 'Subtotale licenze', totaleTechImponibile, totaleTechIva, totaleTechIvato])
      rows.push([])
    }

    if (customCosts.length > 0) {
      rows.push(['VOCI AGGIUNTIVE'])
      rows.push(['', 'Voce', '', '', '', '', 'Importo'])
      for (const c of customCosts) {
        rows.push(['', c.title, '', '', '', '', c.amount])
      }
      rows.push(['', '', '', '', 'Subtotale voci aggiuntive', '', totaleCustomCosts])
      rows.push([])
    }

    rows.push([])
    rows.push(['', '', '', '', 'TOTALE IMPONIBILE', '', totalePreventivo])
    if (totaleTechIva > 0) {
      rows.push(['', '', '', '', 'IVA 22% (solo licenze)', '', totaleTechIva])
      rows.push(['', '', '', '', 'TOTALE CON IVA', '', totaleConIva])
    }

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 16 }, { wch: 45 }, { wch: 35 }, { wch: 50 }, { wch: 8 }, { wch: 14 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Preventivo FEM')

    XLSX.writeFile(wb, `preventivo-fem-${project.schoolName.replace(/\s+/g, '-').toLowerCase()}.xlsx`)
  }

  // ─── DOCX Export ───
  const handleExportDocx = async () => {
    const F = 'Atkinson Hyperlegible'
    const thinBorder = { top: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' } }
    const noBorder = { top: { style: BorderStyle.NONE, size: 0, color: 'ffffff' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'ffffff' }, left: { style: BorderStyle.NONE, size: 0, color: 'ffffff' }, right: { style: BorderStyle.NONE, size: 0, color: 'ffffff' } }

    type BorderSide = { style: (typeof BorderStyle)[keyof typeof BorderStyle]; size: number; color: string }
    type Borders = { top: BorderSide; bottom: BorderSide; left: BorderSide; right: BorderSide }

    const mkCell = (text: string, pctWidth: number, opts?: { bold?: boolean; italic?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; color?: string; fontSize?: number; borders?: Borders; shading?: string }) =>
      new TableCell({
        width: { size: pctWidth, type: WidthType.PERCENTAGE },
        borders: opts?.borders ?? thinBorder,
        ...(opts?.shading ? { shading: { fill: opts.shading } } : {}),
        children: [new Paragraph({
          alignment: opts?.align ?? AlignmentType.LEFT,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text, bold: opts?.bold, italics: opts?.italic, size: opts?.fontSize ?? 20, font: F, color: opts?.color })],
        })],
      })

    const hdr = (text: string, pctWidth: number) => mkCell(text, pctWidth, { bold: true, fontSize: 18, shading: 'f0f0f0' })

    const spacer = (n = 200) => new Paragraph({ spacing: { before: n, after: n }, children: [] })
    const txt = (t: string, opts?: { bold?: boolean; size?: number; color?: string; italic?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacing?: number }) =>
      new Paragraph({ alignment: opts?.align, spacing: { after: opts?.spacing ?? 40 }, children: [new TextRun({ text: t, font: F, size: opts?.size ?? 22, bold: opts?.bold, color: opts?.color, italics: opts?.italic })] })

    const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

    const docChildren: (Paragraph | Table)[] = [
      // Extra space after header
      spacer(500),

      // PREVENTIVO — big title centered
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: 'PREVENTIVO', bold: true, size: 52, font: F })],
      }),
      // DM 219 reference
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: 'Offerta formativa ai sensi del DM 219/2025 — PNRR Missione 4, Investimento 2.1', size: 18, font: F, color: '666666' })],
      }),

      // Project info
      txt(`Per: ${project.schoolName}`, { size: 22 }),
      ...(project.provincia ? [txt(`Provincia: ${project.provincia} — ${PROVINCES.find((p) => p.sigla === project.provincia)?.provincia ?? ''}`, { size: 22 })] : []),
      txt(`Progetto: ${project.projectTitle}`, { size: 22 }),
      ...(project.commessaCode ? [txt(`Codice commessa: ${project.commessaCode}`, { size: 22 })] : []),
      txt(`Data: ${today}`, { size: 22 }),
      spacer(200),
    ]

    // ── Formazione ──
    if (femCourses.length > 0) {
      const courseRows = femCourses.flatMap((c) => {
        const tipo = c.type === 'P' ? (c.isFormazioneFormatori ? 'Percorso (P) — Form. formatori' : 'Percorso (P)') : 'Laboratorio (L)'
        const abstract = shortAbstract(getAbstract(c.catalogId), 200)
        const meta = `Modalità: ${MODALITY_LABELS[c.modality]} · Target: ${TARGET_LABELS[c.targetAudience]}${c.summerExecution ? ' · Esecuzione estiva' : ''}`
        return [
          new TableRow({ cantSplit: true, children: [
            mkCell(c.name, 38, { bold: true }),
            mkCell(tipo, 19),
            mkCell(`${c.hours}h`, 7, { align: AlignmentType.CENTER }),
            mkCell(`${c.participants}`, 11, { align: AlignmentType.CENTER }),
            mkCell(fmtEur(costoDirettoCorso(c.type, c.hours)), 25, { align: AlignmentType.RIGHT }),
          ] }),
          new TableRow({ cantSplit: true, children: [
            new TableCell({
              columnSpan: 5,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: thinBorder,
              children: [
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [new TextRun({ text: meta, size: 16, font: F, bold: true, color: '555555' })],
                }),
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [new TextRun({ text: abstract, size: 16, font: F, italics: true, color: '888888' })],
                }),
              ],
            }),
          ] }),
        ]
      })

      docChildren.push(
        txt('Formazione', { bold: true, size: 28 }),
        spacer(80),
        new Table({
          layout: TableLayoutType.FIXED,
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [3800, 1900, 700, 1100, 2500],
          rows: [
            new TableRow({ cantSplit: true, children: [hdr('Corso', 38), hdr('Tipologia', 19), hdr('Ore', 7), hdr('Partecipanti', 11), hdr('Imponibile', 25)] }),
            ...courseRows,
            new TableRow({ cantSplit: true, children: [
              new TableCell({ columnSpan: 4, width: { size: 75, type: WidthType.PERCENTAGE }, borders: thinBorder, children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: 'Subtotale formazione', bold: true, size: 20, font: F })] }),
              ] }),
              mkCell(fmtEur(totaleCorsiFem), 25, { bold: true, align: AlignmentType.RIGHT }),
            ] }),
          ],
        }),
        txt('Formazione esente IVA ai sensi dell\'art. 10, comma 1, n. 20 del DPR 633/72', { size: 16, italic: true, color: '888888' }),
        spacer(200),
      )
    }

    // ── Licenze ──
    if (femTechWithPrices.length > 0) {
      docChildren.push(
        txt('Piattaforme e Licenze', { bold: true, size: 28 }),
        spacer(80),
        new Table({
          layout: TableLayoutType.FIXED,
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [1500, 2000, 4000, 1250, 1250],
          rows: [
            new TableRow({ cantSplit: true, children: [hdr('Codice', 15), hdr('Prodotto', 20), hdr('Descrizione', 40), hdr('Imponibile', 12), hdr('IVA 22%', 13)] }),
            ...femTechWithPrices.map((t) =>
              new TableRow({ cantSplit: true, children: [
                mkCell(t.code, 15, { fontSize: 16 }),
                mkCell(t.name, 20, { bold: true }),
                mkCell(t.description, 40, { fontSize: 18 }),
                mkCell(fmtEur(t.imponibile), 12, { align: AlignmentType.RIGHT }),
                mkCell(fmtEur(t.iva), 13, { align: AlignmentType.RIGHT }),
              ] })
            ),
            new TableRow({ cantSplit: true, children: [
              new TableCell({ columnSpan: 3, width: { size: 75, type: WidthType.PERCENTAGE }, borders: thinBorder, children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: 'Subtotale licenze', bold: true, size: 20, font: F })] }),
              ] }),
              mkCell(fmtEur(totaleTechImponibile), 12, { bold: true, align: AlignmentType.RIGHT }),
              mkCell(fmtEur(totaleTechIva), 13, { bold: true, align: AlignmentType.RIGHT }),
            ] }),
          ],
        }),
        spacer(200),
      )
    }

    // ── Voci aggiuntive ──
    if (customCosts.length > 0) {
      docChildren.push(
        txt('Voci aggiuntive', { bold: true, size: 28 }),
        spacer(80),
        new Table({
          layout: TableLayoutType.FIXED,
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [7000, 3000],
          rows: [
            new TableRow({ cantSplit: true, children: [hdr('Voce', 70), hdr('Importo', 30)] }),
            ...customCosts.map((c) =>
              new TableRow({ cantSplit: true, children: [
                mkCell(c.title, 70),
                mkCell(fmtEur(c.amount), 30, { align: AlignmentType.RIGHT }),
              ] })
            ),
            new TableRow({ cantSplit: true, children: [
              mkCell('Subtotale voci aggiuntive', 70, { bold: true, align: AlignmentType.RIGHT }),
              mkCell(fmtEur(totaleCustomCosts), 30, { bold: true, align: AlignmentType.RIGHT }),
            ] }),
          ],
        }),
        spacer(200),
      )
    }

    // ── Totale ──
    const totalRows = [
      new TableRow({ children: [
        mkCell('Totale imponibile', 70, { bold: true, align: AlignmentType.RIGHT, borders: noBorder, fontSize: 24 }),
        mkCell(fmtEur(totalePreventivo), 30, { bold: true, align: AlignmentType.RIGHT, borders: noBorder, fontSize: 24 }),
      ] }),
    ]
    if (totaleTechIva > 0) {
      totalRows.push(
        new TableRow({ children: [
          mkCell('IVA 22% (solo licenze)', 70, { align: AlignmentType.RIGHT, borders: noBorder, color: '666666' }),
          mkCell(fmtEur(totaleTechIva), 30, { align: AlignmentType.RIGHT, borders: noBorder, color: '666666' }),
        ] }),
        new TableRow({ children: [
          mkCell('TOTALE CON IVA', 70, { bold: true, align: AlignmentType.RIGHT, borders: noBorder, fontSize: 26 }),
          mkCell(fmtEur(totaleConIva), 30, { bold: true, align: AlignmentType.RIGHT, borders: noBorder, fontSize: 26 }),
        ] }),
      )
    }

    docChildren.push(
      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [7000, 3000],
        rows: totalRows,
      }),
      spacer(400),

      // Termini di esecuzione
      txt('Termini di esecuzione', { bold: true, size: 20 }),
      txt('Le attività formative saranno erogate secondo il cronoprogramma concordato con l\'istituzione scolastica, in coerenza con le tempistiche previste dal progetto approvato sulla piattaforma "Futura PNRR — Gestione Progetti".', { size: 18, color: '444444' }),
      ...(femCourses.some((c) => c.summerExecution)
        ? [txt('Alcuni corsi sono previsti in esecuzione estiva, come indicato in tabella.', { size: 18, color: '444444', italic: true })]
        : []),
      spacer(200),

      // Condizioni di pagamento
      txt('Condizioni di pagamento', { bold: true, size: 20 }),
      txt('30% dell\'importo alla conferma dell\'incarico, con pagamento entro 30 giorni Data Fattura', { size: 18, color: '444444' }),
      txt('70% dell\'importo al termine delle attività, con pagamento entro 30 giorni Data Fattura', { size: 18, color: '444444' }),
      spacer(200),

      // Validità preventivo
      txt('Validità del preventivo', { bold: true, size: 20 }),
      txt('Il presente preventivo ha validità di 60 giorni dalla data di emissione. Decorso tale termine, FEM si riserva il diritto di aggiornare le condizioni economiche.', { size: 18, color: '444444' }),
      spacer(200),

      // Data e firma
      txt(`${project.schoolName ? project.schoolName + ', ' : ''}${today}`, { size: 20 }),
      spacer(400),
      txt('Future Education Modena', { bold: true, size: 20 }),
      txt('Centro di ricerca e sviluppo per l\'innovazione educativa — Ente accreditato MIUR', { size: 16, italic: true, color: '888888' }),
    )

    const doc = new Document({ sections: [{ children: docChildren }] })
    const generatedBlob = await Packer.toBlob(doc)

    // Merge with FEM letterhead template: take header/footer/images from template
    try {
      const templateResponse = await fetch('/fem-letterhead.docx')
      const templateBuffer = await templateResponse.arrayBuffer()
      const templateZip = await JSZip.loadAsync(templateBuffer)
      const generatedZip = await JSZip.loadAsync(generatedBlob)

      // Copy header, footer, and media from template into generated doc
      const filesToCopy = [
        'word/header1.xml',
        'word/footer1.xml',
        'word/media/image1.png',
      ]
      for (const path of filesToCopy) {
        const file = templateZip.file(path)
        if (file) {
          const content = await file.async('arraybuffer')
          generatedZip.file(path, content)
        }
      }

      // Copy header/footer relationships from template
      const templateRelsFiles = ['word/_rels/header1.xml.rels', 'word/_rels/footer1.xml.rels']
      for (const path of templateRelsFiles) {
        const file = templateZip.file(path)
        if (file) {
          const content = await file.async('arraybuffer')
          generatedZip.file(path, content)
        }
      }

      // Update document.xml.rels to reference header and footer
      const relsFile = generatedZip.file('word/_rels/document.xml.rels')
      if (relsFile) {
        let relsXml = await relsFile.async('string')
        // Add header and footer references if not present
        if (!relsXml.includes('header1.xml')) {
          relsXml = relsXml.replace(
            '</Relationships>',
            '<Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>' +
            '<Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' +
            '</Relationships>'
          )
          generatedZip.file('word/_rels/document.xml.rels', relsXml)
        }
      }

      // Update document.xml to reference header/footer in section properties
      const docXmlFile = generatedZip.file('word/document.xml')
      if (docXmlFile) {
        let docXml = await docXmlFile.async('string')
        // Add headerReference and footerReference to sectPr
        if (!docXml.includes('headerReference')) {
          docXml = docXml.replace(
            /<w:sectPr/,
            '<w:sectPr'
          )
          docXml = docXml.replace(
            /(<w:sectPr[^>]*>)/,
            '$1<w:headerReference w:type="default" r:id="rIdHeader1"/><w:footerReference w:type="default" r:id="rIdFooter1"/>'
          )
          // Also update margins to match template (top: 1530, bottom: 914)
          docXml = docXml.replace(
            /<w:pgMar[^/]*\/>/,
            '<w:pgMar w:top="2410" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>'
          )
          generatedZip.file('word/document.xml', docXml)
        }
      }

      // Add [Content_Types] entries for header/footer if missing
      const contentTypesFile = generatedZip.file('[Content_Types].xml')
      if (contentTypesFile) {
        let ct = await contentTypesFile.async('string')
        if (!ct.includes('header1.xml')) {
          ct = ct.replace(
            '</Types>',
            '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' +
            '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' +
            '</Types>'
          )
        }
        if (!ct.includes('image/png')) {
          ct = ct.replace(
            '</Types>',
            '<Default Extension="png" ContentType="image/png"/></Types>'
          )
        }
        generatedZip.file('[Content_Types].xml', ct)
      }

      const finalBlob = await generatedZip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      saveAs(finalBlob, `preventivo-fem-${project.schoolName.replace(/\s+/g, '-').toLowerCase()}.docx`)
    } catch {
      // Fallback: save without letterhead if template not available
      saveAs(generatedBlob, `preventivo-fem-${project.schoolName.replace(/\s+/g, '-').toLowerCase()}.docx`)
    }
  }

  if (femCourses.length === 0 && femTechWithPrices.length === 0 && customCosts.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Preventivo FEM</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Riepilogo dell'offerta FEM: formazione e piattaforme con dettaglio IVA.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportDocx}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Scarica .docx
          </button>
          <button
            onClick={handleExportExcel}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Scarica .xlsx
          </button>
        </div>
      </div>

      {/* Meta */}
      {(project.commessaCode || project.provincia) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-muted/30 px-3 py-2 text-xs">
          {project.provincia && (
            <span>
              <span className="text-muted-foreground">Provincia: </span>
              <span className="font-medium">
                {project.provincia} — {PROVINCES.find((p) => p.sigla === project.provincia)?.provincia}
              </span>
            </span>
          )}
          {project.commessaCode && (
            <span>
              <span className="text-muted-foreground">Commessa: </span>
              <span className="font-mono font-medium">{project.commessaCode}</span>
            </span>
          )}
        </div>
      )}

      {/* FEM Courses */}
      {femCourses.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Formazione
          </h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">Corso</th>
                  <th className="px-3 py-2 text-left font-medium">Tipologia</th>
                  <th className="px-3 py-2 text-right font-medium">Ore</th>
                  <th className="px-3 py-2 text-right font-medium">Partecipanti</th>
                  <th className="px-3 py-2 text-right font-medium">Imponibile</th>
                </tr>
              </thead>
              <tbody>
                {femCourses.map((c) => {
                  const tipo = c.type === 'P'
                    ? (c.isFormazioneFormatori ? 'Percorso — Form. formatori' : 'Percorso')
                    : 'Laboratorio'
                  const abstract = shortAbstract(getAbstract(c.catalogId))
                  return (
                    <tr key={c.id} className="border-t border-border align-top">
                      <td className="px-3 py-2">
                        <div className="font-medium">{c.name}</div>
                        <div className="mt-0.5 flex flex-wrap gap-1 text-[10px]">
                          <span className="rounded bg-muted px-1.5 py-0.5">{MODALITY_LABELS[c.modality]}</span>
                          <span className="rounded bg-muted px-1.5 py-0.5">{TARGET_LABELS[c.targetAudience]}</span>
                          {c.summerExecution && (
                            <span className="rounded bg-area-1/10 px-1.5 py-0.5 font-medium text-area-1">Estate</span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{abstract}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          c.type === 'P' ? 'bg-area-2/10 text-area-2' : 'bg-area-3/10 text-area-3'
                        }`}>
                          {tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{c.hours}h</td>
                      <td className="px-3 py-2 text-right">{c.participants}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtEur(costoDirettoCorso(c.type, c.hours))}</td>
                    </tr>
                  )
                })}
                <tr className="border-t border-border bg-muted/50 font-medium">
                  <td colSpan={4} className="px-3 py-2 text-right text-xs">Subtotale formazione</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtEur(totaleCorsiFem)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground italic">
            Formazione esente IVA ai sensi dell'art. 10, comma 1, n. 20 del DPR 633/72
          </p>
        </div>
      )}

      {/* FEM Technologies */}
      {femTechWithPrices.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Piattaforme e Licenze
          </h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">Codice</th>
                  <th className="px-3 py-2 text-left font-medium">Prodotto</th>
                  <th className="px-3 py-2 text-left font-medium">Descrizione</th>
                  <th className="px-3 py-2 text-right font-medium">Imponibile</th>
                  <th className="px-3 py-2 text-right font-medium">IVA 22%</th>
                </tr>
              </thead>
              <tbody>
                {femTechWithPrices.map((t) => (
                  <tr key={t.name} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{t.code}</td>
                    <td className="px-3 py-2 font-medium">{t.name}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{t.description}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtEur(t.imponibile)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtEur(t.iva)}</td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-muted/50 font-medium">
                  <td colSpan={3} className="px-3 py-2 text-right text-xs">Subtotale licenze</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtEur(totaleTechImponibile)}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtEur(totaleTechIva)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom costs */}
      {customCosts.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Voci aggiuntive
          </h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">Voce</th>
                  <th className="px-3 py-2 text-right font-medium">Importo</th>
                </tr>
              </thead>
              <tbody>
                {customCosts.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{c.title}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtEur(c.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-muted/50 font-medium">
                  <td className="px-3 py-2 text-right text-xs">Subtotale voci aggiuntive</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtEur(totaleCustomCosts)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Totale imponibile</span>
          <span className="text-lg font-bold">{fmtEur(totalePreventivo)}</span>
        </div>
        {totaleTechIva > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>IVA 22% (solo licenze)</span>
              <span>{fmtEur(totaleTechIva)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-primary/20 pt-1">
              <span className="text-sm font-semibold">Totale con IVA</span>
              <span className="text-xl font-bold">{fmtEur(totaleConIva)}</span>
            </div>
          </>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">
        I costi di formazione corrispondono ai costi diretti di personale (formatore + tutor) previsti dalle UCS del bando DM 219/2025.
      </p>
    </div>
  )
}
