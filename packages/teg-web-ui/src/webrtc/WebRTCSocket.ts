import SimplePeer from 'simple-peer'

import { chunkifier, dechunkifier, RELIABLE_ORDERED } from './saltyRTCChunk'

const EVENT_NAMES = [
  'close',
  'message',
  'error',
]

export type WebRTCOptions = {
  iceServers: string[],
  connectToPeer: (any) => Promise<any>,
  onSignallingError: (any) => void,
  onSignallingSuccess: () => void,
}

const socketFactory = (options: WebRTCOptions) => class WebRTCSocket {
  static CLOSED: string = 'CLOSED'
  static CLOSING: string = 'CLOSING'
  static CONNECTING: string = 'CONNECTING'
  static OPEN: string = 'OPEN'

  readyState: string
  private listeners: any
  private peer: any
  private chunkifier: any

  constructor(url: string, protocol: string) {
    this.listeners = {}
    this.innerClose = this.innerClose.bind(this)
    this.innerHandleError = this.innerHandleError.bind(this)

    this.init()
      .catch((e) => setTimeout(() => {
        options.onSignallingError(e)
        this.innerHandleError(e)
      }, 0))
  }

  private async init() {
    const {
      iceServers,
      connectToPeer,
      onSignallingSuccess,
    } = options

    // const iceServers = [
    //   { urls: 'stun:stun.l.google.com:19302' },
    //   { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
    // ]
    // console.log({ iceServers })

    this.peer = new SimplePeer({
      initiator: true,
      trickle: false,
      config: { iceServers },
    })

    this.chunkifier = chunkifier(
      {
        mode: RELIABLE_ORDERED,
      },
      this.peer.send.bind(this.peer)
    )

    this.peer.on('connect', () => {
      // console.log('CONNECT')
      this.onopen()
        .catch(this.innerHandleError)
    })

    // Register event listeners

    this.peer.on('close', () => {
      // console.log('PEER CONNECTION CLOSED')
      this.innerClose({ message: 'WebRTC peer connection closed'}, 1000)
    })

    let firstMessage = true
    this.peer.on('data', dechunkifier(data => {
      if (firstMessage) {
        firstMessage = false
        const { type, payload } = JSON.parse(data)

        if (type === 'connection_error') {
          this.innerHandleError(payload)
          return
        }
      }

      // messages are received both through onmessage and an event listener
      try {
        this.onmessage?.({ data })
        this.listeners.message?.forEach(listener => listener({ data }))
      } catch (error) {
        console.error(`Error receiving message: ${error.message}`, { error, data })
        this.close(4000, `Error receiving message: ${error.message}: ${JSON.stringify(data)}`)
      }
    }))

    this.peer.on('error', this.innerHandleError)
    this.peer.on('iceStateChange', (state) => {
      if (state === 'disconnected') {
        console.log('iceState changed to disconnected')
        this.innerHandleError({ message: 'Connection lost' })
      }
    })

    // Connect to the Peer

    const offer = await new Promise((resolve, reject) => {
      this.peer.on('error', reject)
      this.peer.on('signal', resolve)
    })
    // console.log("sending", { offer })

    const {
      answer,
      iceCandidates
    } = await connectToPeer(offer)

    // console.log('received', { answer, iceCandidates })
    this.peer.signal(answer)

    iceCandidates.forEach((candidate) => {
      // console.log('ADD', { candidate })
      this.peer.signal({ candidate })
    })
    // console.log('END 2??')
    // this.peer.signal({ candidate: '' })
    onSignallingSuccess()
  }

  send(message: string) {
    if (localStorage.getItem('PRINT_STRINGIFY_TIMES') === '1' && message.length >= 1_000_000) {
      const json = JSON.parse(message)
      const startTime = performance.now()
      const serialized = JSON.stringify(json)
      const endTime = performance.now()
      const mb = serialized.length / 1_000_000
      const millis = endTime - startTime
      const mbPerSecond = Math.round(mb / (millis / 1000))
      console.log(`${Math.round(mb)}MB serialized in ${Math.round(millis)}ms = ${mbPerSecond} MB/s`)
    }

    // console.log(`SEND: ${message}`)
    this.chunkifier(message)
  }

  private beforeCloseOrError() {
    this.readyState = WebRTCSocket.CLOSED
    this.peer?.destroy()
  }

  private innerHandleError(error: any) {
    if (this.readyState == WebRTCSocket.CLOSED) {
      return
    }

    // console.log("WebRTCSocket Error", error)
    this.beforeCloseOrError()

    this.listeners.error?.forEach(listener => listener(error))
    this.onerror(new Error(error.message))

    this.onclose(new CloseEvent(error?.message, {
      code: 4400,
      reason: error.message,
    }))
  }

  private innerClose(error: any, code: number = 4000) {
    if (this.readyState == WebRTCSocket.CLOSED) {
      return
    }

    // console.log("WebRTCSocket Close", error)
    this.beforeCloseOrError()

    this.onclose(new CloseEvent(error?.message, {
      code,
      reason: error?.message,
    }))
  }

  close(code: number, message: string) {
    // console.log(`APOLLO HAS DECIDED TO CLOSE THE CONNECTION (code: ${code})`)
    if (code !== 1000) {
      console.warn(`WebRTCSocket closed with code: ${code}, message: ${message}`)
    }
    this.innerClose({ message }, code)
  }

  addEventListener(eventName: string, listener: any) {
    if (!EVENT_NAMES.includes(eventName)) {
      console.warn(`Listener added for un-triggered event: ${eventName}`)
    }
    this.listeners[eventName] = this.listeners[eventName] || []
    this.listeners[eventName].push(listener)
  }

  removeEventListener(eventName: string, listener: any) {
    this.listeners[eventName] = this.listeners[eventName].filter(lsnr => lsnr != listener)
  }

  onerror(err) {}
  onclose(event) {}
  async onopen() {}
  onmessage(message: { data: string }) {}
}

export default socketFactory
