import Dexie from 'dexie'

export const db = new Dexie('LiftTracker')

db.version(2).stores({
  sets: '++id, dayId, exo, serie, date, sessionId',
  sessions: '++id, dayId, date',
})

export async function saveSession(dayId, rows) {
  const date = new Date().toISOString().slice(0, 10)
  await db.transaction('rw', db.sessions, db.sets, async () => {
    const sessionId = await db.sessions.add({ dayId, date })
    const records = rows.map(r => ({ ...r, dayId, date, sessionId }))
    await db.sets.bulkAdd(records)
  })
}

export async function getLastSessionPerfs(dayId) {
  const lastSession = await db.sessions
    .where('dayId').equals(dayId)
    .reverse()
    .first()

  if (!lastSession) return {}

  const sets = await db.sets
    .where('sessionId').equals(lastSession.id)
    .toArray()

  const result = {}
  sets.forEach(s => {
    result[`${s.exo}|${s.serie}`] = { poids: s.poids, reps: s.reps }
  })
  return result
}

export async function getAllHistory() {
  const sessions = await db.sessions.orderBy('date').reverse().toArray()
  const result = []
  for (const session of sessions) {
    const sets = await db.sets.where('sessionId').equals(session.id).toArray()
    result.push({ ...session, sets })
  }
  return result
}

export async function getExoHistory(exoName) {
  const sets = await db.sets
    .where('exo').equals(exoName)
    .sortBy('date')
  return sets.map(s => ({ date: s.date, poids: parseFloat(s.poids) || 0, reps: parseInt(s.reps) || 0, serie: s.serie }))
}

export async function deleteSession(sessionId) {
  await db.transaction('rw', db.sessions, db.sets, async () => {
    await db.sets.where('sessionId').equals(sessionId).delete()
    await db.sessions.delete(sessionId)
  })
}
