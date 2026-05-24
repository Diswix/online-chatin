let userNickname = "";
while (!userNickname || userNickname.trim() === "") {
    userNickname = prompt("Please enter your nickname for the chat:");
}

alert("welcome, here your new experience comes");
const socket = io({
    auth: {
        nickname: userNickname
    }
});

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

socket.on('all_messages', function(msgArray){
    messages.innerHTML = '';
    msgArray.forEach(msg => {
        let item = document.createElement('li');
        let author = msg.login || 'someone';
        item.textContent = author + ': ' + msg.content;
        messages.appendChild(item);
    });
    window.scrollTo(0, document.body.scrollHeight);
});
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('new_message', input.value);
        input.value = '';
    }
});

socket.on('message', function(msg){
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});



 