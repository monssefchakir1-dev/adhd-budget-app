# Sakina — ADHD Budget Planner (Morocco)

Calm, ADHD-friendly monthly budget planner for **PC and tablet** in the browser. Locale is **Morocco** with **MAD (Dirham)**. Includes a **Vacation fund** savings goal.

No bank connection. Your data stays on the device.

## Features (MVP)

- Monthly **income** that updates totals when amounts change
- **Expense** tracking with planned vs actual
- **Savings goals**, including a featured **Vacation fund**
- Simple **calendar / month overview**
- Morocco sample amounts for the online demo
- Local persistence in the browser; optional JSON export

## Quick start (local)

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

- Fresh planner: open the site and click **Open my planner**
- Prefill demo: open `http://localhost:5173/?demo=1#app`

### Build for hosting (online demo)

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host. Share a link like:

`https://your-domain.example/?demo=1#app`

That is the “try it online” URL you can put in an Etsy PDF.

### Offline product file (no internet)

Buyers who keep the app on their computer:

```bash
npm run build:offline
```

This writes a **single HTML file** under `dist-offline/` (JS/CSS inlined). Copy that HTML to a USB drive or folder. Double-click to open in a browser — works offline; data stays in that browser’s local storage. No server required.

## Online vs offline

| Mode | How | Data |
|------|-----|------|
| **Online demo** | Hosted `dist/` with `?demo=1` | Prefills Morocco sample; does **not** persist edits |
| **Online personal** | Hosted site without `?demo=1` | Saves in that browser via `localStorage` |
| **Offline file** | `dist-offline/*.html` opened locally | Saves in that browser; no network needed |

Etsy can deliver a PDF that only contains the demo link; the real product is this app (hosted and/or the offline HTML).

## Design notes

- Brand: **Sakina** (calm)
- Currency formatting: `fr-MA` + `MAD`
- Target layout: desktop / tablet (min width ~960px)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production static site → `dist/` |
| `npm run build:offline` | Single-file offline HTML → `dist-offline/` |
| `npm run preview` | Preview production build |

## License

Private product source. Adjust before publishing if you open-source it.
