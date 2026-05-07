<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import Qr from "./Qr.svelte"
  import SignalingConnection from "./helpers/SignalingConnection"
  import { createStateMachine, ICE_SERVERS } from "./helpers/common"
  import type { IPlayerConnection } from "./types"
  import { createPlayerActor } from "./helpers/players"
  import { setupPlayerConnection } from "./helpers/connections"
  import { debug, gameState } from "./state.svelte"

  let {
    playerId,
    onconnection,
  }: {
    playerId: string
    onconnection: (player: IPlayerConnection) => void
  } = $props()

  const componentState = createStateMachine("CREATING_ROOM", {
    CREATING_ROOM: ["WAITING_PLAYER"],
    WAITING_PLAYER: ["SIGNALING"],
    SIGNALING: ["CONNECTED"],
    CONNECTED: ["CREATING_ROOM"],
  })

  let peerConnection: RTCPeerConnection
  let dataChannel: RTCDataChannel
  let signalingConnection: SignalingConnection
  let gamepadUrl = $state("")
  let connection: Partial<IPlayerConnection> = $state({})

  onMount(joinRoom)
  onDestroy(() => signalingConnection?.disconnect())

  async function joinRoom(): Promise<void> {
    const roomId = crypto.randomUUID()
    signalingConnection = new SignalingConnection(
      import.meta.env.VITE_SIGNALING_SERVER,
    )
    await signalingConnection.connect()
    await signalingConnection.createRoom(roomId)

    signalingConnection.on("peerjoin", onPeerjoin)
    signalingConnection.on("answer", onAnswer)
    signalingConnection.on("candidate", onCandidate)
    signalingConnection.on("disconnect", onDisconnect)

    const url = new URL(import.meta.env.VITE_GAMEPAD_URL)
    url.searchParams.set("r", roomId)

    gamepadUrl = url.toString()
    console.log(gamepadUrl)
    componentState.set("WAITING_PLAYER")
  }

  function onPeerjoin(): void {
    initSignaling()
  }

  function log(...msg: string[]): void {
    if (debug.bindingGamepad) {
      console.log(...msg)
    }
  }

  async function onAnswer(data: any): Promise<void> {
    log("answer", data)
    await peerConnection?.setRemoteDescription(data)
  }

  async function onCandidate(data: any): Promise<void> {
    log("candidate", data)
    await peerConnection?.addIceCandidate(data)
  }

  function onDisconnect(): void {
    log("disconnect signaling")
  }

  async function initSignaling(): Promise<void> {
    log("initSignaling")
    $componentState = "SIGNALING"

    peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    })

    peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate !== null) {
        signalingConnection.sendCandidate(event.candidate)
      }
    })

    dataChannel = peerConnection.createDataChannel("controlDatachannel")
    dataChannel.addEventListener("open", onOpen, { once: true })

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    signalingConnection.sendOffer(offer)
  }

  function onOpen(): void {
    log("dataChannel open")

    // Populate connection object
    connection.playerId = playerId
    connection.isReady = false
    connection.actor = createPlayerActor(playerId, "dwarf", "male")
    connection.peer = peerConnection
    connection.channel = dataChannel

    const conn = connection as IPlayerConnection

    setupPlayerConnection(conn)
    gameState.players.push(conn)
    $componentState = "CONNECTED"
    onconnection(conn)
  }
</script>

<div class="player-binding">
  {#if $componentState === "CREATING_ROOM"}
    <div>Creando sala...</div>
  {:else if $componentState === "WAITING_PLAYER"}
    <div class="qr-wrapper">
      <Qr content={gamepadUrl} size={100} />
    </div>
  {:else if $componentState === "SIGNALING"}
    <div>Conectando...</div>
  {:else if $componentState === "CONNECTED"}
    <div>Conectado</div>
  {/if}
</div>

<style>
  .player-binding {
    --size: 120px;
    width: var(--size);
    height: var(--size);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-text-primary);
  }
  .qr-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: var(--color-extra-dark-blue);
    border: 2px outset var(--color-dark-gray);
  }
</style>
