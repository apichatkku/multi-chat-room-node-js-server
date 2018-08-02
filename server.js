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
            announceUserList(io);
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
            } else {
                socket.emit('token', { status: "fail" });
            }
            announceUserList(io);
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
    socket.on('user-lsit', (data) => {
        try {

        } catch (error) {
            console.log(error);
        }
    });
    socket.on('disconnect', (data) => {
        try {
            USER.disSocket(socket.id);
            announceUserList(io);
        } catch (error) {
            console.log(error);
        }
    });

});

function announceUserList(io) {
    io.emit("user list", { users: USER.getUserIdList() });
}


/*-------------------------------------------------------------- */
var intervalUser = setInterval(function () {
    console.log("timer check timeout.");
    USER.checkTimeout();
}, 10000);