var fs = require('fs');

var express = require('express');
var app = express();

var options = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.cert')
};

require('dotenv').config()
var port = process.env.PORT || '3000';

var server = require('https').createServer(options, app);
var io = require('socket.io')(server);

app.use(express.static('public/')); //redirect all trafic in public

server.listen(port, "0.0.0.0", () => {
  console.info('listening on %d', port);
});

var readyClients = [];

io.on('connection', function (socket) {

  // console.log(Object.keys(io.socket.socket))
  socket.on("ready", () => {

    readyClients.push(socket.id);

    console.log("Ready Clients", readyClients)

    var clients = readyClients.filter(id => id != socket.id); //remove connected client from the list

    //iterate through each client
    clients.forEach(function(id) {
      if(io.sockets.connected[id]) {
        socket2 = io.sockets.connected[id];

        console.log('Advertising peer %s to %s', socket.id, socket2.id);
        socket2.emit('peer', {
          peerId: socket.id,
          initiator: false
        });
        socket.emit('peer', {
          peerId: socket2.id,
          initiator: true
        });
      }
    });
  })

  socket.on('signal', function(data) {
    var socket2 = io.sockets.connected[data.peerId];
    if (!socket2) { return; }
    console.log('Proxying signal from peer %s to %s', socket.id, socket2.id);

    socket2.emit('signal', {
      signal: data.signal,
      peerId: socket.id
    });
  });

  socket.on('disconnect', function() {
    //remove from ready if in ready
    var i = readyClients.indexOf(socket.id);

    console.log('disconnect', i);
    if(i != -1) {
      readyClients.splice(i, 1);
      io.emit("disconnect", socket.id); //tell everyone he/she disconnected
    }
  });
});
