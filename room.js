var TOOL = require("./public/js/server/sha1");
var roomDatas = [];
const MAX_ROOM = 1000;

var Room = function (name, user) {
    this.id = "";
    this.name = name;
    this.members = [];
    console.log(user);
    if (typeof user !== "undefined" && user !== null) {
        let member = {
            id: user.id,
            type: "host"
        }
        this.members.push(member);
    }
    this.join = function (user) {
        let index = this.members.findIndex(x => x.id === user.id);
        if (index === -1) {
            let member = {
                id: user.id,
                type: "member"
            }
            this.members.push(member);
        }
    }
    this.out = function (user) {
        let index = this.members.findIndex(x => x.id === user.id);
        if (index >= 0) {
            this.members.splice(index, 1);
        }
        return this.members.length;
    }
    this.getMemberList = function () {
        return this.members;
    }
}

exports.creatRoom = function (name, user) {
    try {
        let roomId = -1;
        for (let i = 0; i < MAX_ROOM.length; i++) {
            let index = roomDatas.findIndex(x => Number(x.id) === i);
            if (index === -1) {
                roomId = i;
                break;
            }
        }
        if (roomId === -1) {
            return false;
        }
        let room = new Room(name, user);
        roomDatas.push(room);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.getRoomList = function () {
    return roomDatas;
}

exports.memberOut = function (user) {
    for (let i = 0; i < roomDatas.length; i++) {
        let memberNum = roomDatas[i].out(user);
        if (memberNum <= 0) {
            roomDatas.splice(i, 1);
            i--;
        }
    }
}
