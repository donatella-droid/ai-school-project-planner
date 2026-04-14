export interface FemProduct {
  id: string
  name: string
  description: string
  price: number
  priceLabel: string
}

export const FEM_PRODUCTS: FemProduct[] = [
  {
    id: 'linda-1y',
    name: 'LINDA — 1 anno',
    description: 'Pacchetto full, tutta scuola (docenti e studenti)',
    price: 3000,
    priceLabel: '3.000 € (IVA inclusa)',
  },
  {
    id: 'linda-3y',
    name: 'LINDA — 3 anni',
    description: 'Pacchetto full, tutta scuola (docenti e studenti)',
    price: 7900,
    priceLabel: '7.900 € (IVA inclusa)',
  },
  {
    id: 'ai4l-1y',
    name: 'AI for Learning — 1 anno',
    description: 'Pacchetto full, tutta scuola (docenti e studenti) — 100 crediti a docente',
    price: 3600,
    priceLabel: '3.600 € (IVA inclusa)',
  },
  {
    id: 'ai4l-2y',
    name: 'AI for Learning — 2 anni',
    description: 'Pacchetto full, tutta scuola (docenti e studenti) — 100 crediti a docente',
    price: 6900,
    priceLabel: '6.900 € (IVA inclusa)',
  },
  {
    id: 'ai4l-3y',
    name: 'AI for Learning — 3 anni',
    description: 'Pacchetto full, tutta scuola (docenti e studenti) — 100 crediti a docente',
    price: 9600,
    priceLabel: '9.600 € (IVA inclusa)',
  },
]
