import Photo from '../components/Photo'
import { greet } from '../utils'

export default function Title({ pool, scat, mine, skip, onPlay, onLoad, bare }) {
  const nI = mine.filter(x => x.a).length
  return (
    <>
      <div className="tb">
        {scat.map(p => (
          <Photo key={p.k} it={pool[p.k % pool.length]} r={p.r}
            style={{ left: p.x + '%', top: p.y + '%', transform: `translate(-50%,-50%) rotate(${p.r}deg)` }} />
        ))}
      </div>
      {!bare && <div className="ctr"><div className="card">
        <span className="chip">{greet()}, auditor</span>
        <h1>Bantay-Kaban</h1>
        <p className="sub">Audit desk. Study each photo and decide: legit or irregular?</p>
        <div className="row">
          <button onClick={onPlay}>Play</button>
        </div>
      </div></div>}
    </>
  )
}
