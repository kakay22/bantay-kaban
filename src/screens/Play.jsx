
import { useEffect } from 'react'
import { A } from '../audio'
import Photo from '../components/Photo'

const CLUES = {
  4: 'A shadow stands where nobody should be.',
  9: 'You have seen this figure before.',
  14: 'Someone has been watching your inspection.'
}

const EVENTS = {
  warning: {
    title: 'CHECK AGAIN',
    message: 'Something is wrong with this report.'
  },
  watched: {
    title: 'YOU ARE NOT ALONE',
    message: 'A movement appears at the edge of your vision.'
  },
  critical: {
    title: 'FINAL WARNING',
    message: 'The report is no longer under your control.'
  }
}

export default function Play({
  deck,
  i,
  sc,
  mistakes = 0,
  intensity = 0,
  out,
  res,
  rot,
  pick,
  horrorEvent
}) {

  useEffect(() => {
    A.init()
    A.startHorror()
    A.startHorrorTrack()

    return () => {
      A.stopHorror()
      A.stopHorrorTrack()
    }
  }, [])

  useEffect(() => {
    for (const photo of deck.slice(i + 1, i + 4)) {
      if (!photo?.src) continue

      const img = new Image()
      img.src = photo.src

      if (img.decode) {
        img.decode().catch(() => { })
      }
    }
  }, [deck, i])

  const current = deck[i]

  if (!current) return null

  const special = Object.prototype.hasOwnProperty.call(CLUES, i)
  const event = EVENTS[horrorEvent]

  return (
    <div className={`play-scene tension-${Math.min(intensity, 4)}`}>
      <div className="hud">
        <span>PHOTO {i + 1} / {deck.length}</span>
      </div>

      <div className="prog">
        <i style={{ width: `${((i + 1) / deck.length) * 100}%` }} />
      </div>

      <div className="main">
        <Photo
          key={i}
          it={current}
          r={rot * (i % 2 ? 1 : -1)}
          cls={`${out || 'in'} ${special ? 'anomaly-photo' : ''}`}
        >
          {special && !res && (
            <div className="photo-clue">
              <span>PHOTO ANOMALY</span>
              <small>{CLUES[i]}</small>
            </div>
          )}

          {res && (
            <div className={`stamp ${res.it.a ? 'r' : 'g'}`}>
              {res.it.a ? 'CORRUPTION' : 'CLEAN'}
            </div>
          )}
        </Photo>
      </div>

      {event && (
        <div className={`horror-event horror-event-${horrorEvent}`}>
          <span className="event-mark">!</span>
          <strong>{event.title}</strong>
          <p>{event.message}</p>
        </div>
      )}

      {res && (
        <div className={`note ${res.right ? 'feedback-good' : 'feedback-bad'}`}>
          <b className={res.right ? 'g' : 'r'}>
            {res.right ? 'CORRECT. ' : 'INCORRECT. '}
          </b>
          {res.it.why || 'Review the evidence carefully.'}
        </div>
      )}

      <div className="bar">
        <button
          className="leg"
          disabled={!!res || !!out}
          onClick={() => pick(false)}
        >
          CLEAN
        </button>

        <button
          className="irr"
          disabled={!!res || !!out}
          onClick={() => pick(true)}
        >
          CORRUPTION
        </button>
      </div>

      {mistakes >= 2 && (
        <div className="whisper">
          {mistakes >= 3
            ? 'THE REPORT HAS ALREADY BEEN SIGNED.'
            : 'DID SOMETHING MOVE BEHIND THE PHOTO?'}
        </div>
      )}
    </div>
  )
}
