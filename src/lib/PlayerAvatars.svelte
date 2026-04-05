<script lang="ts">
  import PlayerAvatar from "./PlayerAvatar.svelte"
  import { gameState } from "./state.svelte"
</script>

{#each gameState.players as player}
  <PlayerAvatar {player} />
{/each}
