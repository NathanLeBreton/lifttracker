import Dexie from 'dexie'

// Base de données IndexedDB via Dexie
// Survit aux rechargements, fonctionne offline

export const db = new Dexie('LiftTracker')

db.version(1).stores({
  // Chaque série enregistrée
  // dayId: 'lundi' | 'mardi' | ...
  // exo: nom de l'exercice
  // serie: 'S1' | 'S2' | ...
  // date: 'YYYY-MM-DD'
  sets: '++id, dayId, exo, serie, date',

  // Métadonnées de séances (date, notes globales)
  sessions: '++id, dayId, date',
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Enregistre toutes les séries d'une séance
 * rows: [{exo, serie, poids, reps, notes}]
 */
export async function saveSession(dayId, rows) {
  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  await db.transaction('rw', db.sessions, db.sets, async () => {
    const sessionId = await db.sessions.add({ dayId, date })
    const records = rows.map(r => ({ ...r, dayId, date, sessionId }))
    await db.sets.bulkAdd(records)
  })
}

/**
 * Retourne les perfs de la DERNIÈRE séance d'un jour donné
 * Résultat: { "Pec Deck|S1": {poids, reps}, ... }
 */
export async function getLastSessionPerfs(dayId) {
  // Trouve la session la plus récente pour ce jour
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

/**
 * Retourne tout l'historique des séances (pour la vue Historique)
 * Résultat: [{date, dayId, sets:[...]}]
 */
export async function getAllHistory() {
  const sessions = await db.sessions.orderBy('date').reverse().toArray()
  const result = []
  for (const session of sessions) {
    const sets = await db.sets.where('sessionId').equals(session.id).toArray()
    result.push({ ...session, sets })
  }
  return result
}

/**
 * Retourne toutes les entrées d'un exercice donné (pour la progression)
 * Résultat: [{date, poids, reps}]
 */
export async function getExoHistory(exoName) {
  const sets = await db.sets
    .where('exo').equals(exoName)
    .sortBy('date')
  return sets.map(s => ({ date: s.date, poids: parseFloat(s.poids) || 0, reps: parseInt(s.reps) || 0, serie: s.serie }))
}

/**
 * Supprime une session et ses séries (pour corriger une erreur)
 */
export async function deleteSession(sessionId) {
  await db.transaction('rw', db.sessions, db.sets, async () => {
    await db.sets.where('sessionId').equals(sessionId).delete()
    await db.sessions.delete(sessionId)
  })
}
