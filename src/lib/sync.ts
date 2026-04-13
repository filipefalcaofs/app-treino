import { db, type SyncQueueItem } from './db'
import { supabase } from './supabase'

const SYNCED_TABLES = [
  'profiles',
  'workouts',
  'workout_exercises',
  'cycles',
  'cycle_days',
  'training_sessions',
  'training_sets',
  'running_logs',
  'progress_photos',
] as const

type SyncedTable = (typeof SYNCED_TABLES)[number]

export async function enqueueOperation(
  table: SyncedTable,
  operation: SyncQueueItem['operation'],
  recordId: string,
  data: Record<string, unknown> | null,
) {
  await db.sync_queue.add({
    table_name: table,
    operation,
    record_id: recordId,
    data,
    created_at: new Date().toISOString(),
  })
}

export async function processQueue(): Promise<{ processed: number; failed: number }> {
  const items = await db.sync_queue.orderBy('id').toArray()
  let processed = 0
  let failed = 0

  for (const item of items) {
    try {
      const success = await executeRemoteOperation(item)
      if (success) {
        await db.sync_queue.delete(item.id!)
        processed++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { processed, failed }
}

async function executeRemoteOperation(item: SyncQueueItem): Promise<boolean> {
  const { table_name, operation, record_id, data } = item

  switch (operation) {
    case 'insert': {
      const { error } = await supabase.from(table_name).insert(data!)
      return !error
    }
    case 'update': {
      const { error } = await supabase.from(table_name).update(data!).eq('id', record_id)
      return !error
    }
    case 'delete': {
      const { error } = await supabase.from(table_name).delete().eq('id', record_id)
      return !error
    }
    default:
      return false
  }
}

export async function syncFromServer(userId: string) {
  const userTables: SyncedTable[] = [
    'workouts',
    'cycles',
    'training_sessions',
    'running_logs',
    'progress_photos',
  ]

  const childTables: { table: SyncedTable; parentTable: SyncedTable; fk: string }[] = [
    { table: 'workout_exercises', parentTable: 'workouts', fk: 'workout_id' },
    { table: 'cycle_days', parentTable: 'cycles', fk: 'cycle_id' },
    { table: 'training_sets', parentTable: 'training_sessions', fk: 'session_id' },
  ]

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profile) {
      await db.profiles.put(profile)
    }

    for (const table of userTables) {
      const { data } = await supabase.from(table).select('*').eq('user_id', userId)
      if (data && data.length > 0) {
        await (db[table] as ReturnType<typeof db.table>).bulkPut(data)
      }
    }

    for (const { table, parentTable, fk } of childTables) {
      const parentIds = await (db[parentTable] as ReturnType<typeof db.table>).toCollection().primaryKeys()
      if (parentIds.length === 0) continue

      const { data } = await supabase.from(table).select('*').in(fk, parentIds)
      if (data && data.length > 0) {
        await (db[table] as ReturnType<typeof db.table>).bulkPut(data)
      }
    }
  } catch {
    // best-effort: falha silenciosa quando offline
  }
}

export async function getPendingCount(): Promise<number> {
  return db.sync_queue.count()
}
