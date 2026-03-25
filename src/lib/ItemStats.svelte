<script lang="ts">
  import type { Item, StatType } from "./types"

  let {
    item,
  }: {
    item: Item
  } = $props()

  let stats = $derived(updateStats(item))

  function updateStats(item: Item): string[] {
    const stats: string[] = []

    // Process stat modifiers
    if (item.statModifiers) {
      for (const modifier of item.statModifiers) {
        const statName = getStatName(modifier.stat)
        stats.push(`${modifierValue(modifier.value)} ${statName}`)
      }
    }

    // Process metadata
    if (item.metadata) {
      if (item.metadata.range !== undefined) {
        stats.push(`${modifierValue(item.metadata.range)} alcance`)
      }
      if (item.metadata.magic) {
        stats.push("Ataque mágico")
      }
      if (item.metadata.ethereal) {
        stats.push("Inmunidad física")
      }
      if (item.metadata.turns !== undefined) {
        stats.push(`${item.metadata.turns} turnos`)
      }
      if (item.metadata.uses !== undefined) {
        stats.push(`${item.metadata.uses} usos`)
      }
    }

    return stats
  }

  function getStatName(stat: StatType): string {
    const names: Record<StatType, string> = {
      attack: "ataque",
      defence: "defensa",
      damage: "daño",
      aim: "puntería",
      initiative: "iniciativa",
      health: "vida",
      totalHealth: "vida máxima",
    }
    return names[stat] || stat
  }

  function modifierValue(n: number): string {
    if (n > 0) {
      return `+${n}`
    }
    return String(n)
  }
</script>

<ul class="item-stats">
  {#each stats as stat}
    <li class="stat">{stat}</li>
  {/each}
</ul>

<style>
  .item-stats {
    padding-left: 10px;
    margin: 5px 0;
  }
</style>
