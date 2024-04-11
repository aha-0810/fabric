const WebSocket = require('ws');
const wss = new WebSocket.Server({ host: '0.0.0.0', port: 7890 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
        
        // 연결된 모든 클라이언트에게 메시지 전송
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

console.log('WebSocket server started on ws://localhost:7890');
