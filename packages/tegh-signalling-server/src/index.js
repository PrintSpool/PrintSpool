var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

io.on('connection', function(socket){
  const { fingerprint } = socket.handshake.query
  console.log('NEW: ', fingerprint)
  socket.join([fingerprint])
  // console.log('a user connected', socket.handshake.query)
  socket.on('announcement', function(msg){
    // console.log('message: ', msg)
    console.log('TO:  ', msg.to)

    io.to(msg.to).emit('announcement', msg)
  })
})

http.listen(3000, function(){
  console.log('listening on *:3000')
})
