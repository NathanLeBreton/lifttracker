import Dexie from 'dexie'

export const db = new Dexie('LiftTracker')

db.version(5).stores({
  sets: '++id, dayId, exo, serie, date, sessionId, bonus',
  sessions: '++id, dayId, date, dureeMin',
  notes: '++id, sessionId, exo',
  cardio: '++id, date, type',
})

export async function saveSession(dayId, rows, notes, dureeMin) {
  const date = new Date().toISOString().slice(0, 10)
  await db.transaction('rw', db.sessions, db.sets, db.notes, async () => {
    const sessionId = await db.sessions.add({ dayId, date, dureeMin: dureeMin || 0 })
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
  const bonusSets = {}

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

// ─── CARDIO ──────────────────────────────────────────────────────────────────

export async function saveCardio(entry) {
  const date = new Date().toISOString().slice(0, 10)
  return await db.cardio.add({ ...entry, date })
}

export async function getAllCardio() {
  return await db.cardio.orderBy('date').reverse().toArray()
}

export async function deleteCardio(id) {
  await db.cardio.delete(id)
}

export async function getCardioStats() {
  const all = await db.cardio.orderBy('date').toArray()

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear  = new Date(now.getFullYear(), 0, 1)

  const empty = () => ({ sessions: 0, dureeMin: 0, distanceKm: 0, calories: 0 })
  const stats = { week: empty(), month: empty(), year: empty(), all: empty() }

  all.forEach(s => {
    const d = new Date(s.date + 'T12:00:00')
    const duree    = parseInt(s.duree)    || 0
    const distance = parseFloat(s.distance) || 0
    const calories = parseInt(s.calories) || 0

    const add = (bucket) => {
      bucket.sessions++
      bucket.dureeMin  += duree
      bucket.distanceKm += distance
      bucket.calories  += calories
    }

    add(stats.all)
    if (d >= startOfYear)  add(stats.year)
    if (d >= startOfMonth) add(stats.month)
    if (d >= startOfWeek)  add(stats.week)
  })

  return stats
}

export async function getSessionsThisWeek() {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1))
  monday.setHours(0, 0, 0, 0)
  const mondayStr = monday.toISOString().slice(0, 10)

  const sessions = await db.sessions
    .where('date').aboveOrEqual(mondayStr)
    .toArray()

  return new Set(sessions.map(s => s.dayId))
}

export async function getWeekStreak() {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1))
  monday.setHours(0, 0, 0, 0)
  const mondayStr = monday.toISOString().slice(0, 10)

  const [muscuSessions, cardioSessions] = await Promise.all([
    db.sessions.where('date').aboveOrEqual(mondayStr).toArray(),
    db.cardio.where('date').aboveOrEqual(mondayStr).toArray(),
  ])

  const days = new Set([
    ...muscuSessions.map(s => s.date),
    ...cardioSessions.map(s => s.date),
  ])

  return { sessions: muscuSessions.length, days: days.size }
}
