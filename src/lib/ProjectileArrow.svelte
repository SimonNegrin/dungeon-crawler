<script lang="ts">
  import { onMount } from "svelte"
  import { attackRoll, damage } from "./helpers/combat"
  import { events } from "./helpers/common"
  import Projectile from "./Projectile.svelte"
  import type { IProjectileConfig } from "./types"
  import { arrowShootSound } from "./helpers/audio"

  let {
    config,
  }: {
    config: IProjectileConfig
  } = $props()

  let angle = $derived(config.target.position.sub(config.from.position).angle())
  let tint = $derived(config.tint ?? "var(--color-mild-yellow-white)")

  onMount(arrowShootSound)

  async function ontarget(): Promise<void> {
    const hits = attackRoll(
      config.from.currentStats.aim,
      config.target.currentStats.defence,
    )

    if (hits > 0) {
      damage(config.target, hits)
    }

    events.shootCompleted.emit(config)
  }
</script>

<Projectile {config} {ontarget}>
  <div class="projectile-arrow">
    <div
      class="arrow"
      style:transform="rotate({angle}rad)"
      style:background-color={tint}
    ></div>
  </div>
</Projectile>

<style>
  .projectile-arrow {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .arrow {
    width: 18px;
    height: 1px;
  }
</style>
