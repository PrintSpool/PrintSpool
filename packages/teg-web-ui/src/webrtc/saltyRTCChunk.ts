// import msgpack from 'msgpack-lite'
import Debug from 'debug'

const debug = Debug('teg:webrtc:SaltyRTCChunk')

// SaltyRTC Chunking Protocol
// See https://github.com/saltyrtc/saltyrtc-meta/blob/master/Chunking.md

const splitSlice = (str, len) => {
  const ret = []
  for (let offset = 0, strLen = str.length; offset < strLen; offset += len) {
    ret.push(str.slice(offset, len + offset))
  }
  return ret
}

export const RELIABLE_ORDERED = 'RELIABLE_ORDERED'
export const UNORDERED_UNRELIABLE = 'UNORDERED_UNRELIABLE'

/*
 * 1 byte for S|H|C, 16 bytes for the message's ID, 1 byte for ':'
 * Note: the message ID is repeated in each chunk for that message
 */
const bitfield = {
  RELIABLE_ORDERED: 6,
  UNORDERED_UNRELIABLE: 0,
  END_OF_MESSAGE: 1,
}

// The number of bytes in each header
const headerBytes = {
  RELIABLE_ORDERED: 1,
  UNORDERED_UNRELIABLE: 9,
}

const MAX_ID = Number.MAX_SAFE_INTEGER
const createChunk = ({
  id,
  serial,
  payload,
  endOfMessage = false,
  mode
}) => {
  let bf = bitfield[mode]

  if (endOfMessage) {
    // eslint-disable-next-line no-bitwise
    bf |= bitfield.END_OF_MESSAGE
  }

  const buf = Buffer.alloc(payload.length + headerBytes[mode])

  // write the header to the start of the buffer
  buf.writeUInt8(bf, 0)
  console.log(bf)
  if (mode === 'RELIABLE_ORDERED') {
    buf.writeUInt32LE(id, 1)
    buf.writeUInt32LE(serial, 5)
  }

  // write the payload to the buffer after the header
  buf.write(payload, headerBytes[mode])

  return buf
}

const splitMessageIntoChunks = ({
  maxPayloadSize,
  id,
  buf,
  mode,
}) => {
  const slices = splitSlice(buf, maxPayloadSize)

  return slices.map((chunkPayload, i) => (
    createChunk({
      id,
      serial: i,
      payload: chunkPayload,
      endOfMessage: i === slices.length - 1,
      mode,
    })
  ))
}

const setImmediate = fn => setTimeout(fn, 0)

/*
 * for asynchronusly encoding messages into an array of chunks
 */
export const chunkifier = (opts, callback) => {
  const {
    mode,
    maximumMessageSize = 65535,
  } = opts

  const maxPayloadSize = maximumMessageSize - headerBytes[mode]
  // const highWaterMark = 1048576 // 1 MiB

  let nextID = 1
  let chunks = []
  // const bufferedAmountLowThreshold = channel.bufferedAmountLowThreshold || 0

  // Based on https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
  // let timeout

  const sendNextChunks = () => {
    // timeout = null
    // let { bufferedAmount } = channel

    while (
      chunks.length > 0
      // && bufferedAmountLowThreshold >= channel.bufferedAmount
    ) {
      // if (bufferedAmount < highWaterMark) {
      const chunk = chunks.shift()
      callback(chunk)
      // bufferedAmount += chunk.length
      // } else {
      //   timeout = setTimeout(sendNextChunks, 0)
      //   return
      // }
    }
  }

  // // eslint-disable-next-line no-param-reassign
  // channel.onbufferedamountlow = sendNextChunks

  return message => setImmediate(() => {
    // console.log('SEND', message)
    const encodingStartedAt = Date.now()
    // const buf = msgpack.encode(message)
    // const buf = JSON.stringify(message)
    debug('Sending', message)
    debug(`Message encoded in ${((Date.now() - encodingStartedAt) / 1000).toFixed(1)} seconds`)

    const previouslyEmptyChunks = chunks.length === 0

    chunks = chunks.concat(splitMessageIntoChunks({
      maxPayloadSize,
      id: nextID,
      buf: message,
      mode,
    }))

    nextID += 1
    if (nextID > MAX_ID) nextID = 1

    if (
      previouslyEmptyChunks
      // && (channel.bufferedAmount <= bufferedAmountLowThreshold)
    ) {
      // if (timeout != null) clearTimeout(timeout)
      sendNextChunks()
    }
  })
}

/*
 * for decoding messages from a series of chunks
 */
export const dechunkifier = (callback) => {
  const incommingMessages = {}

  return (data) => {
    const bf = data.readUInt8(0)

    // eslint-disable-next-line no-bitwise
    const endOfMessage = bf & bitfield.END_OF_MESSAGE

    let id
    let payload
    // let serial

    // eslint-disable-next-line no-bitwise
    if (bf & bitfield.RELIABLE_ORDERED) {
      id = 0 // ID is not used for RELIABLE_ORDERED messages
      payload = data.slice(headerBytes.RELIABLE_ORDERED)
    // eslint-disable-next-line no-bitwise
    } else if (bf & bitfield.UNORDERED_UNRELIABLE) {
      // id = data.readUInt32(1)
      // payload = data.slice(9)
      // const serial = data.readUInt32(5)
      throw new Error('Unreliable unorder not yet implemented')
    } else {
      throw new Error(`Invalid bitfield value ${bf}`)
    }

    if (incommingMessages[id] == null) {
      incommingMessages[id] = {
        expectedChunksCount: null,
        chunks: [],
      }
    }

    const { chunks } = incommingMessages[id]

    chunks.push(payload)

    if (endOfMessage) {
      const decodingStartedAt = Date.now()
      const message = Buffer.concat(chunks).toString()
      debug("Received Buffer", message)
      // const message = msgpack.decode(buf)
      debug(`Message decoded in ${((Date.now() - decodingStartedAt) / 1000).toFixed(1)} seconds`)

      delete incommingMessages[id]

      // console.log('RECEIVE', message)
      callback(message)
    }
  }
}
