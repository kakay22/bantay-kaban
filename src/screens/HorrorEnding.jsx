
import { useEffect } from 'react'
import { A } from '../audio'

const ENDINGS = {
  truth: {
    title: 'THE TRUTH',
    subtitle: 'CASE CLOSED',
    message:
      'You preserved the evidence. The irregularities were exposed, and the report was submitted before dawn.',
    document: 'AUDIT STATUS: EVIDENCE PRESERVED',
    className: 'ending-truth'
  },
  'cover-up': {
    title: 'THE COVER-UP',
    subtitle: 'REPORT APPROVED',
    message:
      'The suspicious projects passed inspection. The report was approved. Your signature appears at the bottom, but you do not remember signing it.',
    document: 'AUDIT STATUS: APPROVED — NO FURTHER ACTION',
    className: 'ending-coverup'
  },
  'last-inspection': {
    title: 'THE LAST INSPECTION',
    subtitle: 'INSPECTOR MISSING',
    message:
      'The lamp goes out. Something moves behind your chair. By morning, the office is empty. A new stack of photographs waits on the desk.',
    document: 'AUDIT STATUS: INSPECTOR UNAVAILABLE',
    className: 'ending-death'
  }
}

export default function HorrorEnding({
  ending,
  sc,
  total,
  reviewed,
  mistakes,
  coverUps,
  onAgain,
  onHome
}) {
  const result = ENDINGS[ending] || ENDINGS.truth
  const isDeath = ending === 'last-inspection'

  useEffect(() => {
    if (!isDeath) return

    // A sudden, harsh synthesized sting. This is not a recorded human scream.
    A.bad()

    const timer = window.setTimeout(() => {
      A.scratch()
      A.n(0.9, 180, 2.2, 'lowpass')
    }, 450)

    return () => window.clearTimeout(timer)
  }, [isDeath])

  return (
    <div className={`horror-ending ${result.className}`}>
      <div className="ending-grain" />

      <div className="ending-card">
        <p className="ending-eyebrow">THE LAST INSPECTOR // FINAL REPORT</p>

        {isDeath && <div className="ending-flash" />}

        <p className="ending-subtitle">{result.subtitle}</p>
        <h1>{result.title}</h1>
        <p className="ending-message">{result.message}</p>

        <div className="ending-document">
          <span>OFFICIAL RECORD</span>
          <strong>{result.document}</strong>
          <small>FILE: INSPECTION-013</small>
        </div>

        <div className="ending-stats">
          <div>
            <span>PHOTOS REVIEWED</span>
            <strong>{Math.min(reviewed, total)}</strong>
          </div>
          <div>
            <span>CORRECT CALLS</span>
            <strong>{sc}</strong>
          </div>
          <div>
            <span>ERRORS</span>
            <strong>{mistakes}</strong>
          </div>
          <div>
            <span>PROJECTS COVERED UP</span>
            <strong>{coverUps}</strong>
          </div>
        </div>

        {isDeath && (
          <p className="ending-last-line">
            THERE IS ANOTHER FILE ON THE DESK.
          </p>
        )}

        <div className="ending-actions">
          <button onClick={onAgain}>INSPECT AGAIN</button>
          <button className="ending-home" onClick={onHome}>
            RETURN TO OFFICE
          </button>
        </div>
      </div>
    </div>
  )
}
