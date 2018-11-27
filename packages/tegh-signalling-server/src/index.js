import express from 'express'
import http from 'http'
import socketIO from 'socket.io'

const app = express()
const httpServer = http.Server(app)
const io = socketIO(httpServer)

io.on('connection', (socket) =>  {
  const { fingerprint } = socket.handshake.query
  // console.log('NEW: ', fingerprint)
  socket.join([fingerprint])
  // console.log('a user connected', socket.handshake.query)
  socket.on('announcement', (msg) =>  {
    // console.log(`ANNOUNCEMENT TO ${msg.to}`)
    // console.log(`ANNOUNCEMENT TO ${msg.to}:`, msg.payload)
    io.to(msg.to).emit('announcement', msg)
  })
})

httpServer.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('listening on *:3000')
})
