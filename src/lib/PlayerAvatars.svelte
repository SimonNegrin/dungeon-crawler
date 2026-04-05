<script lang="ts">
  import Avatar from "./Avatar.svelte"
  import { gameState } from "./state.svelte"
</script>

{#each gameState.players as player}
  <Avatar actor={player} highlight={gameState.currentPlayer === player} />
{/each}
