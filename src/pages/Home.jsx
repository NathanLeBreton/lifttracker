import { PROGRAMME } from '../data/programme'

export default function Home({ onOpenDay, doneDays }) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div style={{ flex: 1, paddingBottom: 100, overflowY: 'auto' }}>
      <div style={{
        padding: '48px 24px 32px',
        background: 'linear-gradient(160deg, #12121e 0%, #1a0a2e 100%)',
        borderBottom: '1px solid #1e1e30',
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 2, lineHeight: 1,
          background: 'linear-gradient(135deg, #fff 30%, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>MUSCU<br />BRETON</h1>
        <p style={{ color: '#6b6b8a', fontSize: 14, marginTop: 6, fontWeight: 300 }}>{cap(today)}</p>
      </div>
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PROGRAMME.map(day => (
          <DayCard key={day.id} day={day} done={!!doneDays[day.id]} onClick={() => onOpenDay(day)} />
        ))}
      </div>
    </div>
  )
}

function DayCard({ day, done, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#12121e', border: '1px solid #1e1e35', borderRadius: 16,
        padding: '18px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.18s, background 0.18s',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: day.accent, borderRadius: '0 2px 2px 0',
      }} />
      <div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#fff' }}>
          {day.label}
        </div>
        <div style={{ fontSize: 12, color: '#6b6b8a', marginTop: 2 }}>{day.subtitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {done && (
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: '#16a34a33', border: '1.5px solid #16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
          }}>✓</div>
        )}
        <div style={{ color: '#3a3a5a', fontSize: 20 }}>›</div>
      </div>
    </div>
  )
}
