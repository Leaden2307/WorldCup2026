# RSHP World Cup 2026 Sweepstake

A live tracker for the office World Cup 2026 sweepstake — prize board, Golden Boot race,
"who's still in", and a pick finder. Built as a static site (no build step).

## Files
- `index.html` — the page (open it directly in a browser)
- `app.js` — all the interactivity
- `data.js` — the live data (goals, results, eliminations). **This is the file that changes daily.**
- `avatars/`, `fonts/`, `assets/` — photos, Roboto fonts, RSHP logo
- `build_data.py` — regenerates `data.js` from the picks + latest results

Hosting: any static host (e.g. Netlify). Just deploy the folder.
