<script lang="ts">
  import Player from "./Player.svelte"
  import { gameState } from "./state.svelte"
</script>

{#each gameState.players as player}
  <Player {player} />
{/each}
