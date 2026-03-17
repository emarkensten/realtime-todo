# Realtime Todo App

En todo-applikation med realtidssynkronisering byggd med Next.js och shadcn/ui. Skapa namngivna listor med unika URLs som sparas mellan sessioner. Ändringar syns omedelbart för alla användare - både när du bockar av uppgifter och när du skriver text tecken för tecken.

## Funktioner

- ✨ **Realtidssynkronisering**: Alla ändringar syns omedelbart för alla användare
- 📝 **Tecken-för-tecken uppdatering**: Text synkroniseras i realtid medan du skriver
- ✅ **Direkta checkbox-uppdateringar**: Checkboxar uppdateras omedelbart
- 🔗 **Unika URLs för varje lista**: Varje lista får en unik delbar länk
- 📛 **Namngivna listor**: Ge dina listor namn som kan redigeras
- 💾 **Persistent lagring**: Alla listor sparas automatiskt på disk mellan sessioner
- 🎨 **Modern UI**: Byggd med shadcn/ui och Tailwind CSS
- 🔌 **WebSocket-baserad**: Snabb och effektiv kommunikation
- 🔄 **Automatisk återanslutning**: Ansluter automatiskt om anslutningen bryts
- 🛒 **Smart autocomplete**: Typehead med 800+ matvaror, ghost text, och tangentbordsnavigering
- 📂 **Kategorigruppering**: Varor grupperas automatiskt (Mejeri, Frukt, Kött, etc.)
- ♿ **Tillgänglighet**: WAI-ARIA combobox, aria-live, tangentbordsnavigering

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

1. Skapa en ny lista på startsidan
2. Klicka på "Dela lista"-knappen för att kopiera länken
3. Öppna länken i flera webbläsarflikar eller olika webbläsare
4. Lägg till en uppgift i en flik - se hur den dyker upp omedelbart i alla andra flikar
5. Börja skriva i textfältet - se hur texten uppdateras tecken för tecken i alla flikar
6. Bocka av en uppgift - se hur checkboxen uppdateras överallt
7. Klicka på listnamnet för att redigera det - uppdateringen syns för alla

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

- Håller ett in-memory state för alla listor och todos
- Använder room-based broadcasting (varje lista har sitt eget rum)
- Sparar ändringar till disk automatiskt
- Laddar befintliga listor vid uppstart
- Tar emot uppdateringar från klienter
- Broadcastar ändringar endast till klienter i samma lista

### Klient-sidan

React-hooken `useWebSocket` hanterar:

- WebSocket-anslutning och återanslutning
- Mottagning och bearbetning av meddelanden
- Skicka uppdateringar till servern
- Optimistisk UI-uppdatering

### Meddelandetyper

- `init` - Skickar initial listdata till nya klienter
- `update-name` - Uppdaterar listnamnet
- `add` - Lägger till en ny todo
- `update` - Uppdaterar en hel todo (t.ex. completed-status)
- `text-update` - Uppdaterar endast texten (för realtids-textredigering)
- `delete` - Tar bort en todo

## Arkitektur

```
/app                 - Next.js app-router filer
  /layout.tsx        - Root layout
  /page.tsx          - Startsida (skapa/gå med i lista)
  /list/[id]/
    /page.tsx        - Dynamisk list-sida
  /globals.css       - Global styling
/components          - React-komponenter
  /ui/               - shadcn UI-komponenter
  /TodoApp.tsx       - Huvudkomponent med kategorigruppering
  /GroceryAutocomplete.tsx - Autocomplete med ghost text och tangentbordsnav
/hooks               - Custom React hooks
  /useWebSocket.ts   - WebSocket-hantering med room-support
/types               - TypeScript-typer
  /todo.ts           - Todo och TodoList-typer (inkl. category)
/lib                 - Utilities
  /utils.ts          - Hjälpfunktioner
  /groceryData.ts    - 800+ matvaror med kategorier
  /shoppingParser.ts - Parser för mängd/enhet/vara
/data                - Persistent lagring (genereras automatiskt)
  /{listId}.json     - JSON-filer för varje lista
server.js            - Custom server med WebSocket och fillagring
```

## Licens

MIT
