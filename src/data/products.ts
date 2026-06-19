export interface ProductMeta {
  id: 'leap' | 'future'
  name: string
  termMonths: number
  monthlyMax: number // 월 납입 한도(원)
}

export const PRODUCTS: Record<'leap' | 'future', ProductMeta> = {
  leap: { id: 'leap', name: '청년도약계좌', termMonths: 60, monthlyMax: 700_000 },
  future: { id: 'future', name: '청년미래적금', termMonths: 36, monthlyMax: 500_000 },
}
