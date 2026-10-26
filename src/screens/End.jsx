export default function End({ sc, total, onAgain, onHome }) {
  const msg = sc === total ? 'Nothing slipped past you.'
    : sc / total >= 0.6 ? 'Sharp eye. A few slipped through.'
    : 'Many slipped through. Look closer at the captions and the details.'
  return (
    <div className="ctr shade"><div className="card">
      <h1>Audit complete</h1>
      <p className="sub">{sc} of {total} sorted correctly. {msg}</p>
      <div className="row">
        <button onClick={onAgain}>Audit another stack</button>
        <button onClick={onHome}>Back to desk</button>
      </div>
    </div></div>
  )
}
