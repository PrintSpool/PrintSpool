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

// Per https://stackoverflow.com/a/56330726
export const MAX_MESSAGE_SIZE = 256 * 1024
export const BUFFER_HIGH = MAX_MESSAGE_SIZE * 10

// Theoretically 1GB messages may be possible in Firefox but I have not had luck with them yet:
// https://blog.mozilla.org/webrtc/large-data-channel-messages/
// const MAX_MESSAGE_SIZE = 1024 * 1024 * 1024 - 1

/*
 * 1 byte for S|H|C, 16 bytes for the message's ID, 1 byte for ':'
 * Note: the message ID is repeated in each chunk for that message
 */
const MODE_BITMASK = 6
const bitfield = {
  MULTIPART_FILE: 8,
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
  mode,
  fileStart,
}) => {
  // console.log({
  //   id,
  //   serial,
  //   payload,
  //   endOfMessage,
  //   mode,
  //   fileStart,
  // })
  let bf = bitfield[mode]

  if (endOfMessage) {
    // eslint-disable-next-line no-bitwise
    bf |= bitfield.END_OF_MESSAGE
  }

  if (fileStart != null) {
    bf |= bitfield.MULTIPART_FILE
  }

  // File chunks headers need an extra 32bits for the file start
  let headerSize = headerBytes[mode] + (fileStart == null ? 0 : 4)

  const buf = Buffer.alloc(payload.length + headerSize)

  // write the header to the start of the buffer
  buf.writeUInt8(bf, 0)
  // console.log(bf)
  if (mode === 'UNORDERED_UNRELIABLE') {
    buf.writeUInt32BE(id, 1)
    buf.writeUInt32BE(serial, 5)
  }

  if (fileStart != null) {
    // File chunks headers reserve an extra 32bits for the file start
    buf.writeUInt32BE(fileStart, headerSize - 4)
  }

  // write the payload to the buffer after the header
  buf.write(payload, headerSize, 'binary')
  // console.log('WRITING BUFFER:', buf)

  return buf
}

const splitMessageIntoChunks = ({
  maxPayloadSize,
  id,
  sections,
  mode,
}) => {
  // console.log({
  //   maxPayloadSize,
  //   id,
  //   sections,
  //   mode,
  // })
  let serialOffset = 0
  return sections
    .map((section, sectionIndex) => {
      const fileStartHeaderSize = sectionIndex === 0 ? 0 : 4

      const slices = splitSlice(section, maxPayloadSize - fileStartHeaderSize)
      // let nextFileStart = msgChunks.length
      // const fileChunks = splitMessageIntoChunks({
      //   // File chunks headers need an extra 32bits for the file start
      //   maxPayloadSize: maxPayloadSize - 4,
      //   id,
      //   buf: fileReader.result,
      //   mode,
      //   fileStart: nextFileStart,
      // })

      // nextFileStart += fileChunks.length

      const sectionChunks = slices.map((chunkPayload, i) => (
        createChunk({
          id,
          fileStart: serialOffset > 0 ? serialOffset : null,
          serial: i + serialOffset,
          payload: chunkPayload,
          endOfMessage: sectionIndex === sections.length -1 && i === slices.length - 1,
          mode,
        })
      ))

      serialOffset += slices.length

      return sectionChunks
    })
    .flat(1)
}

const setImmediate = fn => setTimeout(fn, 0)

/*
 * for asynchronusly encoding messages into an array of chunks
 */
