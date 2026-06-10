import * as lancedb from '@lancedb/lancedb'
import path from 'path'
import type { Chunk } from '@/types'
import { EMBEDDING_DIM } from './embeddings'

const DB_PATH = process.env.VECTOR_DB_PATH ?? path.join(process.cwd(), '.lancedb')

let tableCache: lancedb.Table | null = null

async function getTable(): Promise<lancedb.Table> {
  if (tableCache) return tableCache

  const db = await lancedb.connect(DB_PATH)
  const tables = await db.tableNames()

  if (tables.includes('chunks')) {
    tableCache = await db.openTable('chunks')
  } else {
    tableCache = await db.createTable('chunks', [
      {
        id: '__seed__',
        text: '',
        vector: new Array(EMBEDDING_DIM).fill(0),
        source: '',
        page: 0,
        chunkIndex: 0,
      },
    ])
    await tableCache.delete("id = '__seed__'")
  }

  return tableCache
}

export async function storeChunks(chunks: Chunk[]): Promise<void> {
  if (chunks.length === 0) return
  const table = await getTable()
  const rows = chunks.map((c) => ({
    id: c.id,
    text: c.text,
    vector: c.embedding,
    source: c.metadata.source,
    page: c.metadata.page,
    chunkIndex: c.metadata.chunkIndex,
  }))
  await table.add(rows)
}

export async function similaritySearch(
  queryEmbedding: number[],
  topK = 5
): Promise<{ text: string; source: string; score: number }[]> {
  const table = await getTable()
  const results = await table
    .vectorSearch(queryEmbedding)
    .limit(topK)
    .toArray()

  return results.map((r) => ({
    text: r.text as string,
    source: r.source as string,
    score: (r._distance as number) ?? 0,
  }))
}

export async function deleteBySource(source: string): Promise<void> {
  const table = await getTable()
  await table.delete(`source = '${source}'`)
}

export async function clearStore(): Promise<void> {
  tableCache = null
  const db = await lancedb.connect(DB_PATH)
  const tables = await db.tableNames()
  if (tables.includes('chunks')) {
    await db.dropTable('chunks')
  }
}
