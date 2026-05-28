# مصاريف السكن — Shared Expense Tracker PWA

A mobile-first Progressive Web App for tracking shared expenses between exactly 3 roommates. Full Arabic UI with RTL layout, offline support, no backend required.

## Features

- **Setup Screen** — Enter the 3 roommates' names once; stored in localStorage forever
- **Add Expense** — Pick who paid, amount, category, optional description, date; splits ÷3 automatically
- **Balances** — Net balance per person, minimal debt list (who owes whom), settle button, WhatsApp-ready copy
- **History** — All expenses newest-first, filter by person or category, delete with confirmation (reverses balance)
- **Rent** — Monthly rent tracker with per-person share and paid/unpaid checkboxes; reset each month
- **Reports** — Spending by category (bar chart) and by person, current month vs all-time toggle
- **Settings** — View roommate names, full data reset

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- Recharts (bar chart)
- Lucide React (icons)
- Tajawal font (Google Fonts)
- localStorage only — no backend, no accounts

## Running Locally

```bash
cd sakan-app
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Building for Production

```bash
npm run build
# Output in dist/
```

To serve the production build locally:
```bash
npx serve dist
```

## Installing as a PWA

### Android (Chrome)
1. Open the app in Chrome
2. Tap the three-dot menu → "Add to Home screen"
3. Or wait for the in-app install banner

### iPhone (Safari)
1. Open the app in Safari
2. Tap the Share button (box with arrow)
3. Scroll down → "Add to Home Screen"
4. Tap "Add"

### Desktop (Chrome/Edge)
1. Open the app
2. Click the install icon in the address bar

## Project Structure

```
src/
  components/
    SetupScreen.jsx   — First-launch name entry
    AddExpense.jsx    — Expense form
    Balances.jsx      — Net balances + debt resolution
    History.jsx       — Expense list with filters
    Rent.jsx          — Monthly rent tracker
    Reports.jsx       — Charts and summaries
    Settings.jsx      — App settings + reset
  hooks/
    useLocalStorage.js
  utils/
    balances.js       — Balance and minimal debt computation
  App.jsx
  main.jsx
public/
  manifest.json
  service-worker.js
  icons/
```

## Resetting Data

Go to **Settings** → "حذف كل البيانات وإعادة الضبط" to wipe all data and restart setup.
