import { useState } from 'react'
import { saveSession } from './db/db'
import Home from './pages/Home'
import Session from './pages/Session'
import LastSession from './pages/LastSession'
import History from './pages/History'
import Progress from './pages/Progress'
import Cardio from './pages/Cardio'
import AvantBras from './pages/AvantBras'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'

export default function App() {
  const [view, setView] = useState('home')
  const [activeDay, setActiveDay] = useState(null)
  const [toast, setToast] = useState(null)
  const [historyKey, setHistoryKey] = useState(0)
  const [cardioKey, setCardioKey] = useState(0)
  const [avantBrasKey, setAvantBrasKey] = useState(0)

  const showToast = (msg) => setToast(msg)

  const openDay = (day) => {
    setActiveDay(day)
    setView('session')
  }

  const viewLastSession = (day) => {
    setActiveDay(day)
    setView('lastSession')
  }

  const handleValidate = async (dayId, rows, notes, dureeMin) => {
    try {
      await saveSession(dayId, rows, notes, dureeMin)
      setHistoryKey(k => k + 1)
      showToast(`✅ ${rows.length} séries archivées !`)
      setTimeout(() => setView('home'), 600)
    } catch (e) {
      console.error(e)
      showToast('❌ Erreur lors de la sauvegarde')
    }
  }

  const handleCardioSaved = () => {
    setCardioKey(k => k + 1)
    showToast('🏃 Séance cardio enregistrée !')
  }

  const handleAvantBrasSaved = () => {
    setAvantBrasKey(k => k + 1)
    showToast('💪 Séance avant-bras enregistrée !')
  }

  const navTo = (v) => {
    if (v === 'home') setActiveDay(null)
    setView(v)
  }

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto',
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: '#0d0d14', position: 'relative', overflow: 'hidden',
    }}>
      {view === 'home' && (
        <Home onOpenDay={openDay} onViewLastSession={viewLastSession} />
      )}
      {view === 'session' && activeDay && (
        <Session day={activeDay} onBack={() => setView('home')} onValidate={handleValidate} />
      )}
      {view === 'lastSession' && activeDay && (
        <LastSession day={activeDay} onBack={() => setView('home')} />
      )}
      {view === 'cardio'    && <Cardio refreshKey={cardioKey} onSaved={handleCardioSaved} />}
      {view === 'avantBras' && <AvantBras refreshKey={avantBrasKey} onSaved={handleAvantBrasSaved} />}
      {view === 'history'   && <History refreshKey={historyKey} />}
      {view === 'progress'  && <Progress refreshKey={historyKey} />}

      {view !== 'session' && view !== 'lastSession' && (
        <BottomNav current={view} onNav={navTo} />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
