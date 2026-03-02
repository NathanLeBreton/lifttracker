import { useEffect } from 'react'

export default function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [message])

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: '#16a34a', color: '#fff', padding: '12px 20px',
      borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 200,
      whiteSpace: 'nowrap', boxShadow: '0 4px 24px rgba(22,163,74,0.4)',
      animation: 'fadeUp 0.3s ease',
    }}>
      {message}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(8px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>
    </div>
  )
}
