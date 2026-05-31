const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const indexHtmlFile = fs.readFileSync(path.join(__dirname, 'static', 'index.html'));
const scriptFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'));
const styleFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'));

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/socket.io/')) {
    return;
  }

  if (req.method === 'GET') {
    switch (req.url) {
      case '/': return res.end(indexHtmlFile);
      case '/script.js': return res.end(scriptFile);
      case '/style.css': return res.end(styleFile);
      default:
        res.writeHead(404);
        return res.end('Error 404: Not Found');
    }
  }
});

const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', async (socket) => {
  const currentNickname = 'Гість_' + Math.floor(Math.random() * 1000);
  const guestPassword = 'secret_pass_' + Math.floor(Math.random() * 1000);
  
  let currentUserId = null;

  console.log(`Підключився: ${currentNickname}`);

  try {
    await db.addUser({
      login: currentNickname,
      password: guestPassword
    });
    console.log(`BD Користувача ${currentNickname} створено`);

    const token = await db.getAuthToken({ 
      login: currentNickname, 
      password: guestPassword 
    });
    
    if (token) {
      currentUserId = parseInt(token.split('.')[0]);
      console.log(`BD ID з бази: ${currentUserId}`);
    }

  } catch (e) {
    console.error(`Error BD Не вдалося створити ID:`, e);
    currentUserId = null; 
  }

  try {
    const messages = await db.getMessages();
    socket.emit('all_messages', messages);
  } catch (e) {
    console.error("Помилка завантаження повідомлень з BD:", e);
  }

  socket.on('new_message', async (message) => {
    if (!currentUserId) {
      console.error(`Error: немає зв'язку з ID користувача`);
      return;
    }

    try {
      await db.addMessage(message, currentUserId);
      console.log(`BD Збережено повідомлення ID ${currentUserId} (${currentNickname})`);
      
      io.emit('message', currentNickname + ': ' + message);
    } catch (e) {
      console.error("Помилка збереження повідомлення в BD:", e);
    }
  });
});

server.listen(3000, () => {
  console.log('http://localhost:3000');
});