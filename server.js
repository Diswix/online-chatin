const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./database');



const indexHtmlFile = fs.readFileSync(path.join(__dirname, 'static', 'index.html'));
const indexCssFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css')); //
const indexJsFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js')); //

const server = http.createServer((req, res) => {
    let contentType = 'text/plain';
    let content = '';

    switch (req.url) { //
        case '/':
            contentType = 'text/html';
            content = indexHtmlFile;
            break;
        case '/style.css': //
            contentType = 'text/css'; //
            content = indexCssFile; //
            break; //
        case '/script.js': //
            contentType = 'text/javascript'; //
            content = indexJsFile; //
            break; //
        default:
            res.statusCode = 404;
            return res.end('error 404');
    }

    res.writeHead(200, { 'Content-Type': contentType }); //
    res.end(content);
});

server.listen(3000);

const { Server } = require("socket.io");
const io  = new Server(server);

io.on('connection', async(socket) =>{
    const guestNickname = 'Guest ' + Math.floor(Math.random() * 1000);
    console.log(`${guestNickname} connected, id - ${socket.id}`);
} );

try{
    const messages = await db.getMessages();
    socket.emit('all_messages', messages);
} catch (e) {
    console.error('Error loading database', e);
}
socket.on('new_message', async (message) => {
    try {
       
        io.emit('message', guestNickname + ': ' + message);
    } catch (e) {
        console.error('Error saving message to db', e);
    }
});