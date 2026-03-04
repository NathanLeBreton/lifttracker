import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar,
} from 'recharts'
import { getExoHistory } from '../db/db'
import { PROGRAMME } from '../data/programme'

const ALL_EXOS = []
PROGRAMME.forEach(day => {
  day.muscles.forEach(m => {
    m.exercises.forEach(ex => {
      if (!ALL_EXOS.find(e => e.name === ex.name)) {
        ALL_EXOS.push({ name: ex.name, dayLabel: day.label })
      }
    })
  })
})

const MODES = [
  { id: 'poids', label: 'Charge max' },
  { id: 'volume', label: 'Volume' },
  { id: 'reps', label: 'Reps max' },
]

export default function Progress({ refreshKey }) {
  const [selected, setSelected] = useState(ALL_EXOS[0]?.name || '')
  const [chartData, setChartData] = useState([])
  const [mode, setMode] = useState('poids')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    getExoHistory(selected).then(rows => {
      // Grouper par date
      const byDate = {}
      rows.forEach(r => {
        if (!byDate[r.date]) byDate[r.date] = []
        byDate[r.date].push(r)
      })

      const sorted = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, sets]) => {
          const maxPoids = Math.max(...sets.map(s => s.poids))
          const maxReps  = Math.max(...sets.map(s => s.reps))
          const volume   = sets.reduce((acc, s) => acc + (s.poids * s.reps), 0)
          const bestSet  = sets.reduce((best, s) => (s.poids * s.reps > best.poids * best.reps ? s : best), sets[0])
          return {
            date,
            label: new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            poids: maxPoids,
            reps: maxReps,
            volume: Math.round(volume),
            bestSet,
          }
        })

      setChartData(sorted)

      if (sorted.length > 0) {
        const first = sorted[0]
        const last  = sorted[sorted.length - 1]
        const recent = sorted.slice(-3)
        const trend = recent.length >= 2
          ? recent[recent.length - 1].poids - recent[0].poids
          : 0

        setStats({
          record:      Math.max(...sorted.map(r => r.poids)),
          recordVol:   Math.max(...sorted.map(r => r.volume)),
          progression: (last.poids - first.poids).toFixed(1),
          sessions:    sorted.length,
          trend,
        })
      } else {
        setStats(null)
      }

      setLoading(false)
    })
  }, [selected, refreshKey])

  const trendIcon  = !stats ? '' : stats.trend > 0 ? '↗' : stats.trend < 0 ? '↘' : '→'
  const trendColor = !stats ? '' : stats.trend > 0 ? '#16a34a' : stats.trend < 0 ? '#ef4444' : '#6b6b8a'

  const dataKey    = mode === 'volume' ? 'volume' : mode === 'reps' ? 'reps' : 'poids'
  const lineColor  = mode === 'volume' ? '#0ea5e9' : mode === 'reps' ? '#f97316' : '#a78bfa'
  const unit       = mode === 'volume' ? 'kg·reps' : mode === 'reps' ? 'reps' : 'kg'
  const recordVal  = mode === 'volume' ? stats?.recordVol : mode === 'reps'
    ? (chartData.length ? Math.max(...chartData.map(r => r.reps)) : 0)
    : stats?.record

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#1a1a2e', border: '1px solid #2e2e50', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ color: '#6b6b8a', fontSize: 11, marginBottom: 4 }}>{label}</div>
        <div style={{ color: lineColor, fontWeight: 700, fontSize: 16 }}>
          {payload[0].value} <span style={{ fontSize: 12, color: '#6b6b8a' }}>{unit}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '20px 20px 16px', background: '#0d0d14',
        borderBottom: '1px solid #1a1a2e', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, color: '#fff' }}>
          Progression
        </div>
        <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>Courbes par exercice</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }}>

        {/* Sélecteur exercice */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#4a4a6a', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Exercice
          </div>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{
              width: '100%', background: '#12121e', border: '1px solid #1e1e35',
              borderRadius: 10, padding: '12px 14px', color: '#e8e8f0',
              fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none',
              appearance: 'none',
            }}
          >
            {PROGRAMME.map(day => (
              <optgroup key={day.id} label={`${day.label} – ${day.subtitle}`}>
                {day.muscles.flatMap(m => m.exercises).map(ex => (
                  <option key={ex.name} value={ex.name}>{ex.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Onglets mode */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none',
              background: mode === m.id ? lineColor : '#1a1a2e',
              color: mode === m.id ? '#fff' : '#4a4a6a',
              fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
            }}>{m.label}</button>
          ))}
        </div>

        {/* Graphique */}
        <div style={{ background: '#12121e', border: '1px solid #1a1a2e', borderRadius: 14, padding: '20px 8px 12px', marginBottom: 16 }}>
          {loading && <div style={{ color: '#3a3a5a', textAlign: 'center', padding: 40 }}>Chargement...</div>}
          {!loading && chartData.length === 0 && (
            <div style={{ color: '#3a3a5a', textAlign: 'center', padding: '32px 16px', fontSize: 13, lineHeight: 1.8 }}>
              Pas encore de données<br />pour cet exercice.
            </div>
          )}
          {!loading && chartData.length > 0 && (
            <>
              {/* Record + tendance */}
              <div style={{ paddingLeft: 16, marginBottom: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingRight: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {mode === 'volume' ? 'Volume max' : mode === 'reps' ? 'Reps max' : 'Record'}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: lineColor, letterSpacing: 1 }}>
                    {recordVal} <span style={{ fontSize: 16, color: '#6b6b8a' }}>{unit}</span>
                  </div>
                </div>
                {stats && mode === 'poids' && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      Tendance récente
                    </div>
                    <div style={{ fontSize: 28, color: trendColor }}>{trendIcon}</div>
                  </div>
                )}
              </div>

              {mode === 'volume' ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone" dataKey={dataKey} stroke={lineColor} strokeWidth={2.5}
                      dot={{ fill: lineColor, strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>

        {/* Stats cards */}
        {stats && chartData.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Séances', value: stats.sessions },
              { label: 'Départ', value: `${chartData[0]?.poids} kg` },
              {
                label: 'Progression',
                value: `${stats.progression >= 0 ? '+' : ''}${stats.progression} kg`,
                color: stats.progression > 0 ? '#16a34a' : stats.progression < 0 ? '#ef4444' : '#6b6b8a',
              },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#12121e', border: '1px solid #1a1a2e',
                borderRadius: 12, padding: '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: stat.color || '#e8e8f0', letterSpacing: 1 }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
