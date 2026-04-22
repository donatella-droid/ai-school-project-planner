export interface FemProduct {
  id: string
  code: string
  name: string
  description: string
  price: number
  priceLabel: string
}

export const FEM_PRODUCTS: FemProduct[] = [
  {
    id: 'linda-1y',
    code: 'LCN_LIN_001',
    name: 'LINDA — 1 anno',
    description: 'Pacchetto full, tutta scuola (docenti e studenti)',
    price: 3000,
    priceLabel: '3.000 € (IVA inclusa)',
  },
  {
    id: 'linda-3y',
    code: 'LCN_LIN_003',
    name: 'LINDA — 3 anni',
    description: 'Pacchetto full, tutta scuola (docenti e studenti)',
    price: 7900,
    priceLabel: '7.900 € (IVA inclusa)',
  },
  {
    id: 'ai4l-1y',
    code: 'LCN_AI4L_001',
    name: 'AI for Learning — 1 anno',
    description: 'Pacchetto full, tutta scuola (docenti e studenti) — 100 crediti a docente',
    price: 3600,
    priceLabel: '3.600 € (IVA inclusa)',
  },
  {
    id: 'ai4l-2y',
    code: 'LCN_AI4L_002',
    name: 'AI for Learning — 2 anni',
    description: 'Pacchetto full, tutta scuola (docenti e studenti) — 100 crediti a docente',
    price: 6900,
    priceLabel: '6.900 € (IVA inclusa)',
  },
  {
    id: 'ai4l-3y',
    code: 'LCN_AI4L_003',
    name: 'AI for Learning — 3 anni',
    description: 'Pacchetto full, tutta scuola (docenti e studenti) — 100 crediti a docente',
    price: 9600,
    priceLabel: '9.600 € (IVA inclusa)',
  },
]
