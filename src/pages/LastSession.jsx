import { useState, useEffect } from 'react'
import { getLastSessionPerfs } from '../db/db'
import { PROGRAMME } from '../data/programme'

export default function LastSession({ day, onBack }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLastSessionPerfs(day.id).then(({ perfs, notes }) => {
      setData({ perfs, notes })
      setLoading(false)
    })
  }, [day.id])

  // Reconstitue les exercices avec leurs séries
  const exercises = day.muscles.flatMap(m =>
    m.exercises.map(ex => ({ ...ex, muscle: m.name, color: m.color }))
  )

  const getSeriesForExo = (exoName) => {
    const series = []
    let s = 1
    while (true) {
      const keyG = `${exoName}|S${s}G`
      const keyD = `${exoName}|S${s}D`
      const key  = `${exoName}|S${s}`
      if (data.perfs[keyG] !== undefined) {
        series.push({ serie: `S${s}G`, ...data.perfs[keyG] })
        series.push({ serie: `S${s}D`, ...data.perfs[keyD] })
        s++
      } else if (data.perfs[key] !== undefined) {
        series.push({ serie: `S${s}`, ...data.perfs[key] })
        s++
      } else break
    }
    return series
  }

  const formatDate = (iso) => iso
    ? new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  const MUSCLE_COLORS = {
    'PECS': '#ef4444', 'DOS (rappel)': '#3b82f6', 'DOS': '#3b82f6',
    'PECS (rappel)': '#ef4444', 'DELTS': '#a855f7', 'ÉPAULES': '#a855f7',
    'TRICEPS': '#f97316', 'BICEPS': '#10b981', 'JAMBES': '#eab308',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 14px', background: '#0d0d14',
        borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: 14,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, background: '#1a1a2e',
          border: 'none', color: '#a0a0c0', fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#fff', lineHeight: 1 }}>
            {day.label} — Dernière séance
          </div>
          <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{day.subtitle}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading && (
          <div style={{ color: '#3a3a5a', textAlign: 'center', padding: 40 }}>Chargement...</div>
        )}

        {!loading && Object.keys(data.perfs).length === 0 && (
          <div style={{ color: '#3a3a5a', textAlign: 'center', padding: 60, fontSize: 14, lineHeight: 1.8 }}>
            Aucune séance enregistrée<br />pour ce jour.
          </div>
        )}

        {!loading && Object.keys(data.perfs).length > 0 && (
          <>
            {day.muscles.map(muscle => (
              <div key={muscle.name}>
                {/* Séparateur muscle */}
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: 2.5,
                  color: MUSCLE_COLORS[muscle.name] || '#6b6b8a',
                  padding: '0 4px 8px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {muscle.name}
                  <div style={{ flex: 1, height: 1, background: MUSCLE_COLORS[muscle.name] || '#6b6b8a', opacity: 0.2 }} />
                </div>

                {muscle.exercises.map(ex => {
                  const series = getSeriesForExo(ex.name)
                  const note = data.notes[ex.name]
                  if (series.length === 0) return null
                  return (
                    <div key={ex.name} style={{
                      background: '#12121e', border: '1px solid #1a1a2e',
                      borderRadius: 14, overflow: 'hidden', marginBottom: 8,
                    }}>
                      {/* Header exo */}
                      <div style={{
                        padding: '12px 14px 10px',
                        borderBottom: '1px solid #1a1a2e',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>{ex.name}</div>
                        <span style={{ fontSize: 11, color: '#4a4a6a' }}>{series.length} série{series.length > 1 ? 's' : ''}</span>
                      </div>

                      {/* Note */}
                      {note && (
                        <div style={{
                          padding: '7px 14px', background: '#0f0f1a',
                          borderBottom: '1px solid #1a1a2e',
                          display: 'flex', alignItems: 'flex-start', gap: 6,
                        }}>
                          <span style={{ fontSize: 10, color: '#533483' }}>💬</span>
                          <span style={{ fontSize: 11, color: '#6b5fa0', fontStyle: 'italic' }}>{note}</span>
                        </div>
                      )}

                      {/* Table header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr', padding: '6px 14px', gap: 8 }}>
                        {['Série', 'Poids', 'Reps'].map(h => (
                          <span key={h} style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#3a3a5a', textTransform: 'uppercase', textAlign: h === 'Série' ? 'left' : 'center' }}>{h}</span>
                        ))}
                      </div>

                      {/* Lignes */}
                      {series.map((s, i) => (
                        <div key={i} style={{
                          display: 'grid', gridTemplateColumns: '48px 1fr 1fr',
                          padding: '8px 14px', gap: 8, alignItems: 'center',
                          borderTop: '1px solid #14141f',
                          background: i % 2 === 0 ? '#0f0f1a' : 'transparent',
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#4a4a6a' }}>{s.serie}</span>
                          <span style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#a78bfa', letterSpacing: 1 }}>
                            {s.poids || '—'} <span style={{ fontSize: 11, color: '#4a4a6a' }}>{s.poids ? 'kg' : ''}</span>
                          </span>
                          <span style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#ef4444', letterSpacing: 1 }}>
                            {s.reps || '—'} <span style={{ fontSize: 11, color: '#4a4a6a' }}>{s.reps ? 'reps' : ''}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
