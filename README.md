# Nexus Billing

A modern, browser-based invoicing application built with vanilla HTML, CSS, and ES modules. Create professional invoices with itemized lines, discounts, taxes, and shipping — then save, print, or export them.

## Features

- **Complete billing workflow** — customer details, invoice number, date, itemized line items with edit and remove controls
- **Live totals** — subtotal, percentage or fixed discount, percentage or fixed tax, shipping, and grand total recalculated in real time
- **Inline validation** — friendly error messages instead of alert popups
- **Persistence** — the current draft autosaves to your browser; "Save Invoice" archives it to history
- **Invoice history** — reopen, reload, or delete previously saved invoices from the history drawer
- **Print-ready** — dedicated print stylesheet produces a clean paper invoice
- **Export** — download any invoice as JSON
- **Responsive UI** — card-based layout that works on desktop and mobile
- **Modular architecture** — logic split across `utils`, `invoice`, `store`, `render`, and `app` modules with no inline event handlers

## Project structure

```
├── index.html          # Semantic layout & entry point
├── style.css           # Design system + print styles
└── js/
    ├── app.js          # Wiring, event handling, boot
    ├── render.js       # DOM rendering (items, summary, history)
    ├── invoice.js      # Pure calculation logic (totals, discount, tax)
    ├── store.js        # localStorage persistence (draft + archive)
    └── utils.js        # Formatting, IDs, helpers
```

## How to run

Serve the folder over HTTP (ES modules require a server):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Purpose

Upgraded from a summer-break first-semester practice project into a proper invoice application — exercising DOM manipulation, state management, localStorage, and CSS design systems in vanilla JavaScript.

## Stack

Vanilla JavaScript (ES modules), HTML5, CSS3 — no frameworks or build step required.
