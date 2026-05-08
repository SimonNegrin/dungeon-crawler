import SignalingConnection from "./SignalingConnection"
import { ICE_SERVERS } from "./common"
import { PKT_PLAYER_STATE_SYNC } from "./connections"
import type { IPlayerConnection } from "../types"

export interface WebRtcCallbacks {
  onPeerjoin: () => void
  onOpen: (
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel,
  ) => void
  onDisconnected: () => void
  onGamepadUrl: (url: string) => void
}

export interface WebRtcHandle {
  signalingConnection: SignalingConnection
  peerConnection: RTCPeerConnection
  dataChannel: RTCDataChannel
  disconnect: () => void
}

export async function setupWebRtcConnection(
  playerId: string,
  callbacks: WebRtcCallbacks,
): Promise<WebRtcHandle> {
  const signalingConnection = new SignalingConnection(
    import.meta.env.VITE_SIGNALING_SERVER,
  )
  await signalingConnection.connect()
  await signalingConnection.createRoom(playerId)

  const url = new URL(import.meta.env.VITE_GAMEPAD_URL)
  url.searchParams.set("r", playerId)
  callbacks.onGamepadUrl(url.toString())

  let peerConnection: RTCPeerConnection
  let dataChannel: RTCDataChannel
  let disconnected = false

  function handleDisconnected(): void {
    if (disconnected) return
    disconnected = true
    callbacks.onDisconnected()
  }

  signalingConnection.on("peerjoin", () => {
    callbacks.onPeerjoin()
    initSignaling()
  })

  signalingConnection.on("answer", async (data: any) => {
    await peerConnection?.setRemoteDescription(data)
  })

  signalingConnection.on("candidate", async (data: any) => {
    await peerConnection?.addIceCandidate(data)
  })

  signalingConnection.on("disconnect", () => {
    console.log("disconnect signaling")
  })

  // Is not necessary to handle signaling disconnect
  // because we need to keep the connection open
  // to allow the player reconnect

  function initSignaling(): void {
    peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    })

    peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate !== null) {
        signalingConnection.sendCandidate(event.candidate)
      }
    })

    peerConnection.addEventListener("iceconnectionstatechange", () => {
      const state = peerConnection.iceConnectionState
      if (state === "disconnected" || state === "failed") {
        handleDisconnected()
      }
    })

    dataChannel = peerConnection.createDataChannel("controlDatachannel")
    dataChannel.addEventListener(
      "open",
      () => callbacks.onOpen(peerConnection, dataChannel),
      { once: true },
    )

    dataChannel.addEventListener("close", () => {
      handleDisconnected()
    })

    peerConnection.createOffer().then((offer) => {
      peerConnection.setLocalDescription(offer)
      signalingConnection.sendOffer(offer)
    })
  }

  return {
    get signalingConnection() {
      return signalingConnection
    },
    get peerConnection() {
      return peerConnection
    },
    get dataChannel() {
      return dataChannel
    },
    disconnect: () => signalingConnection.disconnect(),
  }
}

export function sendPlayerStateSync(conn: IPlayerConnection): void {
  const state = {
    sprite: conn.actor.sprite,
    name: conn.actor.name,
    genre: "male" as const,
    health: conn.actor.currentStats.health,
    maxHealth: conn.actor.totalStats.health,
    movement: conn.actor.totalStats.movement,
    actions: conn.actor.totalStats.actions,
    attack: conn.actor.totalStats.attack,
    defence: conn.actor.totalStats.defence,
    aim: conn.actor.totalStats.aim,
    magic: conn.actor.totalStats.magic,
  }
  const encoder = new TextEncoder()
  const payload = encoder.encode(JSON.stringify(state))
  const pkt = new Uint8Array([PKT_PLAYER_STATE_SYNC, ...payload])
  conn.channel.send(pkt)
}
