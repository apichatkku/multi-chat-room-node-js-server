var express = require('express');
var app = express();
var path = require('path');
const PORT = "5555";

var toolHashs = require('./public/js/server/sha1.js');

var server = app.listen(PORT, function() {
	console.log(new Date().getTime());
	console.log('Program running on port : '+PORT);
	//get IP
	let ifaces = require('os').networkInterfaces();
	Object.keys(ifaces).forEach(function (ifname) {
		var alias = 0;

		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
			// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
			return;
			}

			if (alias >= 1) {
			// this single interface has multiple ipv4 addresses
			console.log(ifname + ':' + alias, iface.address);
			} else {
			// this interface has only one ipv4 adress
			console.log(ifname, iface.address);
			}
			++alias;
		});
	});
});

var mysql = require('mysql');
var conDB = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "project1"
});

conDB.connect(function(err) {
	if (err) throw err;
		console.log("Database Connected!");
});

var io = require('socket.io').listen(server);

app.use(express.static('public'));

function getIndexPage(req, res) {
    res.sendFile(path.join(__dirname+'/views/index.html'));
}

function getLoginPage(req, res) {
    res.sendFile(path.join(__dirname+'/views/login.html'));
}

function getJoinPage(req, res) {
    res.sendFile(path.join(__dirname+'/views/join.html'));
}

function getHomePage(req, res) {
    res.sendFile(path.join(__dirname+'/views/homepage.html'));
}

function getRoomPage(req, res) {
    res.sendFile(path.join(__dirname+'/views/room.html'));
}

function getRoomHostPage(req, res) {
    res.sendFile(path.join(__dirname+'/views/room-host.html'));
}

function getRoomTeacherPage(req, res) {
    res.sendFile(path.join(__dirname+'/views/room-teacher.html'));
}

function getRoomStudentPage(req, res) {
    res.sendFile(path.join(__dirname+'/views/room-student.html'));
}

app.get('/', getIndexPage);
app.get('/login', getLoginPage);
app.get('/join', getJoinPage);
app.get('/home', getHomePage);
app.get('/room', getRoomPage);
app.get('/room-host', getRoomHostPage);
app.get('/room-teacher', getRoomTeacherPage);
app.get('/room-student', getRoomStudentPage);


/** ------------------------------------------------------------------------------------------- */

// client manager

var USER_DATAS = [];
function UserObj(username, key){
	this.username = username;
	//generate token
	this.token = username + "-" + toolHashs.sha1(key+""+new Date().getTime());
	this.room = "";
	this.timeOut = new Date().getTime();
}

function Study(name, roomKey){
	this.name = name;
	this.token = name + "-" + toolHashs.sha1(name+roomKey+""+new Date().getTime());
	this.room = "";
	this.socket = "";
	this.score = 0;
}

var ROOM_DATAS = [];

var RoomObj = function(hostname){
	this.id = "[room]" + toolHashs.sha1( hostname+""+ new Date().getTime() );
	this.roomKey = Math.floor(Math.random() * 10000);
	this.host = hostname;
	this.socket = "";
	this.studys = [];
	this.status = "wait";
	this.join = function(name, roomKey){
		let study = {};
		if(this.roomKey == roomKey){
			if(this.studys.findIndex(x => x.name==name) == -1){
				study = new Study(name, roomKey);
				this.studys.push(study);
			}else{
				return {study:study,status:"name"};
			}
		}else{
			return {study:study,status:"roomKey"};
		}
		return {study:study,status:true};
	}
	this.kick = function(name){
		let indexStd = this.studys.findIndex(x => x.name==name);
		if(indexStd != -1){
			this.studys.splice(indexStd,1);
		}
	}
	this.getMember = function(){
		let list = [];
		for(let i in this.studys){
			list.push(this.studys[i].name);
		}
		return list;
	}
}
//socket.id ดูไอดี socket ของ client