export const chunkifier = (opts, peer) => {
  const {
    mode,
    maximumMessageSize = MAX_MESSAGE_SIZE,
  } = opts

  const maxPayloadSize = maximumMessageSize - headerBytes[mode]
  // const highWaterMark = 1048576 // 1 MiB

  let nextID = 1
  let chunks = []
  // const bufferedAmountLowThreshold = channel.bufferedAmountLowThreshold || 0

  // Based on https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
  // let timeout

  const sendNextChunks = () => {
    peer._channel?.removeEventListener('bufferedamountlow', sendNextChunks)

    // timeout = null
    // let { bufferedAmount } = channel

    while (
      chunks.length > 0
      // && bufferedAmountLowThreshold >= channel.bufferedAmount
    ) {
      // if (bufferedAmount < highWaterMark) {
      const chunk = chunks.shift()
      peer.send(chunk)

      if (peer._channel != null && peer._channel.bufferedAmount > BUFFER_HIGH) {
        // console.log('Teg RTC Buffer Full')
        peer._channel.addEventListener('bufferedamountlow', sendNextChunks)
        return
      }
      // bufferedAmount += chunk.length
      // } else {
      //   timeout = setTimeout(sendNextChunks, 0)
      //   return
      // }
    }
  }

  // // eslint-disable-next-line no-param-reassign
  // channel.onbufferedamountlow = sendNextChunks

  return (message, files) => setImmediate(async () => {
    // console.log('SEND', message)
    const encodingStartedAt = Date.now()
    // const buf = msgpack.encode(message)
    // const buf = JSON.stringify(message)
    debug('Sending', { message, files })
    // console.log('Sending', { message, files })
    debug(`Message encoded in ${((Date.now() - encodingStartedAt) / 1000).toFixed(1)} seconds`)

    const previouslyEmptyChunks = chunks.length === 0

    let id = nextID
    nextID += 1
    if (nextID > MAX_ID) nextID = 1

    let startedAt
    if (files.length > 0) {
      startedAt = Date.now()
    }

    // Load the file content
    const fileContentPromises = files
      .map(async (file) => {
        /* read the file */
        // eslint-disable-next-line no-undef
        // @ts-ignore
        const fileReader = new FileReader()
        fileReader.readAsText(file)

        await new Promise((resolve) => {
          fileReader.onload = resolve
        })

        return fileReader.result
      })

    let fileContents = await Promise.all(fileContentPromises)

    let filesReadAt
    if (files.length > 0) {
      filesReadAt = Date.now()
    }

    // Chunk the message
    const msgChunks = splitMessageIntoChunks({
      maxPayloadSize,
      id,
      sections: [
        message,
        ...fileContents,
      ],
      mode,
    })

    if (files.length > 0) {
      const readSeconds = (filesReadAt - startedAt) / 1000
      const totalSeconds = (Date.now() - startedAt) / 1000
      console.log(
        'Files split into chunks for upload in '
        + `${totalSeconds.toFixed(1)}s `
        + `(read time: ${readSeconds.toFixed(2)}s)`
      )
    }

    // console.log(msgChunks)
    chunks = chunks.concat(msgChunks)

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

  // setInterval(() => {
  //   const pending = Object.entries(incommingMessages) as [[string, any]]
  //   if (pending.length > 0) {
  //     console.log(`${pending.length} Pending Messages`)
  //   }
  //   for (const [id, msg] of pending) {
  //     console.log(`${id}: ${msg.chunksReceived} / ${msg.lastSerial}`, msg)
  //   }
  // }, 1000)

  return (data) => {
    // console.log('RECEIVING BUFFER:', data)
    const bf = data.readUInt8(0)

    // eslint-disable-next-line no-bitwise
    const endOfMessage = bf & bitfield.END_OF_MESSAGE
    const modeBF = bf & MODE_BITMASK

    let id
    let payload
    let serial

    // eslint-disable-next-line no-bitwise
    if (modeBF === bitfield.RELIABLE_ORDERED) {
      id = 0 // ID is not used for RELIABLE_ORDERED messages
      payload = data.slice(headerBytes.RELIABLE_ORDERED)
    // eslint-disable-next-line no-bitwise
    } else if (modeBF === bitfield.UNORDERED_UNRELIABLE) {
      id = data.readUInt32BE(1)
      payload = data.slice(9)
      serial = data.readUInt32BE(5)
    } else {
      throw new Error(`Invalid SaltyRTC mode for bitfield ${bf}`)
    }

    if (incommingMessages[id] == null) {
      incommingMessages[id] = {
        chunks: [],
        chunksReceived: 0,
        lastSerial: null,
      }
    }

    const incommingMessage = incommingMessages[id]
    const { chunks } = incommingMessage

    let receivedAllChunks

    if (serial != null) {
      // UNORDERED_UNRELIABLE
      if (chunks[serial] == null) {
        chunks[serial] = payload
        incommingMessage.chunksReceived += 1
      }

      if (endOfMessage) {
        incommingMessage.lastSerial = serial
      }

      receivedAllChunks = (
        incommingMessage.lastSerial != null
        && incommingMessage.chunksReceived === incommingMessage.lastSerial + 1
      )
    } else {
      // RELIABLE_ORDERED
      chunks.push(payload)
      receivedAllChunks = endOfMessage
    }

    if (receivedAllChunks) {
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
