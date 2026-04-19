<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import Qr from "./Qr.svelte"
  import SignalingConnection from "./helpers/SignalingConnection"
  import {
    createStateMachine,
    ICE_SERVERS,
    PKT_PLAYER_CONFIG,
  } from "./helpers/common"
  import type { PlayerConnection, IPlayerPreset } from "./types"
  import SpriteRogue from "./sprites/SpriteRogue.svelte"
  import PlayerPreset from "./PlayerPreset.svelte"

  let {
    playerId,
    onconnection,
    ondisconnect,
  }: {
    playerId: string
    onconnection: (connection: PlayerConnection) => void
    ondisconnect: (playerId: string) => void
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
  let preset: IPlayerPreset | undefined = $state()

  onMount(() => {
    joinRoom()
  })

  onDestroy(() => {
    dataChannel?.removeEventListener("message", onMessage)
  })

  async function joinRoom(): Promise<void> {
    // const roomId = crypto.randomUUID()
    const roomId = "04355560-13c7-4378-917d-f46e84fc876b"
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

  function clearConnection(): void {
    peerConnection?.close()
    signalingConnection?.disconnect()
    dataChannel?.close()
  }

  function onPeerjoin(data: any): void {
    initSignaling()
  }

  async function onAnswer(data: any): Promise<void> {
    console.log("answer", data)
    await peerConnection.setRemoteDescription(data)
  }

  async function onCandidate(data: any): Promise<void> {
    console.log("candidate", data)
    await peerConnection.addIceCandidate(data)
  }

  function onDisconnect(data: any): void {
    console.log("disconnect", data)
  }

  async function initSignaling(): Promise<void> {
    console.log("initSignaling")
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

    dataChannel.addEventListener("message", onMessage)

    dataChannel.addEventListener(
      "open",
      () => {
        console.log("dataChannel open")
        onconnection({
          playerId,
          connection: peerConnection,
          channel: dataChannel,
        })
        $componentState = "CONNECTED"
      },
      { once: true },
    )

    dataChannel.addEventListener(
      "close",
      () => {
        console.log("dataChannel close")
        ondisconnect(playerId)
      },
      { once: true },
    )

    // const gamepadListener = listenGamepad(dataChannel)
    // unsubscribeGamepad = gamepadListener.subscribe((gamepadStatus) => {
    //   if (gamepadStatus.start) {
    //     oncontinue()
    //   }
    // })

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    signalingConnection.sendOffer(offer)
  }

  function onMessage(event: MessageEvent): void {
    const data = new Uint8Array(event.data)

    if (data[0] !== PKT_PLAYER_CONFIG) {
      return
    }

    const decoder = new TextDecoder()
    const json = decoder.decode(data.slice(1))
    preset = JSON.parse(json)
  }
</script>

<div class="player-binding">
  {#if $componentState === "CREATING_ROOM"}
    <div>Creando sala...</div>
  {:else if $componentState === "WAITING_PLAYER"}
    <Qr content={gamepadUrl} size={100} />
  {:else if $componentState === "SIGNALING"}
    <div>Conectando...</div>
  {:else if $componentState === "CONNECTED"}
    {#if preset}
      <PlayerPreset {preset} />
    {:else}
      <div>Waiting preset...</div>
    {/if}
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
    color: #fff;
  }
</style>
