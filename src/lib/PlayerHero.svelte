<script lang="ts">
  import ActorStats from "./ActorStats.svelte"
  import PlayerBinding from "./PlayerBinding.svelte"
  import { setupPlayerConnection } from "./helpers/connections"
  import { sendPlayerStateSync } from "./helpers/webrtc"
  import { PKT_ENABLE_TURN } from "./helpers/connections"
  import { gameState } from "./state.svelte"
  import type { IPlayerConnection, WebRtcHandle } from "./types"

  let {
    player = $bindable(),
  }: {
    player: IPlayerConnection
  } = $props()

  function handleReconnection(webRtc: WebRtcHandle) {
    setConnected(player.playerId, webRtc)
    setupPlayerConnection(player)
    sendPlayerStateSync(player)

    // Si es el único jugador y es su turno, activar inmediatamente
    const connectedPlayers = gameState.players.filter((p) => p.isConnected)
    const isOnlyPlayer = connectedPlayers.length === 1
    const isThisPlayersTurn =
      gameState.currentPlayer?.playerId === player.playerId

    if (gameState.stage && isOnlyPlayer && isThisPlayersTurn) {
      const enableTurnPkt = new Uint8Array([PKT_ENABLE_TURN])
      player.webRtc.dataChannel.send(enableTurnPkt)
    }
  }

  function setConnected(playerId: string, webRtc: WebRtcHandle): void {
    const player = gameState.players.find((p) => p.playerId === playerId)
    if (player) {
      player.webRtc = webRtc
      player.isConnected = true
    }
  }
</script>

{#if player.isConnected}
  <ActorStats actor={player.actor} />
{:else}
  <div class="disconnected">
    <PlayerBinding
      playerId={player.playerId}
      onconnection={handleReconnection}
    />
  </div>
{/if}

<style>
  .disconnected {
    filter: grayscale(1) brightness(0.5);
  }
</style>
