<script lang="ts">
  import { onMount } from "svelte"
  import Qr from "./Qr.svelte"
  import { createStateMachine } from "./helpers/common"
  import { setupWebRtcConnection } from "./helpers/webrtc"
  import type { WebRtcHandle } from "./types"

  let {
    playerId,
    onconnection,
  }: {
    playerId: string
    onconnection: (handle: WebRtcHandle) => void
  } = $props()

  const componentState = createStateMachine("CREATING_ROOM", {
    CREATING_ROOM: ["WAITING_PLAYER"],
    WAITING_PLAYER: ["SIGNALING", "CONNECTED"],
    SIGNALING: ["CONNECTED"],
    CONNECTED: ["WAITING_PLAYER"],
  })

  let gamepadUrl = $state("")

  onMount(async () => {
    componentState.set("WAITING_PLAYER")

    await setupWebRtcConnection(playerId, {
      onGamepadUrl(url) {
        gamepadUrl = url
        // Keep log to be able to join the room without read the QR code
        console.log(gamepadUrl)
      },
      onPeerjoin() {
        componentState.set("SIGNALING")
      },
      onOpen(handle) {
        componentState.set("CONNECTED")
        onconnection(handle)
      },
      onDisconnected() {
        componentState.set("WAITING_PLAYER")
      },
    })
  })
</script>

<div class="player-binding">
  {#if $componentState === "CREATING_ROOM"}
    <div>Creando sala...</div>
  {:else if $componentState === "WAITING_PLAYER"}
    <div class="qr-wrapper">
      {#if gamepadUrl}
        <Qr content={gamepadUrl} size={100} />
      {/if}
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
