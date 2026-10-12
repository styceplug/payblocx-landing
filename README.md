# PayBlocx landing page

Static site (Vite, plain HTML/CSS/JS) built from the Figma "Landing Page" frames, adapted for PayBlocx.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/, deploy anywhere (Vercel, Netlify, nginx)
```

## Before launch

- `src/config.js`: `waitlistEndpoint` (until set, Join Waitlist opens a pre-filled email to support), social accounts (empty ones are hidden), newsletter endpoint.
- `public/assets/screens/`: `hero1-4.png` are framed phone screenshots used everywhere (no CSS frame). `hero-select-currency.png` is the select-currency screen composited into the same frame.
- Fonts: body uses Satoshi (self-hosted in `public/fonts`, free licence included). Headings use Grifter in the design (paid): add `public/fonts/grifter-bold.woff2` if licensed, otherwise Clash Display loads from Fontshare.
- Confirm `payblocx.com/terms` and `/privacy` exist.

## Structure

- `index.html`: all sections (nav, hero with phone waitlist form, currency roll, 3 feature blocks, CTA band, security carousel, FAQ, email waitlist CTA, footer)
- `src/styles.css`: design tokens at the top (`--navy`, `--sky`, `--blue`), desktop 1440 and mobile 390 layouts
- `src/main.js`: mobile menu, waitlist forms (NG/GH phone validation), marquee, carousel, FAQ, newsletter, scroll reveal
# payblocx-landing
