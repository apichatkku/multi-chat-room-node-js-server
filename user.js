var TOOL = require("./public/js/server/sha1");
var ROOM = require("./room");
var userDatas = [];

var User = function (id, socket) {
    this.token = id + "-" + TOOL.sha1("" + id + Math.random());
    this.id = id;
    this.sockets = [socket];
    this.time = new Date().getTime() + 30 * 60 * 1000;
    this.retime = function () {
        this.time = new Date().getTime() + 30 * 60 * 1000;
    }
    this.findSocket = function (socket) {
        return this.sockets.indexOf(socket);
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

exports.findBySocket = function (socket) {
    try {
        for (let i = 0; i < userDatas.length; i++) {
            if (userDatas[i].findSocket(socket) >= 0) {
                return { token: userDatas[i].token, id: userDatas[i].id, sockets: userDatas[i].sockets };
            }
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}

exports.newUser = function (id, socket) {
    let user = new User(id, socket);
    userDatas.push(user);
    console.log(userDatas);
    return { token: user.token, id: user.id, sockets: user.sockets };
}

exports.getUserIdList = function () {
    let userIdList = [];
    for (let i = 0; i < userDatas.length; i++) {
        if (userDatas[i].sockets.length === 0) {
            continue;
        }
        let userId = userDatas[i].id;
        //check userDatas dont have another token
        if (userIdList.indexOf(userId) === -1) {
            userIdList.push(userId);
        }
    }
    return userIdList;
}

function getSocketsById(id) {
    let sockets = [];
    for (let i = 0; i < userDatas.length; i++) {
        if (userDatas[i].id === id) {
            sockets = sockets.concat(userDatas[i].sockets);
        }
    }
    return sockets;
}
exports.getSocketsById = getSocketsById;

function clearUserActivity(id) {
    if (getSocketsById(id).length <= 0) {
        ROOM.memberOut(id);
    }
}

exports.removeToken = function (token) {
    let index = userDatas.findIndex(x => x.token === token);
    if (index >= 0) {
        let id = userDatas[index].id;
        userDatas.splice(index, 1);
        clearUserActivity(id);
    }
}

exports.disSocket = function (socket) {
    for (let i = 0; i < userDatas.length; i++) {
        //check userdatas[i] have this socket id
        let index = userDatas[i].sockets.indexOf(socket);
        if (index >= 0) {
            let id = userDatas[i].id;
            userDatas[i].sockets.splice(index, 1);
            if (userDatas[i].sockets.length <= 0 && ROOM.findByMember(id) != -1) {
                setTimeout(() => {
                    clearUserActivity(id);
                }, 2000);
            }
        }
    }
}

exports.checkTimeout = function () {
    try {
        for (let i = 0; i < userDatas.length; i++) {
            if (userDatas[i].sockets.length <= 0) {
                let id = userDatas[i].id;
                if (userDatas[i].time <= new Date().getTime()) {
                    userDatas.splice(i, 1);
                    i--;
                    clearUserActivity(id);
                }
            }
        }
        console.log(userDatas);
    } catch (error) {
        console.log(error);
    }
}