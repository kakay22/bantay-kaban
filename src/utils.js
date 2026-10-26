export const sh = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1])

// Shrinks a user-picked image to max 900px and returns a data URL
export const shrink = f => new Promise(res => {
  const r = new FileReader()
  r.onload = () => {
    const im = new Image()
    im.onload = () => {
      const k = Math.min(1, 900 / Math.max(im.width, im.height))
      const c = document.createElement('canvas')
      c.width = im.width * k; c.height = im.height * k
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height)
      res(c.toDataURL('image/jpeg', 0.8))
    }
    im.onerror = () => res(null)
    im.src = r.result
  }
  r.onerror = () => res(null)
  r.readAsDataURL(f)
})

// Filename rule for the in-game picker:
//   I_Caption - why it is irregular.jpg   or   L_Caption - why it is fine.jpg
export const parse = n => {
  const m = n.replace(/\.[^.]+$/, '').match(/^([IiLl])[_\s-]+(.+)$/)
  if (!m) return null
  const a = /i/i.test(m[1]), p = m[2].split(/\s+-\s+/)
  return { a, cap: p[0], why: p[1] || (a ? 'This one was irregular.' : 'This one was legitimate.') }
}

// Greeting from the device's local time
export const greet = () => {
  const g = new Date().getHours()
  return g >= 5 && g < 12 ? 'Good morning' : g >= 12 && g < 18 ? 'Good afternoon' : 'Good evening'
}
