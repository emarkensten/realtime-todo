const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Data directory for persistent storage
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory storage for all lists
const lists = new Map();

// Load lists from disk
function loadLists() {
  try {
    const files = fs.readdirSync(DATA_DIR);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const listId = file.replace('.json', '');
        const filePath = path.join(DATA_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        lists.set(listId, data);
      }
    });
    console.log(`Loaded ${lists.size} lists from disk`);
  } catch (error) {
    console.error('Error loading lists:', error);
  }
}

// Save a list to disk
function saveList(listId, listData) {
  try {
    const filePath = path.join(DATA_DIR, `${listId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(listData, null, 2));
  } catch (error) {
    console.error(`Error saving list ${listId}:`, error);
  }
}

// Get or create a list
function getOrCreateList(listId) {
  if (!lists.has(listId)) {
    lists.set(listId, {
      id: listId,
      name: '',
      todos: [],
      createdAt: Date.now()
    });
  }
  return lists.get(listId);
}

// Load existing lists on startup
loadLists();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create WebSocket server with path filtering
  const wss = new WebSocketServer({
    server,
    path: '/api/ws'
  });

  wss.on('connection', (ws, req) => {
    // Extract listId from query params
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const listId = urlParams.get('listId');

    if (!listId) {
      ws.close(1008, 'Missing listId');
      return;
    }

    ws.listId = listId;
    console.log(`Client connected to list: ${listId}`);

    // Get or create the list
    const list = getOrCreateList(listId);

    // Send current state to new client
    ws.send(JSON.stringify({
      type: 'init',
      list: list
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const list = getOrCreateList(listId);

        // Handle different message types
        switch (data.type) {
          case 'update-name':
            list.name = data.name;
            saveList(listId, list);
            break;
          case 'add':
            list.todos.push(data.todo);
            saveList(listId, list);
            break;
          case 'update':
            const index = list.todos.findIndex(t => t.id === data.todo.id);
            if (index !== -1) {
              list.todos[index] = data.todo;
              saveList(listId, list);
            }
            break;
          case 'delete':
            list.todos = list.todos.filter(t => t.id !== data.id);
            saveList(listId, list);
            break;
          case 'text-update':
            const todoIndex = list.todos.findIndex(t => t.id === data.id);
            if (todoIndex !== -1) {
              list.todos[todoIndex].text = data.text;
              saveList(listId, list);
            }
            break;
        }

        // Broadcast to all clients in the same list room
        wss.clients.forEach((client) => {
          if (client.readyState === 1 && client.listId === listId) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`Client disconnected from list: ${listId}`);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready on ws://${hostname}:${port}`);
  });
});
