'use strict';
require('dotenv').config();
const PORT = process.env.PORT || 3030;
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');
const botName = 'JS02 BOT'

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder so can access html and html
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects:
io.on('connection', (socket) => {
    socket.on('joinRoom', ({
        username,
        room
    }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

        // Broadcast when a user connects 
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    console.log('New Client connected');

    // socket.emit() >>>>>>> will emit to single (specific) client
    // socket.broadcast.emit(); >>>>>>>> this will emit to all clients except connected client
    // io.emit();  >>>>>>>>> will emit to all clients in general

    // Listen for chat message 
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        // console.log(msg);
        io.to(user.room).emit('message', formatMessage(user.username, msg));

        // Runs when client disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id);
            if (user) {
                io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

                //Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });
    });

})

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})