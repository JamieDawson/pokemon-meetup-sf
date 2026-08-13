export type Pokemon = {
  dex: number
  name: string
  available: boolean
  imageUrl: string
}

export type Cosplayer = {
  pokemonName: string
  preferredName: string
  igTag: string
}

export type ClaimedPokemon = Pokemon & {
  cosplayers: Cosplayer[]
}

const AVAILABILITY_SHEET_ID = '1hSrs56BXU-VedniroXwDoZFQo4EWUaOwDArTPQbRgKw'
const COSPLAYERS_SHEET_ID = '1gGgvkBuxFtDgiyk5ExJrWmSIFUKwFf2Mhzj0zaIK0mQ'

const AVAILABILITY_OPENSHEET = `https://opensheet.elk.sh/${AVAILABILITY_SHEET_ID}/Sheet1`
const COSPLAYERS_OPENSHEET = `https://opensheet.elk.sh/${COSPLAYERS_SHEET_ID}/1`

const LOCAL_AVAILABILITY_CSV = '/api/sheet.csv'
const LOCAL_COSPLAYERS_CSV = '/api/cosplayers.csv'

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

export function normalizePokemonName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .replace(/[^a-z0-9]/g, '')
}

function parsePokemonRow(row: Record<string, string>): Pokemon | null {
  const name = pick(row, /^pok/i, /name/i)
  const imageUrl = pick(row, /image/i, /url/i)
  const dexRaw = pick(row, /dex|national|#/i)
  const availableRaw = pick(row, /available/i)

  if (!name || !imageUrl) return null

  return {
    dex: Number.parseInt(dexRaw.replace(/\D/g, ''), 10) || 0,
    name,
    available: parseAvailable(availableRaw),
    imageUrl,
  }
}

function parseCosplayerRow(row: Record<string, string>): Cosplayer | null {
  const pokemonName = pick(row, /pok.*train/i, /^pok/i, /trainor|trainer/i)
  const preferredName = pick(row, /preferred/i, /^name$/i)
  const igTag = pick(row, /ig|instagram|tag/i)

  if (!pokemonName) return null
  if (!preferredName && !igTag) return null

  return {
    pokemonName,
    preferredName: preferredName || igTag,
    igTag,
  }
}

function parseCsv(text: string): string[][] {
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

  return rows
}

function rowsToRecords(rows: string[][], headerIndex = 0): Record<string, string>[] {
  if (rows.length <= headerIndex + 1) return []

  const headers = rows[headerIndex].map((header) => header.trim())
  return rows.slice(headerIndex + 1).map((cells) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      if (!header) return
      record[header] = (cells[index] ?? '').trim()
    })
    return record
  })
}

function findHeaderIndex(rows: string[][], ...needles: RegExp[]): number {
  const index = rows.findIndex((row) =>
    needles.every((needle) => row.some((cell) => needle.test(cell))),
  )
  return index >= 0 ? index : 0
}

function toPokemonList(rows: Record<string, string>[]): Pokemon[] {
  return rows
    .map(parsePokemonRow)
    .filter((pokemon): pokemon is Pokemon => pokemon !== null)
    .sort((a, b) => a.dex - b.dex)
}

async function fetchJsonSheet(url: string): Promise<Record<string, string>[]> {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Could not load sheet (${response.status})`)
  }
  return (await response.json()) as Record<string, string>[]
}

async function fetchCsvSheet(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Could not load sheet (${response.status})`)
  }
  return response.text()
}

export async function fetchAllPokemon(): Promise<Pokemon[]> {
  try {
    const text = await fetchCsvSheet(LOCAL_AVAILABILITY_CSV)
    return toPokemonList(rowsToRecords(parseCsv(text), 0))
  } catch {
    return toPokemonList(await fetchJsonSheet(AVAILABILITY_OPENSHEET))
  }
}

export async function fetchAvailablePokemon(): Promise<Pokemon[]> {
  return (await fetchAllPokemon()).filter((pokemon) => pokemon.available)
}

async function fetchCosplayers(): Promise<Cosplayer[]> {
  try {
    const text = await fetchCsvSheet(LOCAL_COSPLAYERS_CSV)
    const rows = parseCsv(text)
    const headerIndex = findHeaderIndex(rows, /pok/i, /preferred|name/i)
    return rowsToRecords(rows, headerIndex)
      .map(parseCosplayerRow)
      .filter((cosplayer): cosplayer is Cosplayer => cosplayer !== null)
  } catch {
    // opensheet may use a messy first row as keys — still try flexible pick()
    const rows = await fetchJsonSheet(COSPLAYERS_OPENSHEET)
    return rows
      .map(parseCosplayerRow)
      .filter((cosplayer): cosplayer is Cosplayer => cosplayer !== null)
  }
}

export async function fetchClaimedPokemon(): Promise<ClaimedPokemon[]> {
  const [allPokemon, cosplayers] = await Promise.all([
    fetchAllPokemon(),
    fetchCosplayers(),
  ])

  const unavailable = allPokemon.filter((pokemon) => !pokemon.available)
  const byName = new Map<string, Cosplayer[]>()

  for (const cosplayer of cosplayers) {
    const key = normalizePokemonName(cosplayer.pokemonName)
    const list = byName.get(key) ?? []
    list.push(cosplayer)
    byName.set(key, list)
  }

  // Only keep cosplayers whose Pokémon appear in the availability sheet
  return unavailable.map((pokemon) => ({
    ...pokemon,
    cosplayers: byName.get(normalizePokemonName(pokemon.name)) ?? [],
  }))
}
