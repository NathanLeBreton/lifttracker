import { useState, useEffect } from 'react'
import { getLastSessionPerfs } from '../db/db'
import RestTimer from '../components/RestTimer'
import { FICHES } from '../data/exerciceFiches'

const MUSCLE_COLORS = {
  'PECS': '#ef4444', 'DOS (rappel)': '#3b82f6', 'DOS': '#3b82f6',
  'PECS (rappel)': '#ef4444', 'DELTS': '#a855f7', 'ÉPAULES': '#a855f7',
  'TRICEPS': '#f97316', 'BICEPS': '#10b981', 'JAMBES': '#eab308',
}

const isValidPoids = (v) => v !== '' && !isNaN(parseFloat(v)) && parseFloat(v) > 0
const isValidReps  = (v) => v !== '' && /^\d+$/.test(v.trim()) && parseInt(v) > 0

const inputStyle = (value, validator) => {
  const empty   = value === '' || value === undefined
  const valid   = !empty && validator(value)
  const invalid = !empty && !valid
  return {
    background: valid ? '#0f1f0f' : invalid ? '#200f0f' : '#1a1a2e',
    border: `1.5px solid ${valid ? '#16a34a88' : invalid ? '#ef444488' : '#22223a'}`,
    borderRadius: 8, padding: '7px 6px',
    color: valid ? '#86efac' : invalid ? '#fca5a5' : '#e8e8f0',
    fontSize: 14, fontWeight: 600, textAlign: 'center', width: '100%', outline: 'none',
  }
}

