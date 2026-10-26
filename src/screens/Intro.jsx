import { useState } from 'react'
import Typer from '../components/Typer'
import { greet } from '../utils'

const body = `

A stack of photographs from the regional office lies on your desk.

Some reveal ordinary scenes. Others may hide signs of corruption, suspicious activity, or evidence that something is not right.

If no signs of corruption are apparent, press CLEAN.

If the photograph raises concerns about possible corruption, press CORRUPTION.`

export default function Intro({ onStart }) {
  const TXT = `${greet()}, auditor.${body}`
  const [ready, setReady] = useState(false)

  return (
    <div className="ctr shade horror-intro">
      <div className="card horror-intro-card">
        <div className="intro-stamp">REGIONAL OFFICE · INTERNAL REVIEW</div>

        <div className="intro-terminal-status">
          <span className="intro-status-dot" />
          ARCHIVE TERMINAL — CONNECTION UNSTABLE
        </div>

        <div className="intro-typed-copy">
          <Typer
            key={TXT}
            text={TXT}
            onDone={() => setReady(true)}
          />
        </div>

        {ready && (
          <button className="horror-start-button" onClick={onStart}>
            BEGIN THE AUDIT <span aria-hidden="true">→</span>
          </button>
        )}

        <div className="intro-footer">FILE 09-A · ALL ACTIONS ARE RECORDED</div>
      </div>
    </div>
  )
}