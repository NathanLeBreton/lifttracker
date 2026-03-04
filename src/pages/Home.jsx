import { useState, useEffect } from 'react'
import { PROGRAMME } from '../data/programme'
import { getSessionsThisWeek, getWeekStreak } from '../db/db'

const DAY_ORDER = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 7 }

const getTodayDayId = () => {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  return days[new Date().getDay()]
}

export default function Home({ onOpenDay, onViewLastSession }) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
  const todayId = getTodayDayId()
  const todayOrder = DAY_ORDER[todayId] || 0

  const [doneThisWeek, setDoneThisWeek] = useState(new Set())
  const [expandedDay, setExpandedDay] = useState(null)
  const [streak, setStreak] = useState({ sessions: 0, days: 0 })

  useEffect(() => {
    getSessionsThisWeek().then(setDoneThisWeek)
    getWeekStreak().then(setStreak)
  }, [])

  const handleCardClick = (day) => {
    setExpandedDay(expandedDay === day.id ? null : day.id)
  }

  return (
    <div style={{ flex: 1, paddingBottom: 100, overflowY: 'auto' }}>
      <div style={{
        padding: '20px 24px 20px',
        background: 'linear-gradient(160deg, #12121e 0%, #1a0a2e 100%)',
        borderBottom: '1px solid #1e1e30',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 40, letterSpacing: 2, lineHeight: 1,
          background: 'linear-gradient(135deg, #fff 30%, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: '0 auto',
        }}>6-Days Breton's Split</h1>
        <p style={{ color: '#a78bfa', fontSize: 11, marginTop: 8, opacity: 0.8, fontStyle: 'italic', letterSpacing: 0.5 }}>
          Inspiré par le travail du grand et unique Michaël D. Gundill 🙏
        </p>
        <p style={{ color: '#6b6b8a', fontSize: 14, marginTop: 16, fontWeight: 300 }}>{cap(today)}</p>

        {streak.sessions > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            marginTop: 16, background: '#1a1a2e', borderRadius: 12,
            padding: '8px 16px', border: '1px solid #2a2a45',
          }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#fff', letterSpacing: 1, lineHeight: 1 }}>
                {streak.sessions} séance{streak.sessions > 1 ? 's' : ''} cette semaine
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PROGRAMME.map(day => {
          const isToday = day.id === todayId
          const isPast = DAY_ORDER[day.id] < todayOrder
          const done = doneThisWeek.has(day.id)
          const missed = isPast && !done
          const isExpanded = expandedDay === day.id

          return (
            <div key={day.id}>
              <DayCard
                day={day}
                isToday={isToday}
                done={done}
                missed={missed}
                isExpanded={isExpanded}
                onClick={() => handleCardClick(day)}
              />
              {isExpanded && (
                <div style={{
                  display: 'flex', gap: 8, padding: '0 4px 4px',
                }}>
                  <button
                    onClick={() => { setExpandedDay(null); onOpenDay(day) }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 12,
                      background: `linear-gradient(135deg, ${day.accent}33, ${day.accent}22)`,
                      border: `1px solid ${day.accent}66`,
                      color: '#fff', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    ＋ Nouvelle séance
                  </button>
                  <button
                    onClick={() => { setExpandedDay(null); onViewLastSession(day) }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 12,
                      background: '#1a1a2e', border: '1px solid #2a2a45',
                      color: '#a0a0c0', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    📋 Dernière séance
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayCard({ day, isToday, done, missed, isExpanded, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isToday ? `${day.accent}11` : '#12121e',
        border: `1px solid ${isToday ? day.accent : isExpanded ? '#2a2a45' : '#1e1e35'}`,
        borderRadius: isExpanded ? '16px 16px 0 0' : 16,
        padding: '18px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.18s, background 0.18s',
        boxShadow: isToday ? `0 0 16px ${day.accent}22` : 'none',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: isToday ? 4 : 3,
        background: day.accent, borderRadius: '0 2px 2px 0',
      }} />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#fff' }}>
            {day.label}
          </div>
          {isToday && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
              background: `${day.accent}33`, color: day.accent, letterSpacing: 1,
              textTransform: 'uppercase',
            }}>Aujourd'hui</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#6b6b8a', marginTop: 2 }}>{day.subtitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {done && (
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: '#16a34a33', border: '1.5px solid #16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#16a34a',
          }}>✓</div>
        )}
        {missed && (
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: '#ef444433', border: '1.5px solid #ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ef4444',
          }}>✗</div>
        )}
        <div style={{
          color: isExpanded ? day.accent : '#3a3a5a', fontSize: 20,
          transition: 'transform 0.15s',
          transform: isExpanded ? 'rotate(90deg)' : 'none',
        }}>›</div>
      </div>
    </div>
  )
}
