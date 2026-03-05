import { useState, useEffect } from 'react'
import { saveAvantBras, getAllAvantBras, deleteAvantBras } from '../db/db'

const JOURS = [
  {
    id: 'mardi',
    label: 'Mardi',
    exercises: [
      { name: 'Curl inversé',   reps: '12–20' },
      { name: 'Wrist curl',     reps: '20–30' },
    ],
  },
  {
    id: 'jeudi',
    label: 'Jeudi',
    exercises: [
      { name: 'Curl inversé',    reps: '12–20' },
      { name: 'Wrist extension', reps: '20–30' },
    ],
  },
  {
    id: 'samedi',
    label: 'Samedi',
    exercises: [
      { name: 'Wrist curl',      reps: '20–30' },
      { name: 'Wrist extension', reps: '20–30' },
    ],
  },
]

const isValidPoids = (v) => v !== '' && !isNaN(parseFloat(v)) && parseFloat(v) > 0
const isValidReps  = (v) => v !== '' && /^\d+$/.test(v.trim()) && parseInt(v) > 0

const inputStyle = (value, validator) => {
  const empty   = value === '' || value === undefined
  const valid   = !empty && validator(value)
  const invalid = !empty && !valid
  return {
    background: valid ? '#0f1f0f' : invalid ? '#200f0f' : '#1a1a2e',
    border: `1.5px solid ${valid ? '#16a34a88' : invalid ? '#ef444488' : '#22223a'}`,
    borderRadius: 8, padding: '8px 6px',
    color: valid ? '#86efac' : invalid ? '#fca5a5' : '#e8e8f0',
    fontSize: 14, fontWeight: 600, textAlign: 'center', width: '100%', outline: 'none',
  }
}

const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {
  weekday: 'short', day: 'numeric', month: 'short'
})

