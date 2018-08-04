var TOOL = require("./public/js/server/sha1");
var roomDatas = [];
const MAX_ROOM = 1000;

var Room = function (name, id, userId, password) {
    this.id = id;
    this.name = name;
    this.members = [];
    this.password = "";
    if (typeof password === "string") {
        this.password = password;
    }
    console.log(password);
    if (typeof userId !== "undefined" && userId !== null) {
        let member = {
            id: userId,
            type: "host"
        }
        this.members.push(member);
    }
    this.join = function (userId) {
        let index = this.members.findIndex(x => x.id === userId);
        if (index === -1) {
            let member = {
                id: userId,
                type: "member"
            }
            this.members.push(member);
        }
    }
    this.out = function (userId) {
        let index = this.members.findIndex(x => x.id === userId);
        if (index >= 0) {
            let type = this.members[index].type;
            this.members.splice(index, 1);
            if (type === "host") {
                if (typeof this.members[0] != "undefined") {
                    this.members[0].type = "host";
                }
            }
        }
        return this.members.length;
    }
    this.getMemberList = function () {
        return this.members;
    }
}

exports.createRoom = function (name, userId, password) {
    try {
        memberOut(userId);
        let roomId = -1;
        for (let i = 0; i < MAX_ROOM; i++) {
            let index = roomDatas.findIndex(x => Number(x.id) === i);
            if (index === -1) {
                roomId = i;
                break;
            }
        }
        if (roomId === -1) {
            return -1;
        }
        let room = new Room(name, roomId, userId, password);
        roomDatas.push(room);
        return room.id;
    } catch (error) {
        console.log(error);
        return -1;
    }
}

exports.findById = function (id) {
    try {
        let index = roomDatas.findIndex(x => x.id === id);
        return roomDatas[index];
    } catch (error) {
        return null;
    }
}

exports.getRoomList = function () {
    let roomList = [];
    for (let i = 0; i < roomDatas.length; i++) {
        let room = {
            id: roomDatas[i].id,
            name: roomDatas[i].name,
            password: roomDatas[i].password,
            members: roomDatas[i].members
        };
        roomList.push(room);
    }
    return roomList;
}

var memberOut = function (userId) {
    console.log("888888"+userId);
    for (let i = 0; i < roomDatas.length; i++) {
        console.log("9999999"+i);
        let memberNum = roomDatas[i].out(userId);
        if (memberNum <= 0) {
            console.log("222222222."+memberNum);
            roomDatas.splice(i, 1);
            i--;
        }
    }
}
exports.memberOut = memberOut;

exports.findByMember = function (userId) {
    for (let i = 0; i < roomDatas.length; i++) {
        let index = roomDatas[i].members.findIndex(x => x.id === userId);
        if (index >= 0) {
            return roomDatas[i].id;
        }
    }
    return -1;
}
