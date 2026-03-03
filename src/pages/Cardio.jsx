import { useState, useEffect } from 'react'
import { saveCardio, getAllCardio, deleteCardio, getCardioStats } from '../db/db'

const TYPES = ['Tapis incliné', 'Tapis plat', 'Autre']

const fmtDuree = (min) => {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`
}

const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {
  weekday: 'short', day: 'numeric', month: 'short'
})

export default function Cardio({ refreshKey, onSaved }) {
  const [sessions, setSessions] = useState([])
  const [stats, setStats]       = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod]     = useState('week') // week | month | year | all
  const [loading, setLoading]   = useState(true)

  const [form, setForm] = useState({
    type: 'Tapis incliné', typeCustom: '',
    duree: '', distance: '', inclinaison: '', calories: '', note: '',
  })

  const load = async () => {
    const [all, s] = await Promise.all([getAllCardio(), getCardioStats()])
    setSessions(all)
    setStats(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [refreshKey])

  const handleSave = async () => {
    if (!form.duree) { alert('La durée est obligatoire.'); return }
    const type = form.type === 'Autre' ? (form.typeCustom || 'Autre') : form.type
    await saveCardio({
      type,
      duree:       form.duree,
      distance:    form.distance,
      inclinaison: form.inclinaison,
      calories:    form.calories,
      note:        form.note,
    })
    setForm({ type: 'Tapis incliné', typeCustom: '', duree: '', distance: '', inclinaison: '', calories: '', note: '' })
    setShowForm(false)
    onSaved()
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette séance cardio ?')) return
    await deleteCardio(id)
    load()
  }

  const currentStats = stats?.[period]
  const periodLabels = { week: 'Cette semaine', month: 'Ce mois', year: 'Cette année', all: 'Total' }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        padding: '20px 20px 16px', background: '#0d0d14',
        borderBottom: '1px solid #1a1a2e', position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, color: '#fff' }}>
            Cardio
          </div>
          <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{sessions.length} séances enregistrées</div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            border: 'none', borderRadius: 12, padding: '10px 16px',
            color: '#fff', fontSize: 13, fontWeight: 600,
          }}
        >＋ Séance</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }}>

        {/* Récap stats */}
        {stats && (
          <div style={{ marginBottom: 20 }}>
            {/* Sélecteur période */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {Object.entries(periodLabels).map(([k, label]) => (
                <button key={k} onClick={() => setPeriod(k)} style={{
                  flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none',
                  background: period === k ? '#0ea5e9' : '#1a1a2e',
                  color: period === k ? '#fff' : '#4a4a6a',
                  fontSize: 10, fontWeight: 600,
                }}>{label}</button>
              ))}
            </div>

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Séances',   value: currentStats?.sessions || 0,                         unit: '' },
                { label: 'Durée',     value: fmtDuree(currentStats?.dureeMin || 0),               unit: '' },
                { label: 'Distance',  value: currentStats?.distanceKm ? `${currentStats.distanceKm.toFixed(1)}` : '—', unit: 'km' },
                { label: 'Calories',  value: currentStats?.calories ? `${currentStats.calories}` : '—', unit: 'kcal' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#12121e', border: '1px solid #1a1a2e',
                  borderRadius: 12, padding: '14px 14px',
                }}>
                  <div style={{ fontSize: 10, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#0ea5e9', letterSpacing: 1 }}>
                    {stat.value} <span style={{ fontSize: 13, color: '#4a4a6a' }}>{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique */}
        {loading && <div style={{ color: '#3a3a5a', textAlign: 'center', padding: 40 }}>Chargement...</div>}
        {!loading && sessions.length === 0 && (
          <div style={{ color: '#3a3a5a', textAlign: 'center', padding: 60, fontSize: 14, lineHeight: 1.8 }}>
            Aucune séance cardio.<br />Tape ＋ Séance pour commencer !
          </div>
        )}
        {sessions.map(s => (
          <div key={s.id} style={{
            background: '#12121e', border: '1px solid #1a1a2e',
            borderRadius: 14, padding: '14px 16px', marginBottom: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#fff', letterSpacing: 1 }}>
                  {s.type}
                </span>
                <span style={{ fontSize: 10, color: '#4a4a6a' }}>{fmtDate(s.date)}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {s.duree && <Chip icon="⏱" value={fmtDuree(parseInt(s.duree))} />}
                {s.distance && <Chip icon="📍" value={`${s.distance} km`} />}
                {s.inclinaison && <Chip icon="📐" value={`${s.inclinaison}%`} />}
                {s.calories && <Chip icon="🔥" value={`${s.calories} kcal`} />}
              </div>
              {s.note && (
                <div style={{ fontSize: 11, color: '#6b5fa0', fontStyle: 'italic', marginTop: 8 }}>
                  💬 {s.note}
                </div>
              )}
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              style={{ background: 'none', border: 'none', color: '#3a3a5a', fontSize: 14, padding: 4, marginLeft: 8 }}
            >🗑</button>
          </div>
        ))}
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200,
          backdropFilter: 'blur(4px)',
        }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{
            width: '100%', maxWidth: 430, margin: '0 auto',
            background: '#12121e', borderRadius: '20px 20px 0 0',
            padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#fff', letterSpacing: 1 }}>
              Nouvelle séance cardio
            </div>

            {/* Type */}
            <div>
              <Label>Type</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8,
                    border: `1.5px solid ${form.type === t ? '#0ea5e9' : '#1e1e35'}`,
                    background: form.type === t ? '#0c2a3a' : '#1a1a2e',
                    color: form.type === t ? '#0ea5e9' : '#4a4a6a',
                    fontSize: 11, fontWeight: 600,
                  }}>{t}</button>
                ))}
              </div>
              {form.type === 'Autre' && (
                <input
                  placeholder="Précise le type..."
                  value={form.typeCustom}
                  onChange={e => setForm(f => ({ ...f, typeCustom: e.target.value }))}
                  style={inputStyle}
                />
              )}
            </div>

            {/* Durée + Distance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <Label>Durée (min) *</Label>
                <input type="number" placeholder="ex: 35" value={form.duree}
                  onChange={e => setForm(f => ({ ...f, duree: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div>
                <Label>Distance (km)</Label>
                <input type="number" placeholder="ex: 3.2" value={form.distance}
                  onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>

            {/* Inclinaison + Calories */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <Label>Inclinaison (%)</Label>
                <input type="number" placeholder="ex: 8" value={form.inclinaison}
                  onChange={e => setForm(f => ({ ...f, inclinaison: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div>
                <Label>Calories (kcal)</Label>
                <input type="number" placeholder="ex: 320" value={form.calories}
                  onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>

            {/* Note */}
            <div>
              <Label>Note (optionnel)</Label>
              <textarea placeholder="Ressenti, conditions..." value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                rows={2} style={{ ...inputStyle, resize: 'none', fontStyle: 'italic' }} />
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1, padding: 14, borderRadius: 12, border: 'none',
                background: '#1a1a2e', color: '#6b6b8a', fontSize: 14, fontWeight: 600,
              }}>Annuler</button>
              <button onClick={handleSave} style={{
                flex: 2, padding: 14, borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: '#fff', fontSize: 14, fontWeight: 600,
              }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ icon, value }) {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: '#1a1a2e', borderRadius: 6, padding: '3px 8px',
      fontSize: 11, color: '#a0a0c0',
    }}>
      {icon} {value}
    </span>
  )
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, color: '#4a4a6a', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: '#1a1a2e', border: '1.5px solid #22223a',
  borderRadius: 8, padding: '10px 12px', color: '#e8e8f0',
  fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none',
}
