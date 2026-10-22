# TOY APP (PRODUCER TOY ADMIN) ENGINEERING RULES

## 1. Absolute Monochrome Palette Enforcement
- Never use green, blue, yellow, orange, red, amber, or colored accents in badges, pills, buttons, borders, or text across the entire application.
- All statuses, badges, pills, and error notifications must use black, white, charcoal, and zinc:
  - Backgrounds: `#121212`, `#141414`, `#161616`, `#181818`, `#202020`, `#262626`
  - Borders: `#242424`, `#2a2a2a`, `#383838`, `rgba(255, 255, 255, 0.1)`
  - Text & Accents: `#ffffff`, `#e4e4e7`, `#a1a1aa`, `#71717a`, `#52525b`
  - Active States: Solid `#ffffff` background with `#000000` text.

## 2. Clean Borderless Mascot
- Never enclose `Manager Bear Dashboard Mascot.png` in square border boxes, background avatars, or container badges.
- Always render it naked and borderless (`object-contain filter drop-shadow-sm`).
- Keep the header uncluttered: `[Mascot] TOY APP / by ProducerToy` without squashed badges or duplicate logos.

## 3. Mandatory Numbered Pagination
- Every data table or grid managing multiple records must feature full numbered pagination:
  - `[1] [2] [3] ... [Next] [Prev]`
  - Page size selectors (e.g. 10, 15, 24, 48)
  - Current item ranges ("Showing X-Y of Z").

## 4. Resilient PostgREST Data Correlation
- Never use embedded joins like `.select('*, purchases(...)')` on tables without explicit foreign key relationships in Supabase.
- Always query base tables and correlate secondary records in memory using `.in('user_id', ids)`.
