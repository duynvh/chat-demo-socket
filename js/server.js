// SOCKET
var io = require('socket.io')();

// MYSQL
var connection = require('mysql').createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'chat'
});


connection.connect(function(err) {
	if(err) console.log(err);
});

var userList = {};

// Date Format
var format = require('date-format');

io.on('connection', function(socket){
	console.log("Client connected...");

	socket.emit('auth-visit', Object.keys(userList));

	// Login - Logout
	socket.on('auth-login', (id) => {
		connection.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
			if(err) throw err
			else {
				let user = result[0];
				socket.emit('auth-logged', user);
				socket.broadcast.emit('auth-joined', user.id);
				
				user.socketID = socket.id;
				userList[user.id] = user;
				socket.authInfo = user;
			}
		});
	});

	socket.on('auth-logout', () => {
		let authInfo = socket.authInfo;
		if(authInfo != null) {
			delete userList[authInfo.id];
			socket.emit('auth-logout');
			socket.broadcast.emit('auth-leaved', authInfo.id);
		}
	});

	// Chat Room
	socket.on('room-message-send', (msg) => {
		let authInfo = socket.authInfo;
		let data = {user_id : authInfo.id, message: msg, created: format('yyyy-MM-dd hh:mm:ss', new Date())}
		connection.query('INSERT INTO room SET ?', data, (err, result) => {
			if(err) throw err
			else {
				io.sockets.emit('room-message-new', {authInfo: authInfo, msg:data});
			}
		});
	});

	// Chat Friend
	socket.on('friend-message-send', (data) => {
		let authInfo = socket.authInfo;
		let info = {message: data.message,
					from_user_id: authInfo.id,
					to_user_id: data.id,
					created: format('yyyy-MM-dd hh:mm:ss', new Date()),
					viewed: 0};
		connection.query('INSERT INTO chat SET ?', info, (err, result) => {
			if(err) throw err
			else {
				if(data.id in userList) {
					let socketID = userList[data.id].socketID;
					var emitData = authInfo;
					emitData.messageId = result.insertId;
					emitData.message = data.message;
					io.to(socketID).emit('friend-message-new',emitData);
				}
			}
		});
	});

	socket.on('friend-typing', (id) => {
		if(id in userList) {
			let socketID = userList[id].socketID;
			let authInfo = socket.authInfo;
			io.to(socketID).emit('friend-typing', authInfo.id);
		}
	});

	socket.on('friend-typing-stop', (id) => {
		if(id in userList) {
			let socketID = userList[id].socketID;
			let authInfo = socket.authInfo;
			io.to(socketID).emit('friend-typing-stop', authInfo.id);
		}
	});

	socket.on('friend-message-viewed', (data) => {
		connection.query('UPDATE chat SET viewed = ? WHERE id = ?', [1, data.messageID], (err, result) => {
			if(err) throw err
			else {
				if(data.userId in userList) {
					let socketID = userList[data.userId].socketID;
					let authInfo = socket.authInfo;
					var emitData = {
						id: authInfo.id,
						created: format('yyyy-MM-dd hh:mm:ss', new Date())
					};
					io.to(socketID).emit('friend-message-viewed', emitData);
				}
			}
		});
	});
});

io.listen(3000);
