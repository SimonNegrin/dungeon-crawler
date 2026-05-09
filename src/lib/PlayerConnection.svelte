<script lang="ts">
  import PlayerBinding from "./PlayerBinding.svelte"
  import { setupPlayerConnection } from "./helpers/connections"
  import { createPlayerActor } from "./helpers/players"
  import { gameState } from "./state.svelte"
  import type { WebRtcHandle, IPlayerConnection } from "./types"

  let {
    playerId,
    onconnection,
  }: {
    playerId: string
    onconnection: (player: IPlayerConnection) => void
  } = $props()

  // Create a partial player as state to ensure reactive updates
  const partialPlayer: Partial<IPlayerConnection> = $state({})

  function handleConnection(webRtc: WebRtcHandle) {
    // Remove any previous connection with the same playerId
    gameState.players = gameState.players.filter((p) => p.playerId !== playerId)

    partialPlayer.playerId = playerId
    partialPlayer.webRtc = webRtc
    partialPlayer.isWaiting = false
    partialPlayer.isReady = false
    partialPlayer.isConnected = true
    partialPlayer.actor = createPlayerActor(playerId, "dwarf", "male")

    const player = partialPlayer as IPlayerConnection

    setupPlayerConnection(player)
    gameState.players.push(player)
    onconnection(player)
  }
</script>

<PlayerBinding {playerId} onconnection={handleConnection} />
