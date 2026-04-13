<script lang="ts">
  import type { TransitionConfig } from "svelte/transition"
  import type { IProjectileConfig } from "./types"
  import { TILE_SIZE } from "./helpers/common"
  import type { Snippet } from "svelte"

  let {
    config,
    children,
    ontarget,
  }: {
    config: IProjectileConfig
    children: Snippet
    ontarget: () => void
  } = $props()

  function animation(
    node: HTMLElement,
    config: IProjectileConfig,
  ): TransitionConfig {
    const distance = config.from.position.distanceTo(config.target.position)

    const diff = config.target.position.sub(config.from.position)

    return {
      duration: distance * 150,
      tick: (t: number) => {
        const pos = config.from.position.add(diff.multiply(t))
        node.style.left = `${TILE_SIZE * pos.x}px`
        node.style.top = `${TILE_SIZE * pos.y}px`
      },
    }
  }
</script>

<div
  class="projectile"
  in:animation={config}
  style:left="{TILE_SIZE * config.from.position.x}px"
  style:top="{TILE_SIZE * config.from.position.y}px"
  onintroend={() => ontarget()}
>
  {@render children()}
</div>

<style>
  .projectile {
    position: absolute;
    z-index: 5;
    width: var(--tile-size);
    height: var(--tile-size);
  }
</style>
