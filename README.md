# Bantay-Kaban: Audit Desk

A React (Vite) photo-sorting game. Study each photo and decide: **Legit** or **Irregular**.

## Run it
```bash
npm install
npm run dev        # opens at http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build locally
```
Requires Node.js 18+.

## Use your own photos
1. Put your image files in `public/photos/`.
2. List them in `public/photos/photos.json` (see `photos.example.json`):
   ```json
   [{ "file": "wall.jpg", "irregular": true, "caption": "Brgy. X flood wall", "why": "Ghost project: nothing was built." }]
   ```
3. Add at least 2 entries. With an empty list the game uses the demo cases in `src/demo.js`.

You can also pick photos on the title screen. Name them `I_Caption - reason.jpg` (irregular) or `L_Caption - reason.jpg` (legit). Those are not saved after a refresh.

## Structure
```
src/
  App.jsx            game state and flow
  audio.js           synthesized hum, pen scratching, typing, stamp
  demo.js            demo cases (SVG)
  utils.js           shuffle, image shrink, filename parser
  styles.css         all styling
  components/        Photo, Typer
  screens/           Title, Intro, Play, End
public/photos/       your photos + photos.json
```

## Notes
Check the license of every photo you use. Keep captions general and avoid naming real people as guilty: allegations are not findings.
