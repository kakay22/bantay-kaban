
import { useEffect, useRef, useState } from 'react'
import { A } from '../audio'

function getDelay(text, index) {
  const ch = text[index]
  const next = text[index + 1]
  const previous = text[index - 1]

  if (ch === '.' || ch === '!' || ch === '?') {
    return 650 + Math.random() * 550
  }
  if (ch === ',') return 260 + Math.random() * 220
  if (ch === ':') return 350 + Math.random() * 200
  if (ch === ';') return 300 + Math.random() * 200

  if (ch === '\n' && next === '\n') {
    return 850 + Math.random() * 450
  }
  if (ch === '\n') return 300 + Math.random() * 180

  const rest = text.slice(index).toLowerCase()

  if (
    ['lost', 'irregular', 'accused', 'waiting', 'auditor'].some(
      word => rest.startsWith(word)
    )
  ) {
    return 100 + Math.random() * 100
  }

  if (Math.random() < 0.035) {
    return 180 + Math.random() * 300
  }

  if (ch === ' ') return 45 + Math.random() * 35
  if (previous === '\n') return 120 + Math.random() * 100

  return 24 + Math.random() * 38
}

export default function Typer({ text, onDone }) {
  const [n, setN] = useState(0)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    setN(0)
    doneRef.current = false
  }, [text])

  useEffect(() => {
    if (n >= text.length) {
      if (!doneRef.current) {
        doneRef.current = true
        onDoneRef.current?.()
      }
      return
    }

    const ch = text[n]
    const timer = window.setTimeout(() => {
      if (ch !== ' ' && ch !== '\n' && Math.random() > 0.18) {
        A.click()
      }

      setN(current => current + 1)
    }, getDelay(text, n))

    return () => window.clearTimeout(timer)
  }, [n, text])


  function handleScreenTap(event) {
    event?.stopPropagation()

    if (n >= text.length) return

    const remaining = text.slice(n)

    // Find the next sentence-ending punctuation.
    const sentenceMatch = remaining.match(/[.!?](?:["')\]]*)?(?=\s|$)/)

    // Find the next explicit line break.
    const newlineIndex = text.indexOf('\n', n)

    let end = text.length

    if (sentenceMatch) {
      end = n + sentenceMatch.index + sentenceMatch[0].length
    }

    // Stop at a line break if it comes before the sentence ending.
    if (newlineIndex !== -1 && newlineIndex < end) {
      end = newlineIndex
    }

    // Skip blank lines and whitespace so the tap always advances.
    while (end < text.length && /\s/.test(text[end])) {
      end++
    }

    if (end <= n) {
      end = Math.min(n + 1, text.length)
    }

    setN(end)
  }


  const typing = n < text.length

  return (
    <div
      className="typer-wrap"
      onClick={handleScreenTap}
      role="presentation"
    >
      <pre className="typ horror-typing">
        {text.slice(0, n)}
        {typing && (
          <i className="cur horror-cursor" aria-hidden="true" />
        )}
      </pre>

      {typing && (
        <span className="typer-skip-hint">
          TAP ANYWHERE TO CONTINUE
        </span>
      )}
    </div>
  )
}
