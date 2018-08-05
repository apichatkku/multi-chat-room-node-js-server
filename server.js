var express = require('express');
var app = express();
var path = require('path');
var PORT = process.env.PORT || 7777;
app.use(express.static('public'));

var server = app.listen(PORT, function () {
    console.log('Starting node.js on port ' + PORT);
});
//socket
var io = require('socket.io').listen(server);

//import
var TOOL = require("./public/js/server/sha1");
var USER = require('./user');
var ROOM = require('./room');
var bodyParser = require('body-parser');

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//-------------------------------------  View   -------------------------------------------------------------------------
app.use(express.static('public'));
app.set('view options', { locals: { scripts: ['jquery.js'] } });

function getIndexPage(req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
}

function getMainPage(req, res) {
    res.sendFile(path.join(__dirname + '/views/main.html'));
}

function getChatPage(req, res) {
    res.sendFile(path.join(__dirname + '/views/chatroom.html'));
}

function getSendPage(req, res) {
    res.sendFile(path.join(__dirname + '/views/send.html'));
}

function getTogglePage(req, res) {
    res.sendFile(path.join(__dirname + '/views/toggle.html'));
}

app.get('/', getIndexPage);
app.get('/send', getSendPage);
app.get('/main', getMainPage);
app.get('/chatroom', getChatPage);
app.get('/toggle', getTogglePage);

//------------------------------------------------------------------------------------------------------------------
//Variable

io.on('connection', function (socket) {
    console.log(socket.id + " is connected.");
    socket.on('login', (data) => {
        try {
            var id = data.id;
            if (typeof id === "undefined" || id === null || id === "") {
                socket.emit("login", { status: false });
                return;
            }
            let user = USER.newUser(id, socket.id);
            console.log(user.id + "is logged in.");
            socket.emit("login", { id: user.id, token: user.token, status: true });
            announceUserList();
        } catch (error) {
            console.log(error);
            socket.emit("login", { status: false });
        }
    });
    socket.on('token', (data) => {
        try {
            let token = data.token;
            if (typeof token === "undefined" || token === null) {
                socket.emit('token', { status: "fail" });
                return;
            }
            let user = USER.checkToken(token, socket.id);
            if (user !== null) {
                socket.emit('token', { status: "success", id: user.id });
                socket.emit('room list', { rooms: ROOM.getRoomList() });
            } else {
                socket.emit('token', { status: "fail" });
            }
            announceUserList();
        } catch (error) {
            socket.emit('token', { status: "error" });
            console.log(error);
        }
    });
    socket.on('send', (data) => {
        try {
            var token = data.token;
            var msg = data.msg;
            if (typeof msg === "undefined" || msg === null || msg === "") {
                return;
            }
            var user = USER.checkToken(token, socket.id);
            if (user === null) {
                return;
            }
            console.log(user.id + ' send');
            io.emit('send-res', { id: user.id, msg: msg });
        } catch (error) {
            console.log(error);
        }
    });
    socket.on('user list', (data) => {
        try {
            io.emit("user list", { users: USER.getUserIdList() });
        } catch (error) {
            console.log(error);
        }
    });
    socket.on('create room', (data) => {
        try {
            let roomName = data.roomName;
            console.log(roomName);
            if (roomName === "" || typeof roomName != "string") {
                return;
            }
            let password = data.password;
            console.log(password);
            let token = data.token;
            let user = USER.checkToken(token, socket.id);
            console.log(user);
            if (user === null) {
                return;
            }
            let roomId = ROOM.createRoom(roomName, user.id, password);
            console.log(roomId);
            announceRoomList();
            socket.emit("create room", { roomId: roomId });
        } catch (error) {
            console.log(error);
            socket.emit("create room", { roomId: -1 });
        }
    });
    socket.on('join room', (data) => {
        try {
            let token = data.token;
            let user = USER.checkToken(token, socket.id);
            let roomId = Number(data.roomId);
            let password = (typeof data.password !== "string") ? "" : data.password;
            console.log("-------------------------------\n" + (typeof roomId), (typeof password));
            let newRoomId = ROOM.memberJoin(roomId, user.id, password);
            socket.emit('join room', { roomId: newRoomId });
        } catch (error) {
            console.log(error);
            socket.emit('join room', { roomId: -1 });
        } finally {
            announceRoomList();
        }
    });

    socket.on('logout', (data) => {
        try {
            if (typeof data.token === "undefined") {
                return;
            }
            USER.removeToken(data.token);
            announceRoomList();
            announceUserList();
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('disconnect', (data) => {
        try {
            USER.disSocket(socket.id);
            announceUserList();
            announceRoomList();
        } catch (error) {
            console.log(error);
        }
    });

});

function announceRoomList() {
    io.emit("room list", { rooms: ROOM.getRoomList() });
}

function announceUserList() {
    io.emit("user list", { users: USER.getUserIdList() });
}


/*-------------------------------------------------------------- */
var intervalUser = setInterval(function () {
    console.log("timer check timeout.");
    USER.checkTimeout();
    announceRoomList();
}, 5000);