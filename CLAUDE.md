# Realtime Todo / Grocery List

## Stack
Next.js 15, TypeScript, shadcn/ui, Tailwind CSS, WebSocket (ws), custom server (`server.js`)

## Commands
- `pnpm dev` — start dev server (runs server.js with WS on port 3000)
- `pnpm build` — production build
- `pnpm start` — production server

## Architecture
- Custom Node server (`server.js`) handles both Next.js and WebSocket
- WebSocket uses room-based broadcasting per list ID
- `useWebSocket` hook does optimistic UI updates + offline queue
- Data persisted to `data/{listId}.json` on disk

## Key patterns
- `groceryData.ts` has 800+ items with categories — CATEGORY_ORDER in TodoApp.tsx must match these exactly
- GroceryAutocomplete returns `(text, category)` — category flows through to Todo
- Items grouped by `todo.category` via useMemo; unknown categories fall back to "Övrigt"
- Ghost text overlay requires `!bg-transparent` on Input (shadcn's bg-background overrides inline styles)
- Dropdown uses `onMouseDown={e => e.preventDefault()}` to prevent focus steal

## Swedish UI
All user-facing text is in Swedish. Variable names and comments in English.
