<script lang="ts">
  import { onMount } from "svelte"
  import Qr from "./Qr.svelte"
  import { createStateMachine } from "./helpers/common"
  import { setupWebRtcConnection, sendPlayerStateSync } from "./helpers/webrtc"
  import { setupPlayerConnection } from "./helpers/connections"
  import { gameState } from "./state.svelte"
  import type { IPlayerConnection } from "./types"

  let {
    player = $bindable(),
    onconnection,
  }: {
    player: IPlayerConnection
    onconnection?: (player: IPlayerConnection) => void
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

    await setupWebRtcConnection(player.playerId, {
      onGamepadUrl(url) {
        gamepadUrl = url
        console.log(gamepadUrl)
      },
      onPeerjoin() {
        componentState.set("SIGNALING")
      },
      onOpen(peerConnection, dataChannel) {
        const p = gameState.players.find((p) => p.playerId === player.playerId)
        if (p) {
          p.peer = peerConnection
          p.channel = dataChannel
          p.isConnected = true
        }

        setupPlayerConnection(player)
        componentState.set("CONNECTED")
        onconnection?.(player)

        sendPlayerStateSync(player)
      },
      onDisconnected() {
        if (gameState.stage === null) {
          gameState.players = gameState.players.filter(
            (p) => p.playerId !== player.playerId,
          )
        }
        componentState.set("WAITING_PLAYER")
      },
    })
  })
</script>

<div class="player-reconnection">
  {#if $componentState === "CREATING_ROOM"}
    <div>Reconectando...</div>
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
  .player-reconnection {
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
