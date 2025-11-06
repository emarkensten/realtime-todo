# Realtime Todo App

En todo-applikation med realtidssynkronisering byggd med Next.js och shadcn/ui. Ändringar syns omedelbart i alla anslutna webbläsare - både när du bockar av uppgifter och när du skriver text tecken för tecken.

## Funktioner

- ✨ **Realtidssynkronisering**: Alla ändringar syns omedelbart i andra webbläsare
- 📝 **Tecken-för-tecken uppdatering**: Text synkroniseras i realtid medan du skriver
- ✅ **Direkta checkbox-uppdateringar**: Checkboxar uppdateras omedelbart
- 🎨 **Modern UI**: Byggd med shadcn/ui och Tailwind CSS
- 🔌 **WebSocket-baserad**: Snabb och effektiv kommunikation
- 🔄 **Automatisk återanslutning**: Ansluter automatiskt om anslutningen bryts

## Teknisk stack

- **Next.js 15** - React-framework
- **TypeScript** - Typsäkerhet
- **shadcn/ui** - UI-komponenter
- **Tailwind CSS** - Styling
- **WebSocket (ws)** - Realtidskommunikation
- **Radix UI** - Tillgänglighetskomponenter

## Kom igång

### Installation

```bash
# Installera beroenden
npm install

# Starta utvecklingsservern
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

### Testa realtidssynkronisering

1. Öppna applikationen i flera webbläsarflikar eller olika webbläsare
2. Lägg till en uppgift i en flik
3. Se hur den dyker upp omedelbart i alla andra flikar
4. Börja skriva i textfältet - se hur texten uppdateras tecken för tecken i alla flikar
5. Bocka av en uppgift - se hur checkboxen uppdateras överallt

## Produktion

```bash
# Bygg för produktion
npm run build

# Starta produktionsserver
npm start
```

## Hur det fungerar

### WebSocket-server

Applikationen använder en custom Next.js-server (`server.js`) som kör både Next.js och en WebSocket-server. WebSocket-servern:

- Håller ett in-memory state för alla todos
- Tar emot uppdateringar från klienter
- Broadcastar ändringar till alla anslutna klienter

### Klient-sidan

React-hooken `useWebSocket` hanterar:

- WebSocket-anslutning och återanslutning
- Mottagning och bearbetning av meddelanden
- Skicka uppdateringar till servern
- Optimistisk UI-uppdatering

### Meddelandetyper

- `init` - Skickar initialt state till nya klienter
- `add` - Lägger till en ny todo
- `update` - Uppdaterar en hel todo (t.ex. completed-status)
- `text-update` - Uppdaterar endast texten (för realtids-textredigering)
- `delete` - Tar bort en todo

## Arkitektur

```
/app                 - Next.js app-router filer
  /layout.tsx        - Root layout
  /page.tsx          - Huvudsida
  /globals.css       - Global styling
/components          - React-komponenter
  /ui/               - shadcn UI-komponenter
  /TodoApp.tsx       - Huvudkomponent för todo-app
/hooks               - Custom React hooks
  /useWebSocket.ts   - WebSocket-hantering
/types               - TypeScript-typer
  /todo.ts           - Todo-typer
/lib                 - Utilities
  /utils.ts          - Hjälpfunktioner
server.js            - Custom server med WebSocket
```

## Licens

MIT