io.sockets.on('connection', function(socket) {

	/*conDB.query("SELECT * FROM teacher",
		function (err, result, fields) {
			if (err) throw err;
			//console.log(result);
		}
	);*/

	socket.on('login', function(data) { // (username, key)
		try {
			console.log("login");
			let username = data.username;
			let key = data.key;
			if(typeof username === 'undefined' || typeof key === 'undefined'){ //check not value
				return;
			}
			if(username == "" || key == ""){ //check empty
				return;
			}
			
			dbCheckLogin(username, key, function (cb) {
				if (cb.err) {
					if(cb.msg=="password"){
						console.log(key);
						io.to(socket.id).emit("login",{status:false});
					}else{
						console.log(cb.msg);
					}
				} else {
					console.log(username+' is logon.');
					let userData = createUser(username , key);
					io.to(socket.id).emit("login",{username:username,token:userData.token,status:true});
				}
			}); 
			//check password
			/*if(ฐานช้อมูล.key != key){
				//send status login false to client
				socket.emit("login",{status:false});
				return;
			}*/
			/*let userData = createUser(username , key);
			//callback
			io.to(socket.id).emit("login",{username:username,token:userData.token,status:true});
			console.log("login >> "+userData.username , userData.token);

			console.log(USER_DATAS);*/
			
		} catch (error) {
			console.log(error);
		}
    });

	socket.on('create room', function(data) { // (token)
		try {
			let token = data.token;
			let indexUser = USER_DATAS.findIndex(x => x.token==token);
			if(indexUser==-1){
				return;
			}
			let hostname = USER_DATAS[indexUser].username;
			let room = createRoom(hostname);
			console.log(USER_DATAS);
			console.log('room created!');
			socket.emit('create room', {room:room.id,roomKey:room.roomKey});
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('join room', function(data) { // (name, roomKey)
		try {
			let name = data.name;
			let roomKey = data.roomKey;
			let indexRoom = ROOM_DATAS.findIndex(x => x.roomKey==roomKey);
			console.log(indexRoom,roomKey,'join');
			if(indexRoom==-1){
				socket.emit('join room', {status:"roomKey"});
				return;
			}
			let tmp = ROOM_DATAS[indexRoom].join(name, roomKey);
			socket.emit('join room', {study:tmp.study, room:ROOM_DATAS[indexRoom].id, status:tmp.status});
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('enter room', function(data) { // (roomId, token)
		try {
			let roomId = data.room;
			let token = data.token;
			let indexRoom = ROOM_DATAS.findIndex(x => x.id==roomId);
			console.log(indexRoom,roomId,'enter');
			if(indexRoom==-1){
				return;
			}
			let indexUser = USER_DATAS.findIndex(x => x.token==token);
			let indexStd = ROOM_DATAS[indexRoom].studys.findIndex(x => x.token==token);
			if(indexUser != -1){
				if(ROOM_DATAS[indexRoom].host == USER_DATAS[indexUser].username){
					ROOM_DATAS[indexRoom].socket = socket.id;
				}
			}else if(indexStd != -1){
				ROOM_DATAS[indexRoom].studys[indexStd].socket = socket.id;
			}else{
				return;
			}
			sendRoom(ROOM_DATAS[indexRoom].id, 'room member list', ROOM_DATAS[indexRoom].getMember());
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('room', function(data) { // (roomId, token)
		try {
			let roomId = data.room;
			let token = data.token;
			let text = data.text;
			let indexRoom = ROOM_DATAS.findIndex(x => x.id==roomId);
			console.log(indexRoom,roomId,'enter');
			if(indexRoom==-1){
				return;
			}
			let indexUser = USER_DATAS.findIndex(x => x.token==token);
			let indexStd = ROOM_DATAS[indexRoom].studys.findIndex(x => x.token==token);
			if(indexUser != -1){ //host
				if(ROOM_DATAS[indexRoom].host == USER_DATAS[indexUser].username){
					text = USER_DATAS[indexUser].username+" : "+text;
				}
			}else if(indexStd != -1){ //member
				text = ROOM_DATAS[indexRoom].studys[indexStd].name+" : "+text;
			}else{
				return;
			}
			sendRoom(ROOM_DATAS[indexRoom].id, 'room', text);
		} catch (error) {
			console.log(error);
		}
	});

	

	socket.on('quistion', function(data) { // (roomId, token)
		try {
			let roomId = data.room;
			let token = data.token;
			let indexRoom = ROOM_DATAS.findIndex(x => x.id==roomId);
			console.log(indexRoom,roomId,'enter');
			if(indexRoom==-1){
				return;
			}
			let indexUser = USER_DATAS.findIndex(x => x.token==token);
			if(indexUser != -1){ //host
				if(ROOM_DATAS[indexRoom].host == USER_DATAS[indexUser].username){
					text = USER_DATAS[indexUser].username+" : "+text;
				}
			}else{
				return;
			}

			if(ROOM_DATAS[indexedDB].status == "wait"){
				ROOM_DATAS[indexedDB].status = "run";
			}
			let quesNum = Math.floor(Math.random()*4);
			socket.emit('quistion', {quistion:theQuistions[quesNum],choices:theChoices,ans:quesNum});
		} catch (error) {
			console.log(error);
		}
	});


	/*socket.on('room member list', function(data) { // (roomId)
		try {
			console.log(ROOM_DATAS);
			let memberList = [];
			if(typeof data.room !== "undefined"){
				let indexRoom = ROOM_DATAS.findIndex(x => x.id==data.room);
				if(indexRoom == -1){
					console.log(777);
					return;
				}
				memberList = ROOM_DATAS[indexRoom].getMember();
			}
			else if(typeof data.token !== "undefined"){
				let token = data.token;
				let indexUser = USER_DATAS.findIndex(x => x.token==token);
				if(indexUser==-1){
					console.log(555);
					return;
				}
				let indexRoom = ROOM_DATAS.findIndex(x => x.id==USER_DATAS[indexUser].room);
				if(indexRoom == -1){
					return;
				}
				console.log(666);
				memberList = ROOM_DATAS[indexRoom].getMember();
			}
			console.log('what',memberList);
			socket.emit('room member list', {memberList: memberList});
		} catch (error) {
			console.log(error);
		}
	});*/

	/** when socket disconnect */
	socket.on('disconnect', function(){
		for(let i in ROOM_DATAS){
			let indexStd = ROOM_DATAS[i].studys.findIndex(x => x.socket == socket.id);
			if(indexStd != -1){
				ROOM_DATAS[i].kick(ROOM_DATAS[i].studys[indexStd].name);
				sendRoom(ROOM_DATAS[i].id, 'room member list', ROOM_DATAS[i].getMember());
				break;
			}
		}
		console.log(socket.id+" disconnect.");
	});
});

//********************************************** */

function getUserList(){
	let userList = [];
	for(var i in USER_DATAS){
		userList.push(USER_DATAS[i].username);
	}
	return userList;
}

function createUser(username, key){
	let indexUser = USER_DATAS.findIndex(x => x.username==username);
	let userData = new UserObj(username, key);
	if(indexUser == -1){
		USER_DATAS.push(userData);
	}else{
		USER_DATAS[indexUser] = userData;
	}
	return userData;
}

function createRoom(hostname){
	let room = new RoomObj(hostname);
	ROOM_DATAS.push(room);
	USER_DATAS[USER_DATAS.findIndex(x => x.username==hostname)].room = room.id;
	console.log(ROOM_DATAS);
	return room;
}

function checkToken(token){
	let indexUser = ROOM_DATAS.findIndex(x => x.id==token);
	if(indexUser<0){
		return false;
	}
	// check token timeout
	if(USER_DATAS[indexUser].timeOut < new Date().getTime()){
		return false;
	}
	//get date --> new Date(new Date().getTime()));
	// 1 sec. = 1000 , 30 min = 30*60*1000 = 1800000
	USER_DATAS[indexUser].timeOut += 1800000;
	return true;
}

function sendRoom(roomId, title, data){
	let indexRoom = ROOM_DATAS.findIndex(x => x.id==roomId);
	console.log(roomId, title, data);
	for(let i in ROOM_DATAS[indexRoom].studys){
		io.to(ROOM_DATAS[indexRoom].studys[i].socket).emit(title,data);
	}
	//data.unshift('HOST');
	io.to(ROOM_DATAS[indexRoom].socket).emit(title,data);
}

// ------------------------- DB
function dbCheckLogin(username, password, callback) {
    conDB.query("SELECT * FROM teacher WHERE username = '"+username+"' AND password = '"+password+"'"	, function (err, results, fields) {
        if (err) {
            callback({err:true,msg:err});
        }else if (results.length < 1) {
            callback({err:true,msg:"password"});
        }else if(results.length == 1){
			callback({err:false,msg:results})
		}else{
			callback({err:true,msg:"unknown"})
		}
    });
}

// --------------- test demo
theQuistions = ['int x = 5','float y = 0.5',"char c = 'a'","fprintf"];
theChoices = ['ประกาศตัวแปร int', 'ประกาศตัวแปร float', 'ประกาศตัวแปร char', 'คำสั่งแสดงค่า'];