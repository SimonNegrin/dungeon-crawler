<script lang="ts">
  import Animation from "./Animation.svelte"
  import Projectile from "./Projectile.svelte"
  import type { IProjectileConfig } from "./types"
  import { events } from "./helpers/common"
  import { magicFireSound, magicShootSound } from "./helpers/audio"
  import { onMount } from "svelte"

  let {
    config,
  }: {
    config: IProjectileConfig
  } = $props()

  let animation: Animation
  let showBullet = $state(true)
  let variant = $derived(config.variant ?? "orb")
  let bulletTint = $derived(config.tint ?? "var(--color-mild-yellow-white)")
  let impactTint = $derived(
    config.impactTint ?? config.tint ?? "var(--color-gold-yellow)",
  )

  onMount(magicShootSound)

  async function ontarget(): Promise<void> {
    showBullet = false

    config.onImpact?.(config)

    magicFireSound()
    await animation.play()
    events.shootCompleted.emit(config)
  }
</script>

<Projectile {config} {ontarget}>
  <div class="projectile-magic">
    <div class="impact-area">
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
        class:variant-orb={variant === "orb"}
        class:variant-bolt={variant === "bolt"}
        class:variant-shard={variant === "shard"}
        style:background-color={bulletTint}
      ></div>
    </div>
  </div>
</Projectile>

<style>
  .projectile-magic {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .impact-area {
    position: absolute;
    width: 64px;
    height: 64px;
    top: -16px;
    left: -16px;
  }
  .bullet {
    position: absolute;
    z-index: 2;
    opacity: 0;

    &.show {
      opacity: 1;
    }
  }
  .variant-orb {
    width: 6px;
    height: 6px;
    border-radius: 100%;
    top: calc(50% - 3px);
    left: calc(50% - 3px);
  }
  .variant-bolt {
    width: 14px;
    height: 3px;
    border-radius: 2px;
    top: calc(50% - 1.5px);
    left: calc(50% - 7px);
    box-shadow: 0 0 6px currentColor;
  }
  .variant-shard {
    width: 8px;
    height: 12px;
    top: calc(50% - 6px);
    left: calc(50% - 4px);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }
</style>