export default function Session({ day, onBack, onValidate }) {
  const STORAGE_KEY = `session_draft_${day.id}`

  const [inputs, setInputs] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY + '_inputs')) || {} } catch { return {} }
  })
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY + '_notes')) || {} } catch { return {} }
  })
  const [extraSets, setExtraSets] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY + '_extra')) || {} } catch { return {} }
  })
  const [lastPerfs, setLastPerfs] = useState({})
  const [lastNotes, setLastNotes] = useState({})
  const [lastBonusSets, setLastBonusSets] = useState({})
  const [showTimer, setShowTimer] = useState(false)
  const [ficheOpen, setFicheOpen] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLastSessionPerfs(day.id).then(({ perfs, notes: n, bonusSets }) => {
      setLastPerfs(perfs)
      setLastNotes(n)
      setLastBonusSets(bonusSets)
      setLoading(false)
    })
  }, [day.id])

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY + '_inputs', JSON.stringify(inputs))
  }, [inputs])

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY + '_notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY + '_extra', JSON.stringify(extraSets))
  }, [extraSets])

  const key = (exo, s, side) => side ? `${exo}|S${s}|${side}` : `${exo}|S${s}`

  const handleInput = (k, field, val) => {
    setInputs(prev => ({ ...prev, [k]: { ...prev[k], [field]: val } }))
  }

  const handleNote = (exo, val) => {
    setNotes(prev => ({ ...prev, [exo]: val }))
  }

  const addExtraSet = (exoName) => {
    setExtraSets(prev => ({ ...prev, [exoName]: (prev[exoName] || 0) + 1 }))
  }

  const removeExtraSet = (exoName) => {
    setExtraSets(prev => {
      const current = prev[exoName] || 0
      if (current <= 0) return prev
      const totalSets = getExoTotalSets(exoName, prev)
      const lastKey = key(exoName, totalSets)
      setInputs(inp => { const next = { ...inp }; delete next[lastKey]; return next })
      return { ...prev, [exoName]: current - 1 }
    })
  }

  const getExoTotalSets = (exoName, extraOverride) => {
    const extra = extraOverride !== undefined ? (extraOverride[exoName] || 0) : (extraSets[exoName] || 0)
    const base = day.muscles.flatMap(m => m.exercises).find(e => e.name === exoName)?.sets || 0
    return base + extra
  }

  const handleValidate = () => {
    const rows = []
    const errors = []
  
    day.muscles.forEach(m => {
      m.exercises.forEach(ex => {
        const total = getExoTotalSets(ex.name)
        for (let s = 1; s <= total; s++) {
          const isBonus = s > ex.sets
          if (ex.unilateral) {
            const sides = ['G', 'D']
            sides.forEach(side => {
              const k = key(ex.name, s, side)
              const inp = inputs[k] || {}
              const hasPoids = isValidPoids(inp.poids || '')
              const hasReps  = isValidReps(inp.reps || '')
              if (hasPoids && !hasReps) errors.push(`${ex.name} S${s}${side} — poids saisi mais reps manquants`)
              if (!hasPoids && hasReps) errors.push(`${ex.name} S${s}${side} — reps saisis mais poids manquant`)
              if (hasPoids && hasReps) rows.push({ exo: ex.name, serie: `S${s}${side}`, poids: inp.poids, reps: inp.reps, bonus: isBonus })
            })
          } else {
            const k2  = key(ex.name, s)
            const inp = inputs[k2] || {}
            const hasPoids = isValidPoids(inp.poids || '')
            const hasReps  = isValidReps(inp.reps || '')
            if (hasPoids && !hasReps) errors.push(`${ex.name} S${s} — poids saisi mais reps manquants`)
            if (!hasPoids && hasReps) errors.push(`${ex.name} S${s} — reps saisis mais poids manquant`)
            if (hasPoids && hasReps) rows.push({ exo: ex.name, serie: `S${s}`, poids: inp.poids, reps: inp.reps, bonus: isBonus })
          }
        }
      })
    })
  
    if (errors.length > 0) {
      alert(`⚠️ Certaines séries sont incomplètes :\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...et ${errors.length - 5} autre(s)` : ''}`)
      return
    }
    if (rows.length === 0) { alert("Aucune perf saisie !"); return }
    if (!window.confirm(`Valider la séance ? (${rows.length} séries enregistrées)`)) return
    sessionStorage.removeItem(STORAGE_KEY + '_inputs')
    sessionStorage.removeItem(STORAGE_KEY + '_notes')
    sessionStorage.removeItem(STORAGE_KEY + '_extra')
    onValidate(day.id, rows, notes)
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a3a5a' }}>
      Chargement...
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header — sans bouton Valider */}
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
            {day.label}
          </div>
          <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{day.subtitle}</div>
        </div>
        <button onClick={() => setShowTimer(true)} style={{
          width: 36, height: 36, borderRadius: 10, background: '#1a1a2e',
          border: 'none', color: '#a78bfa', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>⏱</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 140px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {day.muscles.map(muscle => (
          <div key={muscle.name}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 2.5,
              color: MUSCLE_COLORS[muscle.name] || '#6b6b8a',
              padding: '0 4px 8px', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {muscle.name}
              <div style={{ flex: 1, height: 1, background: MUSCLE_COLORS[muscle.name] || '#6b6b8a', opacity: 0.2 }} />
            </div>
            {muscle.exercises.map(ex => (
              <ExerciseBlock
                key={ex.name}
                ex={ex}
                inputs={inputs}
                lastPerfs={lastPerfs}
                lastNote={lastNotes[ex.name]}
                lastBonusCount={lastBonusSets[ex.name] || 0}
                note={notes[ex.name] || ''}
                extraSetsCount={extraSets[ex.name] || 0}
                onInput={handleInput}
                onNote={handleNote}
                onAddSet={() => addExtraSet(ex.name)}
                onRemoveSet={() => removeExtraSet(ex.name)}
                onFiche={() => setFicheOpen(ex.name)}
                keyFn={key}
              />
            ))}
          </div>
        ))}

        {/* Bouton Valider en bas */}
        <button
          onClick={handleValidate}
          style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            border: 'none', borderRadius: 14,
            color: '#fff', fontSize: 16, fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          ✓ Valider la séance
        </button>
      </div>

      {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}

      {/* Modale fiche exercice */}
      {ficheOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200,
          backdropFilter: 'blur(4px)',
        }} onClick={() => setFicheOpen(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 430, margin: '0 auto',
              background: '#12121e', borderRadius: '20px 20px 0 0',
              padding: '24px 20px 40px', maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            {(() => {
              const fiche = FICHES[ficheOpen]
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#fff', letterSpacing: 1, flex: 1, paddingRight: 12 }}>
                      {ficheOpen}
                    </div>
                    <button onClick={() => setFicheOpen(null)} style={{
                      background: '#1a1a2e', border: 'none', borderRadius: 8,
                      width: 32, height: 32, color: '#6b6b8a', fontSize: 16,
                    }}>✕</button>
                  </div>
                  {!fiche ? (
                    <div style={{ color: '#4a4a6a', fontSize: 13, fontStyle: 'italic' }}>
                      Pas encore de fiche pour cet exercice.
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <FicheSectionTitle>🎯 Muscles ciblés</FicheSectionTitle>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {fiche.muscles.map(m => (
                            <span key={m} style={{
                              background: '#1e1e35', borderRadius: 6, padding: '4px 10px',
                              fontSize: 12, color: '#a78bfa',
                            }}>{m}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <FicheSectionTitle>✅ Conseils d'exécution</FicheSectionTitle>
                        {fiche.conseils.map((c, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <span style={{ color: '#16a34a', fontSize: 12, marginTop: 1, flexShrink: 0 }}>•</span>
                            <span style={{ fontSize: 13, color: '#c0c0d8', lineHeight: 1.6 }}>{c}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <FicheSectionTitle>⚠️ Erreurs communes</FicheSectionTitle>
                        {fiche.erreurs.map((e, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <span style={{ color: '#ef4444', fontSize: 12, marginTop: 1, flexShrink: 0 }}>•</span>
                            <span style={{ fontSize: 13, color: '#c0c0d8', lineHeight: 1.6 }}>{e}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

function FicheSectionTitle({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: '#6b6b8a', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  )
}

function ExerciseBlock({ ex, inputs, lastPerfs, lastNote, lastBonusCount, note, extraSetsCount, onInput, onNote, onAddSet, onRemoveSet, onFiche, keyFn }) {
  const baseSets     = Array.from({ length: ex.sets }, (_, i) => i + 1)
  const bonusSets    = Array.from({ length: extraSetsCount }, (_, i) => ex.sets + i + 1)
  const allSets      = [...baseSets, ...bonusSets]
  const lastBonusArr = Array.from({ length: lastBonusCount }, (_, i) => ex.sets + i + 1)

  return (
    <div style={{
      background: '#12121e', border: '1px solid #1a1a2e',
      borderRadius: 14, overflow: 'hidden', marginBottom: 8,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px', display: 'flex',
        alignItems: 'flex-start', justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a2e',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', lineHeight: 1.2 }}>{ex.name}</div>
            {ex.unilateral && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#1a2a1a', color: '#10b981', letterSpacing: 0.5 }}>
                UNILAT
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#4a4a6a', marginTop: 3 }}>{ex.sets} séries</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#1e1e35', color: '#6b6b8a' }}>
            {ex.reps}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#2d1f4a', color: '#a78bfa' }}>
            RIR {ex.rir}
          </span>
          <button onClick={onFiche} style={{
            background: '#1a1a2e', border: 'none', borderRadius: 6,
            width: 26, height: 26, color: '#6b6b8a', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>ℹ</button>
        </div>
      </div>

      {/* Note S-1 */}
      {lastNote && (
        <div style={{
          padding: '7px 14px', background: '#0f0f1a',
          borderBottom: '1px solid #1a1a2e',
          display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <span style={{ fontSize: 10, color: '#533483', marginTop: 1 }}>💬</span>
          <span style={{ fontSize: 11, color: '#6b5fa0', fontStyle: 'italic', lineHeight: 1.5 }}>S-1 : {lastNote}</span>
        </div>
      )}

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: ex.unilateral ? '36px 1fr 1fr 1fr 1fr' : '32px 1fr 1fr 1fr 1fr', padding: '6px 14px', gap: 6 }}>
        {['', 'S-1 kg', 'S-1 reps', 'kg', 'reps'].map((h, i) => (
          <span key={i} style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#3a3a5a', textTransform: 'uppercase', textAlign: i === 0 ? 'left' : 'center' }}>{h}</span>
        ))}
      </div>

      {/* Séries */}
      {allSets.map(s => {
        const isBonus = s > ex.sets

        if (ex.unilateral) {
          const sides = [
            { side: 'G', label: `S${s}G`, color: '#0ea5e9' },
            { side: 'D', label: `S${s}D`, color: '#f97316' },
          ]
          return sides.map(({ side, label, color }) => {
            const k   = keyFn(ex.name, s, side)
            const inp = inputs[k] || {}
            const prev = lastPerfs[`${ex.name}|${label}`]
            return (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr 1fr 1fr 1fr',
                padding: '6px 14px', gap: 6, alignItems: 'center',
                borderTop: '1px solid #14141f',
                background: isBonus ? '#0d0d18' : 'transparent',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color }}>{isBonus ? `＋${side}` : label}</span>
                <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>{prev?.poids || '—'}</span>
                <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>{prev?.reps || '—'}</span>
                <input type="number" placeholder="kg" value={inp.poids || ''}
                  onChange={e => onInput(k, 'poids', e.target.value)}
                  style={inputStyle(inp.poids || '', isValidPoids)}
                />
                <input type="number" placeholder="reps" value={inp.reps || ''}
                  onChange={e => onInput(k, 'reps', e.target.value)}
                  style={inputStyle(inp.reps || '', isValidReps)}
                />
              </div>
            )
          })
        }

        const k   = keyFn(ex.name, s)
        const inp = inputs[k] || {}
        const prev = lastPerfs[`${ex.name}|S${s}`]
        return (
          <div key={s} style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 1fr',
            padding: '6px 14px', gap: 6, alignItems: 'center',
            borderTop: '1px solid #14141f',
            background: isBonus ? '#0d0d18' : 'transparent',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: isBonus ? '#533483' : '#4a4a6a' }}>
              {isBonus ? '＋' : `S${s}`}
            </span>
            <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>{prev?.poids || '—'}</span>
            <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>{prev?.reps || '—'}</span>
            <input type="number" placeholder="kg" value={inp.poids || ''}
              onChange={e => onInput(k, 'poids', e.target.value)}
              style={inputStyle(inp.poids || '', isValidPoids)}
            />
            <input type="number" placeholder="reps" value={inp.reps || ''}
              onChange={e => onInput(k, 'reps', e.target.value)}
              style={inputStyle(inp.reps || '', isValidReps)}
            />
          </div>
        )
      })}

      {/* Séries bonus S-1 read-only */}
      {lastBonusArr.map(s => {
        const prev = lastPerfs[`${ex.name}|S${s}`]
        if (!prev || (!prev.poids && !prev.reps)) return null
        return (
          <div key={`prev-bonus-${s}`} style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 1fr',
            padding: '5px 14px', gap: 6, alignItems: 'center',
            borderTop: '1px solid #14141f', background: '#0a0a12', opacity: 0.6,
          }}>
            <span style={{ fontSize: 10, color: '#533483' }}>＋S-1</span>
            <span style={{ textAlign: 'center', fontSize: 12, color: '#533483' }}>{prev.poids || '—'}</span>
            <span style={{ textAlign: 'center', fontSize: 12, color: '#533483' }}>{prev.reps || '—'}</span>
            <span style={{ textAlign: 'center', fontSize: 11, color: '#2a2a40', gridColumn: 'span 2', fontStyle: 'italic' }}>bonus S-1</span>
          </div>
        )
      })}

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onAddSet} style={{
            background: '#1a1a2e', border: '1px dashed #2d1f4a',
            borderRadius: 8, padding: '6px 12px', color: '#a78bfa', fontSize: 11, fontWeight: 600,
          }}>＋ série</button>
          {extraSetsCount > 0 && (
            <button onClick={onRemoveSet} style={{
              background: '#1a1a2e', border: '1px dashed #3a1a1a',
              borderRadius: 8, padding: '6px 12px', color: '#6b3a3a', fontSize: 11, fontWeight: 600,
            }}>－ série</button>
          )}
        </div>
        <textarea
          value={note}
          onChange={e => onNote(ex.name, e.target.value)}
          placeholder="Note sur cet exercice..."
          rows={2}
          style={{
            background: '#0f0f1a', border: '1px solid #1e1e35',
            borderRadius: 8, padding: '8px 10px',
            color: '#a0a0c0', fontSize: 12, fontStyle: 'italic',
            width: '100%', outline: 'none', resize: 'none',
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  )
}
