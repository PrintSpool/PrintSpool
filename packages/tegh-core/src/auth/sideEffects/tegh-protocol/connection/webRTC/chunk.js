const splitSlice = (str, len) => {
  const ret = []
  for (let offset = 0, strLen = str.length; offset < strLen; offset += len) {
    ret.push(str.slice(offset, len + offset))
  }
  return ret
}

const PREFIXES = {
  SMALL_UNCHUNKED_MESSAGE: 'S',
  HEADER: 'H',
  CHUNKED_MESSAGE: 'C',
}
/*
 * 1 byte for S|H|C, 16 bytes for the message's ID, 1 byte for ':'
 * Note: the message ID is repeated in each chunk for that message
 */
const ID_BYTES = 16
const HEADER_BYTES = ID_BYTES + 2
const MAX_ID = (2 ** ID_BYTES) - 1
const CHUNK_BYTES = 65536
const CHUNK_PAYLOAD_BYTES = CHUNK_BYTES - HEADER_BYTES

const splitMessageIntoChunks = ({ id, message }) => {
  if (typeof message !== 'string') {
    throw new Error('message must be a string')
  }

  const paddedId = id.toString().padStart(ID_BYTES, '0')

  if (message.length < CHUNK_PAYLOAD_BYTES) {
    // small messages are not chunked
    return [
      `${PREFIXES.SMALL_UNCHUNKED_MESSAGE}${paddedId}:${message}`,
    ]
  }

  const chunks = splitSlice(message, CHUNK_PAYLOAD_BYTES).map(chunkPayload => (
    `${PREFIXES.CHUNKED_MESSAGE}${paddedId}:${chunkPayload}`
  ))

  const header = (
    `${PREFIXES.HEADER}${paddedId}:${chunks.length}`
  )

  chunks.unshift(header)

  return chunks
}

const setImmediate = fn => setTimeout(fn, 0)

/*
 * for asynchronusly encoding messages into an array of chunks
 */
export const chunkifier = (channel, callback) => {
  let nextID = 0
  let chunks = []
  const bufferedAmountLowThreshold = channel.bufferedAmountLowThreshold || 0

  const sendNextChunks = () => {
    if (
      chunks.length > 0
      && bufferedAmountLowThreshold >= channel.bufferedAmount
    ) {
      callback(chunks.shift())
      setTimeout(sendNextChunks, 0)
    }
  }

  // eslint-disable-next-line no-param-reassign
  channel.onbufferedamountlow = sendNextChunks

  return message => setImmediate(() => {
    const previouslyEmptyChunks = chunks.length === 0
    chunks = chunks.concat(splitMessageIntoChunks({
      id: nextID,
      message,
    }))
    nextID += 1
    if (nextID > MAX_ID) nextID = 0
    if (
      previouslyEmptyChunks
      && (channel.bufferedAmount <= bufferedAmountLowThreshold)
    ) {
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
    const chunk = data.toString()
    const prefix = chunk[0]
    const id = chunk.slice(1, ID_BYTES + 1)
    const payload = chunk.slice(HEADER_BYTES)

    switch (prefix) {
      case PREFIXES.SMALL_UNCHUNKED_MESSAGE: {
        callback(payload)
        break
      }
      case PREFIXES.HEADER: {
        incommingMessages[id] = {
          expectedChunksCount: parseInt(payload, 10),
          chunks: [],
        }
        break
      }
      case PREFIXES.CHUNKED_MESSAGE: {
        const { expectedChunksCount, chunks } = incommingMessages[id]

        chunks.push(payload)

        if (chunks.length >= expectedChunksCount) {
          callback(chunks.join(''))
        }
        break
      }
      default: {
        throw new Error(`Invalid prefix: ${prefix}`)
      }
    }
  }
}
