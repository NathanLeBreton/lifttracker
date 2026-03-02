import { useState, useEffect, useRef } from 'react'

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    zIndex: 300, backdropFilter: 'blur(4px)',
  },
  label: { fontSize: 13, color: '#6b6b8a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
  time: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 96, color: '#fff',
    lineHeight: 1, letterSpacing: 4,
  },
  timeWarn: { color: '#ef4444' },
  sub: { fontSize: 13, color: '#4a4a6a', marginTop: 12 },
  ring: {
    position: 'relative', width: 200, height: 200, marginBottom: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  svg: { position: 'absolute', inset: 0, transform: 'rotate(-90deg)' },
  btns: { display: 'flex', gap: 12, marginTop: 32 },
  btn: {
    padding: '12px 24px', borderRadius: 12, border: 'none',
    fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
  },
  btnStop: { background: '#1a1a2e', color: '#a0a0c0' },
  btnSkip: { background: '#7c3aed', color: '#fff' },
  btnPresets: { display: 'flex', gap: 8, marginTop: 12 },
  preset: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #1e1e35',
    background: 'transparent', color: '#6b6b8a', fontSize: 12, fontFamily: "'DM Sans', sans-serif",
  },
}

export default function RestTimer({ onClose }) {
  const DEFAULT = 90
  const [total, setTotal] = useState(DEFAULT)
  const [remaining, setRemaining] = useState(DEFAULT)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            // Vibration si dispo
            if (navigator.vibrate) navigator.vibrate([300, 100, 300])
            return 0
          }
          return r - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const reset = (t) => {
    clearInterval(intervalRef.current)
    setTotal(t)
    setRemaining(t)
    setRunning(true)
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`
  const progress = remaining / total
  const circumference = 2 * Math.PI * 88
  const dash = circumference * progress

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.label}>Repos</div>
      <div style={s.ring}>
        <svg style={s.svg} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="#1a1a2e" strokeWidth="6" />
          <circle
            cx="100" cy="100" r="88" fill="none"
            stroke={remaining < 10 ? '#ef4444' : '#7c3aed'}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <div style={{ ...s.time, ...(remaining < 10 ? s.timeWarn : {}) }}>{timeStr}</div>
      </div>
      {remaining === 0 && <div style={{ ...s.sub, color: '#16a34a', fontWeight: 600 }}>C'est parti ! 💪</div>}
      <div style={s.btns}>
        <button style={{ ...s.btn, ...s.btnStop }} onClick={onClose}>Fermer</button>
        <button style={{ ...s.btn, ...s.btnSkip }} onClick={onClose}>Passer ›</button>
      </div>
      <div style={s.btnPresets}>
        {[60, 90, 120, 180].map(t => (
          <button key={t} style={s.preset} onClick={() => reset(t)}>
            {t < 60 ? `${t}s` : `${t/60}min`}
          </button>
        ))}
      </div>
    </div>
  )
}
