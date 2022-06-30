'use strict';

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');





// Get user name and room from URL
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true // to eliminate punctuatiobs
});
// console.log(username,room);

const socket = io();

//Get room and users
socket.on('roomUsers', ({
    room,
    users
}) => {
    outputRoomName(room);
    outputUsers(users);
});

//Join Chatroom
socket.emit('joinRoom', {
    username,
    room
});
//Message from server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);

    // When get a new message Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

// Message submit 
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    //Get Message text
    const msg = event.target.elements.msg.value;
    // console.log(msg);

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    event.target.elements.msg.value = '';
    event.target.elements.msg.focus();

});


//Output Message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div); //select by class
}

//Add Room name to DOM
function outputRoomName(room) {
    roomName.innerHTML = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')} `
}