export type Pokemon = {
  dex: number
  name: string
  available: boolean
  imageUrl: string
}

const SHEET_ID = '1hSrs56BXU-VedniroXwDoZFQo4EWUaOwDArTPQbRgKw'
const OPENSHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/Sheet1`
const LOCAL_CSV_URL = '/api/sheet.csv'

function pick(row: Record<string, string>, ...patterns: RegExp[]): string {
  const entries = Object.entries(row)
  for (const pattern of patterns) {
    const match = entries.find(([key]) => pattern.test(key))
    if (match?.[1]?.trim()) return match[1].trim()
  }
  return ''
}

function parseAvailable(value: string): boolean {
  return /^(true|yes|1)$/i.test(value.trim())
}

function parseRow(row: Record<string, string>): Pokemon | null {
  const name = pick(row, /^pok/i, /name/i)
  const imageUrl = pick(row, /image/i, /url/i)
  const dexRaw = pick(row, /dex|national|#/i)
  const availableRaw = pick(row, /available/i)

  if (!name || !imageUrl) return null

  return {
    dex: Number.parseInt(dexRaw, 10) || 0,
    name,
    available: parseAvailable(availableRaw),
    imageUrl,
  }
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++
      row.push(current)
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      current = ''
      continue
    }

    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  }

  if (rows.length < 2) return []

  const headers = rows[0].map((header) => header.trim())
  return rows.slice(1).map((cells) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      if (!header) return
      record[header] = (cells[index] ?? '').trim()
    })
    return record
  })
}

function toAvailablePokemon(rows: Record<string, string>[]): Pokemon[] {
  return rows
    .map(parseRow)
    .filter((pokemon): pokemon is Pokemon => pokemon !== null && pokemon.available)
    .sort((a, b) => a.dex - b.dex)
}

async function fetchFromLocalCsv(): Promise<Pokemon[]> {
  const response = await fetch(LOCAL_CSV_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Could not load roster (${response.status})`)
  }
  return toAvailablePokemon(parseCsv(await response.text()))
}

async function fetchFromOpenSheet(): Promise<Pokemon[]> {
  // Do not append query params — opensheet returns 400 for them.
  const response = await fetch(OPENSHEET_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Could not load roster (${response.status})`)
  }
  return toAvailablePokemon((await response.json()) as Record<string, string>[])
}

export async function fetchAvailablePokemon(): Promise<Pokemon[]> {
  try {
    return await fetchFromLocalCsv()
  } catch {
    return fetchFromOpenSheet()
  }
}
