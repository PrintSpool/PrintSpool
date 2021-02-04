import SimplePeer from 'simple-peer'

const EVENT_NAMES = [
  'close',
  'message',
]

export type WebRTCOptions = {
  iceServers: string[],
  connectToPeer: (any) => Promise<any>,
}

const socketFactory = (options: WebRTCOptions) => class WebRTCSocket {
  static CLOSED: string = 'CLOSED'
  static CLOSING: string = 'CLOSING'
  static CONNECTING: string = 'CONNECTING'
  static OPEN: string = 'OPEN'

  readyState: string
  private listeners: any
  private peer: any

  constructor(url: string, protocol: string) {
    this.listeners = {}
    this.innerClose = this.innerClose.bind(this)

    this.init()
      .catch(this.innerClose)
  }

  private async init() {
    const {
      iceServers,
      connectToPeer,
    } = options

    // const iceServers = [
    //   { urls: 'stun:stun.l.google.com:19302' },
    //   { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
    // ]
    console.log({ iceServers })

    this.peer = new SimplePeer({
      initiator: true,
      trickle: false,
      config: { iceServers },
    })

    this.peer.on('connect', () => {
      console.log('CONNECT')
      this.onopen()
        .catch(this.innerClose)
    })

    // Register event listeners

    this.peer.on('close', () => {
      console.log('CLOSED')
      this.innerClose({ message: 'WebRTC peer connection closed'}, 1000)
    })

    this.peer.on('data', data => {
      console.log('DATA', data)

      // messages are received both through onmessage and an event listener
      this.onmessage({ data })
      this.listeners.message.forEach(listener => listener({ data }))
    })

    this.peer.on('error', this.innerClose)

    // Connect to the Peer

    const offer = await new Promise((resolve, reject) => {
      this.peer.on('error', reject)
      this.peer.on('signal', resolve)
    })
    console.log("sending", { offer })

    const {
      answer,
      iceCandidates
    } = await connectToPeer(offer)

    console.log('received', { answer, iceCandidates })
    this.peer.signal(answer)

    iceCandidates.forEach((candidate) => {
      console.log('ADD', { candidate })
      this.peer.signal({ candidate })
    })
    console.log('END 2??')
    // this.peer.signal({ candidate: '' })
  }

  send(message: string) {
    this.peer.send(message)
  }

  private innerClose(error: any, code: number = 4000) {
    console.log("INNER CLOSE")
    if (this.readyState == WebRTCSocket.CLOSED) {
      return
    }

    this.readyState = WebRTCSocket.CLOSED
    this.peer?.destroy()

    this.onclose({
      code,
      reason: error.message,
    })
  }

  close(code: number, message: string) {
    console.log("cloess but why??")
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

  onclose(event) {}
  async onopen() {}
  onmessage(message: { data: string }) {}
}

export default socketFactory
