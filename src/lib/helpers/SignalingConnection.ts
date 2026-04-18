type EventHandler = (data: any) => void
type EventName =
  | "peerjoin"
  | "peerclose"
  | "candidate"
  | "answer"
  | "disconnect"

export default class SignalingConnection {
  private socket?: WebSocket
  private events = new Map<EventName, Set<EventHandler>>()
  private roomId?: string
  private pingTimeout?: number
  private pingDelay = 15_000

  constructor(private readonly serverUrl: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        return reject("Socket already created")
      }

      this.socket = new WebSocket(this.serverUrl)

      this.socket.addEventListener("open", () => {
        this.preparePing()
        resolve()
      })

      this.socket.addEventListener("close", (event) => {
        window.clearTimeout(this.pingTimeout)
        this.dispatch("disconnect", event.reason)
        reject(event.reason)
      })

      this.socket.addEventListener("message", (event) => {
        try {
          const { type, data } = JSON.parse(event.data)
          this.dispatch(type, data)
        } catch (error) {
          console.error(error)
        }
      })
    })
  }

  disconnect(): void {
    this.socket?.close()
  }

  async createRoom(roomId: string): Promise<void> {
    if (this.roomId) {
      throw new Error("Room ID already set")
    }
    this.roomId = roomId
    this.checkSocketOpen()

    const message = JSON.stringify({
      type: "createroom",
      roomId,
    })

    this.socket!.send(message)
  }

  sendOffer(offer: RTCSessionDescriptionInit): void {
    this.broadcast({ type: "offer", data: offer })
  }

  sendCandidate(candidate: RTCIceCandidate): void {
    this.broadcast({ type: "candidate", data: candidate })
  }

  on(eventName: EventName, handler: EventHandler): () => void {
    let handlers = this.events.get(eventName)
    if (!handlers) {
      handlers = new Set<EventHandler>()
      this.events.set(eventName, handlers)
    }
    handlers.add(handler)
    return () => handlers.delete(handler)
  }

  private broadcast(data: any): void {
    this.checkSocketOpen()

    const message = JSON.stringify({
      type: "broadcast",
      roomId: this.roomId,
      data,
    })

    this.socket!.send(message)
  }

  private dispatch(eventName: EventName, data: any): void {
    try {
      const handlers = this.events.get(eventName)
      handlers?.forEach((handler) => handler(data))
    } catch (error) {
      console.error(error)
    }
  }

  private checkSocketOpen(): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      throw new Error("Socket is not open")
    }
  }

  private preparePing(): void {
    this.checkSocketOpen()
    window.clearTimeout(this.pingTimeout)
    this.pingTimeout = window.setTimeout(() => {
      this.socket!.send(JSON.stringify({ type: "ping" }))
      this.preparePing()
    }, this.pingDelay)
  }
}
