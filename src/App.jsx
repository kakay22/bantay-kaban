
import { useEffect, useRef, useState } from 'react'
import { A } from './audio'
import { DEMO } from './demo'
import { sh, shrink, parse } from './utils'
import Title from './screens/Title'
import Intro from './screens/Intro'
import Play from './screens/Play'
import HorrorEnding from './screens/HorrorEnding'
import './styles/horror.css'

const BASE = import.meta.env.BASE_URL
const ROUND_SIZE = 15
const DEATH_MISTAKES = 4

export default function App() {
  const [s, setS] = useState('title')
  const [fromFolder, setFolder] = useState([])
  const [mine, setMine] = useState([])
  const [skip, setSkip] = useState(0)
  const [deck, setD] = useState([])
  const [i, setI] = useState(0)
  const [sc, setSc] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [coverUps, setCoverUps] = useState(0)
  const [out, setOut] = useState(null)
  const [res, setRes] = useState(null)
  const [horrorEvent, setHorrorEvent] = useState(null)
  const [ending, setEnding] = useState(null)

  const all = [...fromFolder, ...mine]
  const pool = all.length >= 2 ? all : DEMO

  const scat = useRef(
    Array.from({ length: 14 }, (_, k) => ({
      k,
      x: Math.random() * 86 + 4,
      y: Math.random() * 80 + 6,
      r: Math.random() * 70 - 35
    }))
  ).current

  const rot = useRef(Math.random() * 6 - 3).current

  useEffect(() => {
    let cancelled = false

    fetch(BASE + 'photos/photos.json')
      .then(r => {
        if (!r.ok) throw new Error('Could not load photos')
        return r.json()
      })
      .then(list => {
        if (cancelled || !Array.isArray(list)) return

        setFolder(
          list.map(p => ({
            src: BASE + 'photos/' + p.file,
            a: !!p.irregular,
            cap: p.caption,
            why:
              p.why ||
              (p.irregular
                ? 'This photo contains potential signs of corruption that require further investigation.'
                : 'No visible signs of corruption were identified in this photo.')
          }))
        )
      })
      .catch(() => { })

    return () => {
      cancelled = true
    }
  }, [])

  const load = async e => {
    const ok = []
    let bad = 0

    for (const f of [...e.target.files]) {
      const p = parse(f.name)
      const src = p && await shrink(f)

      if (p && src) {
        ok.push({ ...p, src })
      } else {
        bad++
      }
    }

    setMine(m => [...m, ...ok])
    setSkip(bad)
    e.target.value = ''
  }

  const start = () => {
    setD(sh(pool).slice(0, ROUND_SIZE))
    setI(0)
    setSc(0)
    setMistakes(0)
    setCoverUps(0)
    setOut(null)
    setRes(null)
    setHorrorEvent(null)
    setEnding(null)
    setS('play')
  }

  const pick = g => {
    if (out || res || s !== 'play') return

    const it = deck[i]
    if (!it) return

    const right = g === it.a
    const nextMistakes = mistakes + (right ? 0 : 1)

    // A cover-up means a corruption-related photo was marked CLEAN.
    const isCoverUp = !right && g === false && it.a === true
    const nextCoverUps = coverUps + (isCoverUp ? 1 : 0)

    A.stamp()

    if (right) {
      setSc(v => v + 1)
    } else {
      A.bad()
      setMistakes(nextMistakes)
      setCoverUps(nextCoverUps)

      const event =
        nextMistakes === 1
          ? 'warning'
          : nextMistakes === 2
            ? 'watched'
            : 'critical'

      setHorrorEvent(event)

      window.setTimeout(() => {
        setHorrorEvent(current =>
          current === event ? null : current
        )
      }, 2600)
    }

    setRes({ right, it })

    const feedbackDelay = (it.why || '').length > 70 ? 2600 : 2000

    window.setTimeout(() => {
      setOut(g ? 'R' : 'L')
      A.swish()

      window.setTimeout(() => {
        setOut(null)
        setRes(null)

        // Four mistakes trigger the critical ending immediately.
        if (nextMistakes >= DEATH_MISTAKES) {
          setEnding('last-inspection')
          setS('end')
          return
        }

        if (i + 1 >= deck.length) {
          if (nextCoverUps >= 2 || nextMistakes >= 3) {
            setEnding('cover-up')
          } else {
            setEnding('truth')
          }

          setS('end')
          return
        }

        setI(current => current + 1)
      }, 560)
    }, feedbackDelay)
  }

  return (
    <div className={`table horror-stage ${horrorEvent ? `event-${horrorEvent}` : ''}`}>
      {(s === 'title' || s === 'intro') && (
        <Title
          bare={s === 'intro'}
          pool={pool}
          scat={scat}
          mine={mine}
          skip={skip}
          onLoad={load}
          onPlay={() => {
            A.init()
            setS('intro')
          }}
        />
      )}

      {s === 'intro' && (
        <Intro
          onStart={() => {
            A.click()
            start()
          }}
        />
      )}

      {s === 'play' && (
        <Play
          deck={deck}
          i={i}
          sc={sc}
          mistakes={mistakes}
          intensity={mistakes}
          out={out}
          res={res}
          rot={rot}
          pick={pick}
          horrorEvent={horrorEvent}
        />
      )}

      {s === 'end' && (
        <HorrorEnding
          ending={ending || 'truth'}
          sc={sc}
          reviewed={i + 1}
          total={deck.length}
          mistakes={mistakes}
          coverUps={coverUps}
          onAgain={start}
          onHome={() => {
            setHorrorEvent(null)
            setS('title')
          }}
        />
      )}
    </div>
  )
}
