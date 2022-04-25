const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use('/', express.static(__dirname + '/public'));

var users = {
    test: 'test123'
}

var socketMap = [];

io.on('connection', (socket) => {
    console.log("connect with socket id : ", socket.id);
    
    socket.on('logging_in', (data) => {

        if(users[data.username]){
            if(users[data.username] == data.password){
                socket.join(data.username);
                socket.emit('logged_in', data);
                console.log("logged in ", data.username);
                socketMap[socket.id] = data.username;
                console.log(socketMap);
            }
            else{
                socket.emit('logged_fail', data);
            }
        }
        else{
            users[data.username] = data.password;   
            socket.join(data.username);
            socket.emit('logged_in', data);
            console.log("logged in ", data.username);
            socketMap[socket.id] = data.username;
            console.log(socketMap);
        }
        console.log(users);
    });

    socket.on('msg_send', (data) => {
        data.from = socketMap[socket.id];
        if(data.to){
            io.to(data.to).emit('msg_rcv', data);
        }
        else{
            socket.broadcast.emit('msg_rcv', data);
        }
    });

});

server.listen(3344, () => {
    console.log("started on http://localhost:3344");
})