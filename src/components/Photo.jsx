
import { useEffect } from 'react'

export default function Photo({ it, r = 0, cls = '', style, children }) {
  useEffect(() => {
    if (!it?.src) return

    const img = new Image()
    img.src = it.src

    if (img.decode) {
      img.decode().catch(() => {})
    }
  }, [it?.src])

  return (
    <div
      className={`pol ${cls}`}
      style={{ '--r': `${r}deg`, ...style }}
    >
      <div className="img">
        {it.src ? (
          <img
            src={it.src}
            alt={it.cap || 'Inspection photograph'}
            decoding="async"
            draggable={false}
          />
        ) : (
          <div
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{ __html: it.svg }}
          />
        )}
      </div>

      <span className="cap">{it.cap}</span>
      {children}
    </div>
  )
}
