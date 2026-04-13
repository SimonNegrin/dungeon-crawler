<script lang="ts">
  import { onMount } from "svelte"
  import { projectilesMap } from "./helpers/combat"
  import type { IProjectileConfig } from "./types"
  import { events } from "./helpers/common"

  let projectiles: IProjectileConfig[] = $state([])

  onMount(() => {
    const unsubShoot = events.shoot.subscribe((config) => {
      projectiles.push(config)
    })
    const unsubShootCompleted = events.shootCompleted.subscribe((config) => {
      projectiles = projectiles.filter((c) => {
        return c.id !== config.id
      })
    })
    return () => {
      unsubShoot()
      unsubShootCompleted()
    }
  })
</script>

{#each projectiles as config (config.id)}
  {@const Component = projectilesMap[config.type]}
  <Component {config} />
{/each}
