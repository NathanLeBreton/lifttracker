import Dexie from 'dexie'

export const db = new Dexie('LiftTracker')

db.version(3).stores({
  sets: '++id, dayId, exo, serie, date, sessionId, bonus',
  sessions: '++id, dayId, date',
  notes: '++id, sessionId, exo',
})

export async function saveSession(dayId, rows, notes) {
  const date = new Date().toISOString().slice(0, 10)
  await db.transaction('rw', db.sessions, db.sets, db.notes, async () => {
    const sessionId = await db.sessions.add({ dayId, date })
    const records = rows.map(r => ({ ...r, dayId, date, sessionId }))
    await db.sets.bulkAdd(records)
    if (notes) {
      const noteRecords = Object.entries(notes)
        .filter(([, text]) => text && text.trim())
        .map(([exo, text]) => ({ sessionId, exo, text: text.trim() }))
      if (noteRecords.length > 0) await db.notes.bulkAdd(noteRecords)
    }
  })
}

export async function getLastSessionPerfs(dayId) {
  const lastSession = await db.sessions
    .where('dayId').equals(dayId)
    .reverse()
    .first()

  if (!lastSession) return { perfs: {}, notes: {}, bonusSets: {} }

  const sets = await db.sets
    .where('sessionId').equals(lastSession.id)
    .toArray()

  const notes = await db.notes
    .where('sessionId').equals(lastSession.id)
    .toArray()

  const perfs = {}
  const bonusSets = {} // exoName -> nb de séries bonus

  sets.forEach(s => {
    perfs[`${s.exo}|${s.serie}`] = { poids: s.poids, reps: s.reps, bonus: s.bonus || false }
    if (s.bonus) bonusSets[s.exo] = (bonusSets[s.exo] || 0) + 1
  })

  const notesMap = {}
  notes.forEach(n => { notesMap[n.exo] = n.text })

  return { perfs, notes: notesMap, bonusSets }
}

export async function getAllHistory() {
  const sessions = await db.sessions.orderBy('date').reverse().toArray()
  const result = []
  for (const session of sessions) {
    const sets = await db.sets.where('sessionId').equals(session.id).toArray()
    const notes = await db.notes.where('sessionId').equals(session.id).toArray()
    result.push({ ...session, sets, notes })
  }
  return result
}

export async function getExoHistory(exoName) {
  const sets = await db.sets
    .where('exo').equals(exoName)
    .sortBy('date')
  return sets.map(s => ({ date: s.date, poids: parseFloat(s.poids) || 0, reps: parseInt(s.reps) || 0, serie: s.serie, bonus: s.bonus || false }))
}

export async function deleteSession(sessionId) {
  await db.transaction('rw', db.sessions, db.sets, db.notes, async () => {
    await db.sets.where('sessionId').equals(sessionId).delete()
    await db.notes.where('sessionId').equals(sessionId).delete()
    await db.sessions.delete(sessionId)
  })
}
