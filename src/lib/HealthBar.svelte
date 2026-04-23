<script lang="ts">
  import type { ICharacter } from "./types"

  let {
    character,
  }: {
    character: ICharacter
  } = $props()

  let health = $derived(
    calcHealth(character.currentStats.health, character.totalStats.health),
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
    height: 8px;
    background-color: var(--background-color);
    border: 2px inset var(--border-color);
  }
  .health {
    background-color: red;
    height: 4px;
    transition-duration: 200ms;
  }
</style>
