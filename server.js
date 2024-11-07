// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });


wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Transmitir a mensagem para todos os outros clientes conectados
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

console.log('Servidor de sinalização WebSocket está rodando na porta 8080');
