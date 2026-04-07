<script lang="ts">
  import type { Character } from "./types"

  let {
    character,
  }: {
    character: Character
  } = $props()

  let health = $derived(
    calcHealth(character.stats.health, character.stats.totalHealth),
  )

  function calcHealth(health: number, totalHealth: number): number {
    return 100 * (health / totalHealth)
  }
</script>

<div class="health-bar">
  <div class="health" style:width="{health}%"></div>
</div>

<style>
  .health-bar {
    height: 12px;
    padding: 2px;
    border: 2px solid #5e3b10;
    border-radius: 9999px;
  }
  .health {
    background-color: red;
    height: 4px;
    border-radius: 9999px;
    transition-duration: 200ms;
  }
</style>
