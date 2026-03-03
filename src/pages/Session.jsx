import { useState, useEffect } from 'react'
import { getLastSessionPerfs } from '../db/db'
import RestTimer from '../components/RestTimer'

const MUSCLE_COLORS = {
  'PECS': '#ef4444', 'DOS (rappel)': '#3b82f6', 'DOS': '#3b82f6',
  'PECS (rappel)': '#ef4444', 'DELTS': '#a855f7', 'ÉPAULES': '#a855f7',
  'TRICEPS': '#f97316', 'BICEPS': '#10b981', 'JAMBES': '#eab308',
}

export default function Session({ day, onBack, onValidate }) {
  const [inputs, setInputs] = useState({})       // "exo|S1" -> {poids, reps}
  const [notes, setNotes] = useState({})         // exoName -> string
  const [extraSets, setExtraSets] = useState({}) // exoName -> nb séries bonus
  const [lastPerfs, setLastPerfs] = useState({})
  const [lastNotes, setLastNotes] = useState({})
  const [lastBonusSets, setLastBonusSets] = useState({})
  const [showTimer, setShowTimer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLastSessionPerfs(day.id).then(({ perfs, notes: n, bonusSets }) => {
      setLastPerfs(perfs)
      setLastNotes(n)
      setLastBonusSets(bonusSets)
      setLoading(false)
    })
  }, [day.id])

  const key = (exo, s) => `${exo}|S${s}`

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
      // Efface les inputs de la dernière série bonus
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
    day.muscles.forEach(m => {
      m.exercises.forEach(ex => {
        const total = getExoTotalSets(ex.name)
        for (let s = 1; s <= total; s++) {
          const k = key(ex.name, s)
          const inp = inputs[k] || {}
          const isBonus = s > ex.sets
          rows.push({
            exo: ex.name,
            serie: `S${s}`,
            poids: inp.poids || '',
            reps: inp.reps || '',
            bonus: isBonus,
          })
        }
      })
    })
    const filled = rows.filter(r => r.poids || r.reps)
    if (filled.length === 0) { alert("Aucune perf saisie !"); return }
    if (!window.confirm(`Valider la séance ? (${filled.length} séries enregistrées)`)) return
    onValidate(day.id, filled, notes)
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a3a5a' }}>
      Chargement...
    </div>
  )

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
            {day.label}
          </div>
          <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{day.subtitle}</div>
        </div>
        <button
          onClick={() => setShowTimer(true)}
          style={{
            width: 36, height: 36, borderRadius: 10, background: '#1a1a2e',
            border: 'none', color: '#a78bfa', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >⏱</button>
        <button
          onClick={handleValidate}
          style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none',
            borderRadius: 10, padding: '8px 14px', color: '#fff',
            fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >✓ Valider</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                onTimerOpen={() => setShowTimer(true)}
                keyFn={key}
              />
            ))}
          </div>
        ))}
      </div>

      {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
    </div>
  )
}

function ExerciseBlock({ ex, inputs, lastPerfs, lastNote, lastBonusCount, note, extraSetsCount, onInput, onNote, onAddSet, onRemoveSet, onTimerOpen, keyFn }) {
  const baseSets = Array.from({ length: ex.sets }, (_, i) => i + 1)
  const bonusSets = Array.from({ length: extraSetsCount }, (_, i) => ex.sets + i + 1)
  const allSets = [...baseSets, ...bonusSets]

  // Séries bonus S-1 (depuis la semaine dernière)
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
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', lineHeight: 1.2 }}>{ex.name}</div>
          <div style={{ fontSize: 11, color: '#4a4a6a', marginTop: 3 }}>{ex.sets} séries</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#1e1e35', color: '#6b6b8a' }}>
            {ex.reps}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#2d1f4a', color: '#a78bfa' }}>
            RIR {ex.rir}
          </span>
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
          <span style={{ fontSize: 11, color: '#6b5fa0', fontStyle: 'italic', lineHeight: 1.5 }}>
            S-1 : {lastNote}
          </span>
        </div>
      )}

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 1fr', padding: '6px 14px', gap: 6 }}>
        {['', 'S-1 kg', 'S-1 reps', 'kg', 'reps'].map((h, i) => (
          <span key={i} style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#3a3a5a', textTransform: 'uppercase', textAlign: i === 0 ? 'left' : 'center' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Séries normales */}
      {allSets.map(s => {
        const k = keyFn(ex.name, s)
        const inp = inputs[k] || {}
        const prev = lastPerfs[`${ex.name}|S${s}`]
        const isBonus = s > ex.sets

        return (
          <div key={s} style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 1fr',
            padding: '6px 14px', gap: 6, alignItems: 'center',
            borderTop: '1px solid #14141f',
            background: isBonus ? '#0d0d18' : 'transparent',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: isBonus ? '#533483' : '#4a4a6a',
            }}>
              {isBonus ? '＋' : `S${s}`}
            </span>
            <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>
              {prev?.poids || '—'}
            </span>
            <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>
              {prev?.reps || '—'}
            </span>
            <input
              type="number" placeholder="kg" value={inp.poids || ''}
              onChange={e => onInput(k, 'poids', e.target.value)}
              style={{
                background: inp.poids ? '#200f1a' : '#1a1a2e',
                border: `1.5px solid ${inp.poids ? '#ef444488' : isBonus ? '#2d1f4a' : '#22223a'}`,
                borderRadius: 8, padding: '7px 6px',
                color: inp.poids ? '#fca5a5' : '#e8e8f0',
                fontSize: 14, fontWeight: 600, textAlign: 'center', width: '100%', outline: 'none',
              }}
            />
            <input
              type="number" placeholder="reps" value={inp.reps || ''}
              onChange={e => onInput(k, 'reps', e.target.value)}
              onBlur={() => inp.reps && onTimerOpen()}
              style={{
                background: inp.reps ? '#200f1a' : '#1a1a2e',
                border: `1.5px solid ${inp.reps ? '#ef444488' : isBonus ? '#2d1f4a' : '#22223a'}`,
                borderRadius: 8, padding: '7px 6px',
                color: inp.reps ? '#fca5a5' : '#e8e8f0',
                fontSize: 14, fontWeight: 600, textAlign: 'center', width: '100%', outline: 'none',
              }}
            />
          </div>
        )
      })}

      {/* Séries bonus S-1 (semaine dernière, read-only) */}
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
            <span style={{ textAlign: 'center', fontSize: 11, color: '#2a2a40', gridColumn: 'span 2', fontStyle: 'italic' }}>
              série bonus semaine dernière
            </span>
          </div>
        )
      })}

      {/* Boutons + série / - série + note */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Boutons séries */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onAddSet}
            style={{
              background: '#1a1a2e', border: '1px dashed #2d1f4a',
              borderRadius: 8, padding: '6px 12px', color: '#a78bfa',
              fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >＋ série</button>
          {extraSetsCount > 0 && (
            <button
              onClick={onRemoveSet}
              style={{
                background: '#1a1a2e', border: '1px dashed #3a1a1a',
                borderRadius: 8, padding: '6px 12px', color: '#6b3a3a',
                fontSize: 11, fontWeight: 600,
              }}
            >－ série</button>
          )}
        </div>

        {/* Zone de note */}
        <textarea
          value={note}
          onChange={e => onNote(ex.name, e.target.value)}
          placeholder="Note sur cet exercice... (machine prise, mauvaise série, ...)"
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
