import SignalingConnection from "./SignalingConnection"
import { canCastMagic, ICE_SERVERS } from "./common"
import { PKT_PLAYER_STATE_SYNC } from "./connections"
import type { IPlayerConnection, WebRtcHandle } from "../types"
import { gameState } from "../state.svelte"

export interface WebRtcCallbacks {
  onPeerjoin: () => void
  onOpen: (handle: WebRtcHandle) => void
  onDisconnected: () => void
  onGamepadUrl: (url: string) => void
}

export async function setupWebRtcConnection(
  playerId: string,
  callbacks: WebRtcCallbacks,
): Promise<void> {
  const signalingConnection = new SignalingConnection(
    import.meta.env.VITE_SIGNALING_SERVER,
  )

  try {
    await signalingConnection.connect()
    await signalingConnection.createRoom(playerId)
  } catch (error) {
    console.error("Failed to connect to signaling server:", error)
    signalingConnection.disconnect()
    return
  }

  const url = new URL(import.meta.env.VITE_GAMEPAD_URL)
  url.searchParams.set("r", playerId)
  callbacks.onGamepadUrl(url.toString())

  let peerConnection: RTCPeerConnection
  let dataChannel: RTCDataChannel

  const handle: WebRtcHandle = {
    get peerConnection() {
      return peerConnection
    },
    get dataChannel() {
      return dataChannel
    },
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
        signalingConnection.disconnect()
        callbacks.onDisconnected()
      }
    })

    dataChannel = peerConnection.createDataChannel("controlDatachannel")
    dataChannel.binaryType = "arraybuffer"
    dataChannel.addEventListener(
      "open",
      () => {
        signalingConnection.disconnect()
        callbacks.onOpen(handle)
      },
      { once: true },
    )

    dataChannel.addEventListener("close", () => {
      signalingConnection.disconnect()
      callbacks.onDisconnected()
    })

    peerConnection.createOffer().then(async (offer) => {
      await peerConnection.setLocalDescription(offer)
      signalingConnection.sendOffer(offer)
    })
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
    canCastMagic: canCastMagic(conn.actor),
    inGame: gameState.stage !== null,
  }
  const encoder = new TextEncoder()
  const payload = encoder.encode(JSON.stringify(state))
  const pkt = new Uint8Array([PKT_PLAYER_STATE_SYNC, ...payload])
  conn.webRtc.dataChannel.send(pkt)
}
