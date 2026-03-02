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
  const [lastPerfs, setLastPerfs] = useState({}) // "exo|S1" -> {poids, reps}
  const [showTimer, setShowTimer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLastSessionPerfs(day.id).then(perfs => {
      setLastPerfs(perfs)
      setLoading(false)
    })
  }, [day.id])

  const key = (exo, s) => `${exo}|S${s}`

  const handleInput = (k, field, val) => {
    setInputs(prev => ({ ...prev, [k]: { ...prev[k], [field]: val } }))
  }

  const handleValidate = () => {
    // Collecte toutes les lignes saisies
    const rows = []
    day.muscles.forEach(m => {
      m.exercises.forEach(ex => {
        for (let s = 1; s <= ex.sets; s++) {
          const k = key(ex.name, s)
          const inp = inputs[k] || {}
          rows.push({
            exo: ex.name,
            serie: `S${s}`,
            poids: inp.poids || '',
            reps: inp.reps || '',
          })
        }
      })
    })
    const filled = rows.filter(r => r.poids || r.reps)
    if (filled.length === 0) {
      alert("Aucune perf saisie !")
      return
    }
    if (!window.confirm(`Valider la séance ? (${filled.length} séries enregistrées)`)) return
    onValidate(day.id, filled)
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
          title="Minuteur de repos"
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
            {/* Muscle header */}
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 2.5,
              color: MUSCLE_COLORS[muscle.name] || '#6b6b8a',
              padding: '0 4px 8px', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {muscle.name}
              <div style={{ flex: 1, height: 1, background: MUSCLE_COLORS[muscle.name] || '#6b6b8a', opacity: 0.2 }} />
            </div>

            {/* Exercises */}
            {muscle.exercises.map(ex => (
              <ExerciseBlock
                key={ex.name}
                ex={ex}
                inputs={inputs}
                lastPerfs={lastPerfs}
                onInput={handleInput}
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

function ExerciseBlock({ ex, inputs, lastPerfs, onInput, onTimerOpen, keyFn }) {
  const sets = Array.from({ length: ex.sets }, (_, i) => i + 1)

  return (
    <div style={{
      background: '#12121e', border: '1px solid #1a1a2e',
      borderRadius: 14, overflow: 'hidden', marginBottom: 8,
    }}>
      {/* Exercise header */}
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

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 1fr', padding: '6px 14px', gap: 6 }}>
        {['', 'S-1 kg', 'S-1 reps', 'kg', 'reps'].map((h, i) => (
          <span key={i} style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#3a3a5a', textTransform: 'uppercase', textAlign: i === 0 ? 'left' : 'center' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Sets */}
      {sets.map(s => {
        const k = keyFn(ex.name, s)
        const inp = inputs[k] || {}
        const prev = lastPerfs[`${ex.name}|S${s}`]

        return (
          <div key={s} style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 1fr',
            padding: '6px 14px', gap: 6, alignItems: 'center',
            borderTop: '1px solid #14141f',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4a4a6a' }}>S{s}</span>

            {/* Prev poids */}
            <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>
              {prev?.poids || '—'}
            </span>

            {/* Prev reps */}
            <span style={{ textAlign: 'center', fontSize: 13, color: prev ? '#6b5fa0' : '#2a2a40', fontWeight: 500 }}>
              {prev?.reps || '—'}
            </span>

            {/* Input poids */}
            <input
              type="number"
              placeholder="kg"
              value={inp.poids || ''}
              onChange={e => onInput(k, 'poids', e.target.value)}
              style={{
                background: inp.poids ? '#200f1a' : '#1a1a2e',
                border: `1.5px solid ${inp.poids ? '#ef444488' : '#22223a'}`,
                borderRadius: 8, padding: '7px 6px',
                color: inp.poids ? '#fca5a5' : '#e8e8f0',
                fontSize: 14, fontWeight: 600, textAlign: 'center', width: '100%', outline: 'none',
              }}
            />

            {/* Input reps */}
            <input
              type="number"
              placeholder="reps"
              value={inp.reps || ''}
              onChange={e => onInput(k, 'reps', e.target.value)}
              onBlur={() => inp.reps && onTimerOpen()}
              style={{
                background: inp.reps ? '#200f1a' : '#1a1a2e',
                border: `1.5px solid ${inp.reps ? '#ef444488' : '#22223a'}`,
                borderRadius: 8, padding: '7px 6px',
                color: inp.reps ? '#fca5a5' : '#e8e8f0',
                fontSize: 14, fontWeight: 600, textAlign: 'center', width: '100%', outline: 'none',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
