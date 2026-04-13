<script lang="ts">
  import { attackRoll, damage } from "./helpers/combat"
  import { events } from "./helpers/common"
  import Projectile from "./Projectile.svelte"
  import type { IProjectileConfig } from "./types"

  let {
    config,
  }: {
    config: IProjectileConfig
  } = $props()

  let angle = $derived(config.target.position.sub(config.from.position).angle())

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
    <div class="arrow" style:transform="rotate({angle}rad)"></div>
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
    background-color: #fff;
  }
</style>
