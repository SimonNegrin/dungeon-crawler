<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import { walkSound } from "./audio"
  import { isEthereal, TILE_SIZE } from "./common"
  import SpriteMonster from "./sprites/SpriteMonster.svelte"
  import SpriteRogue from "./sprites/SpriteRogue.svelte"
  import type { Actor } from "./types"

  let {
    actor,
    highlight = false,
  }: {
    actor: Actor
    highlight?: boolean
  } = $props()

  // let lastPosition = actor.position
  let lookRight = $state(false)

  // $effect(() => {
  //   if (actor.position.x !== lastPosition.x) {
  //     lookRight = actor.position.x > lastPosition.x
  //   }
  //   if (!lastPosition.isEqual(actor.position)) {
  //     walkSound()
  //     lastPosition = actor.position
  //   }
  // })
</script>

<div
  class="avatar"
  class:ethereal={isEthereal(actor)}
  style:left="{actor.position.x * TILE_SIZE + actor.offset.x}px"
  style:top="{actor.position.y * TILE_SIZE + actor.offset.y}px"
>
  {#if highlight}
    <div class="highlight"></div>
  {/if}

  {#if actor.type === "player"}
    <SpriteRogue name={actor.sprite} invert={lookRight} />
  {:else}
    <SpriteMonster name={actor.sprite} invert={lookRight} />
  {/if}
</div>

<style>
  .avatar {
    position: absolute;
    z-index: 1;
    transition-duration: 200ms;
    width: var(--tile-size);
    height: var(--tile-size);

    &.ethereal {
      filter: drop-shadow(0 0 1px white);
      opacity: 0.8;
    }
  }

  .highlight {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px dotted yellow;
  }
</style>
