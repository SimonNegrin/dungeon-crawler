<script lang="ts">
  import ActorStats from "./ActorStats.svelte"
  import PlayerReconnection from "./PlayerReconnection.svelte"
  import type { IPlayerConnection } from "./types"

  let {
    player = $bindable(),
    onconnection,
  }: {
    player: IPlayerConnection
    onconnection?: (player: IPlayerConnection) => void
  } = $props()
</script>

{#if player.isConnected}
  <ActorStats actor={player.actor} />
{:else}
  <div class="disconnected">
    <PlayerReconnection {player} {onconnection} />
  </div>
{/if}

<style>
  .disconnected {
    filter: grayscale(1) brightness(0.5);
  }
</style>
