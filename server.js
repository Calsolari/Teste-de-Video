// Servidor WebSocket básico em Node.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log("Cliente conectado");

    ws.on('message', (message) => {
        // Reenvia a mensagem para todos os clientes conectados
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log("Cliente desconectado");
    });
});