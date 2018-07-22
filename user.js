var TOOL = require("./public/js/server/sha1");
var userDatas = [];

var User = function (id, socket) {
    this.token = id + "-" + TOOL.sha1("" + id + Math.random());
    this.id = id;
    this.sockets = [socket];
    this.time = new Date().getTime() + 30 * 60 * 1000;
    this.retime = function () {
        this.time = new Date().getTime() + 30 * 60 * 1000;
    }
}

exports.checkToken = function (token, socket) {
    try {
        let index = userDatas.findIndex(x => x.token === token);
        if (index < 0) {
            return null;
        }
        let user = userDatas[index];
        if (userDatas[index].sockets.indexOf(socket) < 0 && typeof socket !== "undefined" && socket !== null) {
            user.sockets.push(socket);
        }
        user.retime();
        return { token: user.token, id: user.id, sockets: user.sockets };
    } catch (error) {
        console.log(error);
        return null;
    }
}
exports.newUser = function (id, socket) {
    let user = new User(id, socket);
    userDatas.push(user);
    console.log(userDatas);
    return { token: user.token, id: user.id, sockets: user.sockets };
}
exports.disSocket = function (socket) {
    for (let i = 0; i < userDatas.length; i++) {
        let index = userDatas[i].sockets.indexOf(socket);
        if (index >= 0) {
            userDatas[i].sockets.splice(index, 1);
        }
    }
}

var intervalUser = setInterval(function () {
    console.log("timer check timeout.");
    checkTimeout();
}, 10000);
checkTimeout = function () {
    for (let i = 0; i < userDatas.length; i++) {
        if (userDatas[i].sockets.length <= 0) {
            if (userDatas[i].time <= new Date().getTime()) {
                userDatas.splice(i, 1);
                i--;
            }
        } else {
            userDatas[i].retime();
        }
    }
    console.log(userDatas);
}