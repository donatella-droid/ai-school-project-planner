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
    id: 'ai4l',
    name: 'AI for Learning',
    description: 'Pacchetto full, tutta scuola (docenti e studenti) — 100 crediti a docente',
    price: 3500,
    priceLabel: '3.500 € (IVA inclusa)',
  },
]
