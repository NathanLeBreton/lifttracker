import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getExoHistory } from '../db/db'
import { PROGRAMME } from '../data/programme'

// All exercises flat list
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

export default function Progress({ refreshKey }) {
  const [selected, setSelected] = useState(ALL_EXOS[0]?.name || '')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [maxPoids, setMaxPoids] = useState(0)

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    getExoHistory(selected).then(rows => {
      // Group by date, keep max poids per date
      const byDate = {}
      rows.forEach(r => {
        if (!byDate[r.date] || r.poids > byDate[r.date].poids) {
          byDate[r.date] = r
        }
      })
      const sorted = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
      const formatted = sorted.map(r => ({
        ...r,
        label: new Date(r.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      }))
      setChartData(formatted)
      setMaxPoids(Math.max(...formatted.map(r => r.poids), 0))
      setLoading(false)
    })
  }, [selected, refreshKey])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#1a1a2e', border: '1px solid #2e2e50', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ color: '#6b6b8a', fontSize: 11, marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 16 }}>{payload[0].value} kg</div>
        {payload[1] && <div style={{ color: '#ef4444', fontSize: 13 }}>{payload[1].value} reps</div>}
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

        {/* Exercise selector */}
        <div style={{ marginBottom: 20 }}>
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

        {/* Chart */}
        <div style={{ background: '#12121e', border: '1px solid #1a1a2e', borderRadius: 14, padding: '20px 8px 12px', marginBottom: 16 }}>
          {loading && <div style={{ color: '#3a3a5a', textAlign: 'center', padding: 40 }}>Chargement...</div>}
          {!loading && chartData.length === 0 && (
            <div style={{ color: '#3a3a5a', textAlign: 'center', padding: '32px 16px', fontSize: 13, lineHeight: 1.8 }}>
              Pas encore de données<br />pour cet exercice.
            </div>
          )}
          {!loading && chartData.length > 0 && (
            <>
              <div style={{ paddingLeft: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: 1 }}>Record</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#a78bfa', letterSpacing: 1 }}>
                  {maxPoids} <span style={{ fontSize: 18, color: '#6b6b8a' }}>kg</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="poids" stroke="#a78bfa" strokeWidth={2.5}
                    dot={{ fill: '#a78bfa', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#7c3aed' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Stats */}
        {chartData.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Séances', value: chartData.length },
              { label: 'Départ', value: `${chartData[0]?.poids} kg` },
              { label: 'Progression', value: `+${(chartData[chartData.length-1]?.poids - chartData[0]?.poids).toFixed(1)} kg` },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#12121e', border: '1px solid #1a1a2e',
                borderRadius: 12, padding: '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#e8e8f0', letterSpacing: 1 }}>
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
