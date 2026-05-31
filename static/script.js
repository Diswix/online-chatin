let currentNickname = "";
while (!currentNickname || currentNickname.trim() === "") {
    currentNickname = prompt("Please enter your nickname for the chat:");
}

const socket = io({
    auth: {
        nickname: currentNickname
    }
});

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

socket.on('all_messages', function(msgArray){
    messages.innerHTML = '';
    if (msgArray) {
        msgArray.forEach(message => {
            let item = document.createElement('li');
            let author = message.login || 'someone';
            item.textContent = author + ': ' + message.content;
            messages.appendChild(item);
        });
    }
    window.scrollTo(0, document.body.scrollHeight);
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('new_message', {
            content: input.value
        });
        input.value = '';
    }
});

socket.on('message', function(message){
    let item = document.createElement('li');
    item.textContent = message;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});