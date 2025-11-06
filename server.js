const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory todo state
let todos = [];

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

  wss.on('connection', (ws) => {
    console.log('Client connected to /api/ws');

    // Send current state to new client
    ws.send(JSON.stringify({
      type: 'init',
      todos: todos
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle different message types
        switch (data.type) {
          case 'add':
            todos.push(data.todo);
            break;
          case 'update':
            const index = todos.findIndex(t => t.id === data.todo.id);
            if (index !== -1) {
              todos[index] = data.todo;
            }
            break;
          case 'delete':
            todos = todos.filter(t => t.id !== data.id);
            break;
          case 'text-update':
            const todoIndex = todos.findIndex(t => t.id === data.id);
            if (todoIndex !== -1) {
              todos[todoIndex].text = data.text;
            }
            break;
        }

        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready on ws://${hostname}:${port}`);
  });
});
