<script lang="ts">
  import { onMount } from "svelte"
  import Animation from "./Animation.svelte"
  import Projectile from "./Projectile.svelte"
  import type { IProjectileConfig } from "./types"
  import { events } from "./helpers/common"
  import { attackRoll, damage } from "./helpers/combat"

  let {
    config,
  }: {
    config: IProjectileConfig
  } = $props()

  let animation: Animation

  onMount(() => {
    animation.play()
  })

  function ontarget(): void {
    const hits = attackRoll(
      config.from.currentStats.magic,
      config.target.currentStats.defence,
    )

    if (hits > 0) {
      damage(config.target, hits)
    }

    events.shootCompleted.emit(config)
  }
</script>

<Projectile {config} {ontarget}>
  <div class="projectile-magic-fireball">
    <div class="fireball">
      <Animation
        bind:this={animation}
        animation={{
          spritesheet: "/animations/explotions.png",
          size: { width: 64, height: 64 },
          keyframes: [
            { x: 0, y: 7 },
            { x: 1, y: 7 },
            { x: 2, y: 7 },
            { x: 3, y: 7 },
            { x: 4, y: 7 },
            { x: 5, y: 7 },
            { x: 6, y: 7 },
            { x: 7, y: 7 },
            { x: 8, y: 7 },
            { x: 9, y: 7 },
            { x: 10, y: 7 },
            { x: 11, y: 7 },
          ],
        }}
      />
    </div>
  </div>
</Projectile>

<style>
  .projectile-magic-fireball {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .fireball {
    position: absolute;
    width: 64px;
    height: 64px;
    top: -16px;
    left: -16px;
    background-color: #ffffff4d;
  }
</style>
