const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const indexHtmlFile = fs.readFileSync(path.join(__dirname, 'static', 'index.html'));
const styleFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'));
const scriptFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'));

const server = http.createServer((req, res) => {
    if (req.url === '/') res.setHeader('Content-Type', 'text/html');
    if (req.url === '/style.css') res.setHeader('Content-Type', 'text/css');
    if (req.url === '/script.js') res.setHeader('Content-Type', 'application/javascript');

    switch (req.url) {
        case '/': return res.end(indexHtmlFile);
        case '/script.js': return res.end(scriptFile);
        case '/style.css': return res.end(styleFile);
        default:
            res.writeHead(404);
            return res.end('Not found');
    }
});

const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', async (socket) => {
    const currentNickname = socket.handshake.auth.nickname || 'Guest' + Math.floor(Math.random() * 1000);
    const guestPassword = 'secret_password_123'; 
    console.log(`${currentNickname} connected`);

    let currentUserId = null;
    try {
        const exists = await db.isUserExist(currentNickname);
        if (!exists) {
            await db.addUser({ login: currentNickname, password: guestPassword });
        }

        const token = await db.getAuthToken({ login: currentNickname, password: guestPassword });
        if (token) {
            currentUserId = parseInt(token.split('.')[0]);
        } 
        
        const messages = await db.getMessages();
        socket.emit('all_messages', messages);
    } catch (e) {
        console.error('Auth error', e);
    }

    socket.on('new_message', async (messageData) => {
        if (!currentUserId) return;
        try {
            await db.addMessage(messageData.content, currentUserId);
            io.emit('message', currentNickname + ': ' + messageData.content);
        } catch (e) {
            console.error('db error', e);
        }
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});