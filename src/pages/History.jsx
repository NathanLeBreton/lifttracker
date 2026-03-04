import { useState, useEffect } from 'react'
import { getAllHistory, deleteSession, db } from '../db/db'
import { PROGRAMME } from '../data/programme'

const DAY_LABELS = Object.fromEntries(PROGRAMME.map(d => [d.id, `${d.label} – ${d.subtitle}`]))

const fmtDuree = (min) => {
  if (!min) return null
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`
}

export default function History({ refreshKey }) {
  const [data, setData] = useState([])
  const [open, setOpen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resetInput, setResetInput] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    getAllHistory().then(h => { setData(h); setLoading(false) })
  }, [refreshKey])

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation()
    if (!confirm('Supprimer cette séance ?')) return
    await deleteSession(sessionId)
    setData(prev => prev.filter(s => s.id !== sessionId))
  }

  const handleResetClick = () => {
    if (!confirm('⚠️ Tu es sur le point de supprimer TOUTES tes données.\n\nCette action est irréversible. Continuer ?')) return
    setShowResetConfirm(true)
    setResetInput('')
  }

  const handleResetConfirm = async () => {
    if (resetInput !== 'RESET') {
      alert('Tu dois taper exactement "RESET" pour confirmer.')
      return
    }
    await db.sets.clear()
    await db.sessions.clear()
    setData([])
    setShowResetConfirm(false)
    setResetInput('')
    alert('✅ Toutes les données ont été supprimées.')
  }

  const formatDate = (iso) => {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '20px 20px 16px', background: '#0d0d14',
        borderBottom: '1px solid #1a1a2e', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, color: '#fff' }}>
          Historique
        </div>
        <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{data.length} séances archivées</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }}>
        {loading && <div style={{ color: '#3a3a5a', textAlign: 'center', padding: 40 }}>Chargement...</div>}
        {!loading && data.length === 0 && (
          <div style={{ color: '#3a3a5a', textAlign: 'center', padding: 60, fontSize: 14, lineHeight: 1.8 }}>
            Valide ta première séance<br />pour voir l'historique ici.
          </div>
        )}
        {data.map((session, i) => (
          <div key={session.id} style={{
            background: '#12121e', border: '1px solid #1a1a2e',
            borderRadius: 14, overflow: 'hidden', marginBottom: 10,
          }}>
            <div
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: open === i ? '1px solid #1a1a2e' : 'none',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, color: '#fff' }}>
                  {DAY_LABELS[session.dayId] || session.dayId}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: '#4a4a6a' }}>
                    {formatDate(session.date)} · {session.sets.length} séries
                  </span>
                  {fmtDuree(session.dureeMin) && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 4,
                      background: '#1a1a2e', color: '#a78bfa',
                    }}>
                      ⏱ {fmtDuree(session.dureeMin)}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  onClick={e => handleDelete(session.id, e)}
                  style={{ background: 'none', border: 'none', color: '#3a3a5a', fontSize: 14, padding: 4 }}
                >🗑</button>
                <div style={{ color: '#3a3a5a', fontSize: 14 }}>{open === i ? '▲' : '▼'}</div>
              </div>
            </div>
            {open === i && (
              <div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 44px 52px 52px',
                  padding: '6px 16px', gap: 8,
                }}>
                  {['Exercice', 'S', 'kg', 'reps'].map(h => (
                    <span key={h} style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#3a3a5a', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {session.sets.map((row, j) => (
                  <div key={j} style={{
                    display: 'grid', gridTemplateColumns: '1fr 44px 52px 52px',
                    padding: '8px 16px', gap: 8, alignItems: 'center',
                    borderTop: '1px solid #14141f',
                    background: j % 2 === 0 ? '#0f0f1a' : 'transparent',
                  }}>
                    <span style={{ fontSize: 12, color: '#c0c0d8' }}>{row.exo}</span>
                    <span style={{ fontSize: 11, color: '#4a4a6a', textAlign: 'center' }}>{row.serie}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', textAlign: 'center' }}>{row.poids || '–'}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', textAlign: 'center' }}>{row.reps || '–'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Zone RESET */}
        <div style={{
          marginTop: 40, padding: '20px 16px',
          border: '1px solid #2a0f0f', borderRadius: 14, background: '#120808',
        }}>
          <div style={{ fontSize: 11, color: '#6b2020', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            ⚠️ Zone dangereuse
          </div>
          <div style={{ fontSize: 12, color: '#4a2020', marginBottom: 12, lineHeight: 1.6 }}>
            Supprime toutes les séances et données de progression. Action irréversible.
          </div>
          {!showResetConfirm ? (
            <button onClick={handleResetClick} style={{
              background: 'transparent', border: '1px solid #6b2020',
              borderRadius: 8, padding: '8px 16px', color: '#6b2020', fontSize: 12, fontWeight: 600,
            }}>Réinitialiser toutes les données</button>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 8, fontWeight: 600 }}>Tape "RESET" pour confirmer :</div>
              <input
                type="text" value={resetInput} onChange={e => setResetInput(e.target.value)} placeholder="RESET"
                style={{
                  background: '#1a0808', border: '1.5px solid #6b2020', borderRadius: 8, padding: '8px 12px',
                  color: '#ef4444', fontSize: 14, fontWeight: 600, width: '100%', outline: 'none', marginBottom: 10,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowResetConfirm(false)} style={{
                  flex: 1, background: '#1a1a2e', border: 'none', borderRadius: 8, padding: '8px', color: '#6b6b8a', fontSize: 12,
                }}>Annuler</button>
                <button onClick={handleResetConfirm} style={{
                  flex: 1, background: resetInput === 'RESET' ? '#7f1d1d' : '#2a0f0f',
                  border: 'none', borderRadius: 8, padding: '8px',
                  color: resetInput === 'RESET' ? '#fca5a5' : '#4a2020',
                  fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                }}>Supprimer tout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
