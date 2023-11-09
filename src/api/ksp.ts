interface KspStockResponse {
  result: {
    [key: string]: {
      id: string
      name: string
      qnt: number
    }
  }
}

interface KspItem {
  brandName: string
  description: string
  img: string
  name: string
  price: number
  uin: number
  uinsql: string
}

interface KspCategoryResponse {
  result: {
    products_total: number
    next: number
    items: KspItem[]
  }
}

export interface KspPoint {
  key: string
  id: string
  nameEn: string
  nameHe: string
}

export async function checkStock(itemId: string, lang: 'en' | 'he' = 'en') {
  const data: KspStockResponse = await fetch(`https://ksp.co.il/m_action/api/mlay/${itemId}`, {
    headers: {
      Lang: lang,
    },
  }).then(res => res.json())

  return data.result
}

export async function listPoints() {
  const stockEn = await checkStock('268625', 'en') // iphone 15
  const stockHe = await checkStock('268625', 'he') // iphone 15

  const points: KspPoint[] = []

  for (const key of Object.keys(stockEn)) {
    points.push({
      key,
      id: stockEn[key].id,
      nameEn: stockEn[key].name,
      nameHe: stockHe[key].name,
    })
  }

  console.log(stockEn, stockHe, points)

  return points
}

export async function listProductInCategory(cat: string, page: number = 1) {
  const params = {
    page: page.toString(),
  }
  const url = new URL(`https://ksp.co.il/m_action/api/category/${cat}`)
  url.search = new URLSearchParams(params).toString()
  const data: KspCategoryResponse = await fetch(url.toString()).then(res => res.json())

  return data.result
}
