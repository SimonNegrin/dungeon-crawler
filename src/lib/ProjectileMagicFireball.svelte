<script lang="ts">
  import Animation from "./Animation.svelte"
  import Projectile from "./Projectile.svelte"
  import type { IProjectileConfig } from "./types"
  import { events } from "./helpers/common"
  import { attackRoll, damage } from "./helpers/combat"
  import { magicFireSound, magicShootSound } from "./helpers/audio"
  import { onMount } from "svelte"

  let {
    config,
  }: {
    config: IProjectileConfig
  } = $props()

  let animation: Animation
  let showBullet = $state(true)
  let bulletTint = $derived(config.tint ?? "var(--color-mild-yellow-white)")
  let impactTint = $derived(
    config.impactTint ?? config.tint ?? "var(--color-gold-yellow)",
  )

  onMount(magicShootSound)

  async function ontarget(): Promise<void> {
    showBullet = false

    const hits = attackRoll(
      config.from.currentStats.magic,
      config.target.currentStats.defence,
    )

    if (hits > 0) {
      damage(config.target, hits)
    }

    magicFireSound()
    await animation.play()
    events.shootCompleted.emit(config)
  }
</script>

<Projectile {config} {ontarget}>
  <div class="projectile-magic-fireball">
    <div class="fireball">
      <Animation
        color={impactTint}
        bind:this={animation}
        animation={{
          spritesheet: "/animations/explotions.png",
          size: { width: 64, height: 64 },
          keyframes: [
            { x: 11, y: 7 },
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
          ],
        }}
      />
      <div
        class="bullet"
        class:show={showBullet}
        style:background-color={bulletTint}
      ></div>
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
  }
  .bullet {
    position: absolute;
    z-index: 2;
    top: calc(50% - 3px);
    left: calc(50% - 3px);
    width: 6px;
    height: 6px;
    border-radius: 100%;
    opacity: 0;

    &.show {
      opacity: 1;
    }
  }
</style>