export default function AvantBras({ refreshKey, onSaved }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeJour, setActiveJour] = useState(null)
  const [inputs, setInputs]     = useState({})
  const [lastPerfs, setLastPerfs] = useState({})
  const [openHistory, setOpenHistory] = useState(null)

  const load = async () => {
    const all = await getAllAvantBras()
    setSessions(all)
    setLoading(false)
  }

  useEffect(() => { load() }, [refreshKey])

  const openJour = (jour) => {
    // Cherche les dernières perfs pour ce jour
    const lastSession = sessions.find(s => s.jour === jour.id)
    const perfs = {}
    if (lastSession) {
      lastSession.series.forEach(s => {
        perfs[`${s.exo}|${s.set}`] = { poids: s.poids, reps: s.reps }
      })
    }
    setLastPerfs(perfs)
    setInputs({})
    setActiveJour(jour)
  }

  const handleInput = (exo, set, field, val) => {
    const k = `${exo}|${set}`
    setInputs(prev => ({ ...prev, [k]: { ...prev[k], [field]: val } }))
  }

  const handleSave = async () => {
    const series = []
    const errors = []

    activeJour.exercises.forEach(ex => {
      for (let s = 1; s <= 3; s++) {
        const k = `${ex.name}|${s}`
        const inp = inputs[k] || {}
        const hasPoids = isValidPoids(inp.poids || '')
        const hasReps  = isValidReps(inp.reps || '')
        if (hasPoids && !hasReps) errors.push(`${ex.name} S${s} — poids saisi mais reps manquants`)
        if (!hasPoids && hasReps) errors.push(`${ex.name} S${s} — reps saisis mais poids manquant`)
        if (hasPoids && hasReps) series.push({ exo: ex.name, set: s, poids: inp.poids, reps: inp.reps })
      }
    })

    if (errors.length > 0) {
      alert(`⚠️ Séries incomplètes :\n\n${errors.join('\n')}`)
      return
    }
    if (series.length === 0) { alert('Aucune série saisie !'); return }
    if (!window.confirm(`Valider la séance ? (${series.length} séries)`)) return

    await saveAvantBras(activeJour.id, series)
    setActiveJour(null)
    setInputs({})
    onSaved()
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette séance ?')) return
    await deleteAvantBras(id)
    load()
  }

  // Vue séance active
  if (activeJour) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{
          padding: '16px 20px 14px', background: '#0d0d14',
          borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: 14,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button onClick={() => setActiveJour(null)} style={{
            width: 36, height: 36, borderRadius: 10, background: '#1a1a2e',
            border: 'none', color: '#a0a0c0', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#fff', lineHeight: 1 }}>
              Avant-bras — {activeJour.label}
            </div>
            <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>3 séries par exercice</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 140px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeJour.exercises.map(ex => (
            <div key={ex.name} style={{
              background: '#12121e', border: '1px solid #1a1a2e',
              borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Header exo */}
              <div style={{
                padding: '12px 14px 10px', borderBottom: '1px solid #1a1a2e',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>{ex.name}</div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#1e1e35', color: '#6b6b8a' }}>
                  {ex.reps}
                </span>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 1fr', padding: '6px 14px', gap: 6 }}>
                {['', 'S-1 kg', 'S-1 reps', 'kg', 'reps'].map((h, i) => (
                  <span key={i} style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#3a3a5a', textTransform: 'uppercase', textAlign: i === 0 ? 'left' : 'center' }}>{h}</span>
                ))}
              </div>

              {/* Séries */}
              {[1, 2, 3].map(s => {
                const k    = `${ex.name}|${s}`
                const inp  = inputs[k] || {}
                const prev = lastPerfs[k]
                return (
                  <div key={s} style={{
                    display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 1fr',
                    padding: '6px 14px', gap: 6, alignItems: 'center',
                    borderTop: '1px solid #14141f',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#4a4a6a' }}>S{s}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>
                      {prev?.poids || '—'}
                    </span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>
                      {prev?.reps || '—'}
                    </span>
                    <input type="number" placeholder="kg" value={inp.poids || ''}
                      onChange={e => handleInput(ex.name, s, 'poids', e.target.value)}
                      style={inputStyle(inp.poids || '', isValidPoids)}
                    />
                    <input type="number" placeholder="reps" value={inp.reps || ''}
                      onChange={e => handleInput(ex.name, s, 'reps', e.target.value)}
                      style={inputStyle(inp.reps || '', isValidReps)}
                    />
                  </div>
                )
              })}
            </div>
          ))}

          <button onClick={handleSave} style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none', borderRadius: 14,
            color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: 0.5,
          }}>
            ✓ Valider la séance
          </button>
        </div>
      </div>
    )
  }

  // Vue principale
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '20px 20px 16px', background: '#0d0d14',
        borderBottom: '1px solid #1a1a2e', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, color: '#fff' }}>
          Avant-bras
        </div>
        <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>Mardi · Jeudi · Samedi</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Cards jours */}
        {JOURS.map(jour => (
          <div key={jour.id} style={{
            background: '#12121e', border: '1px solid #1e1e35',
            borderRadius: 16, padding: '18px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }} onClick={() => openJour(jour)}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
              background: '#f59e0b', borderRadius: '0 2px 2px 0',
            }} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#fff' }}>
                {jour.label}
              </div>
              <div style={{ fontSize: 12, color: '#6b6b8a', marginTop: 2 }}>
                {jour.exercises.map(e => e.name).join(' · ')}
              </div>
            </div>
            <div style={{ color: '#3a3a5a', fontSize: 20 }}>›</div>
          </div>
        ))}

        {/* Historique */}
        {!loading && sessions.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: '#4a4a6a', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 10, padding: '0 4px' }}>
              Historique
            </div>
            {sessions.map((session, i) => {
              const jour = JOURS.find(j => j.id === session.jour)
              const isOpen = openHistory === i
              return (
                <div key={session.id} style={{
                  background: '#12121e', border: '1px solid #1a1a2e',
                  borderRadius: 14, overflow: 'hidden', marginBottom: 8,
                }}>
                  <div
                    onClick={() => setOpenHistory(isOpen ? null : i)}
                    style={{
                      padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', cursor: 'pointer',
                      borderBottom: isOpen ? '1px solid #1a1a2e' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: '#fff' }}>
                        {jour?.label || session.jour}
                      </div>
                      <div style={{ fontSize: 11, color: '#4a4a6a', marginTop: 2 }}>
                        {fmtDate(session.date)} · {session.series.length} séries
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button onClick={e => { e.stopPropagation(); handleDelete(session.id) }}
                        style={{ background: 'none', border: 'none', color: '#3a3a5a', fontSize: 14, padding: 4 }}>🗑</button>
                      <div style={{ color: '#3a3a5a', fontSize: 14 }}>{isOpen ? '▲' : '▼'}</div>
                    </div>
                  </div>
                  {isOpen && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 52px 52px', padding: '6px 16px', gap: 8 }}>
                        {['Exercice', 'S', 'kg', 'reps'].map(h => (
                          <span key={h} style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#3a3a5a', textTransform: 'uppercase' }}>{h}</span>
                        ))}
                      </div>
                      {session.series.map((row, j) => (
                        <div key={j} style={{
                          display: 'grid', gridTemplateColumns: '1fr 44px 52px 52px',
                          padding: '8px 16px', gap: 8, alignItems: 'center',
                          borderTop: '1px solid #14141f',
                          background: j % 2 === 0 ? '#0f0f1a' : 'transparent',
                        }}>
                          <span style={{ fontSize: 12, color: '#c0c0d8' }}>{row.exo}</span>
                          <span style={{ fontSize: 11, color: '#4a4a6a', textAlign: 'center' }}>S{row.set}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', textAlign: 'center' }}>{row.poids || '–'}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', textAlign: 'center' }}>{row.reps || '–'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
