<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import { walkSound } from "./helpers/audio"
  import {
    isEthereal,
    isFrozen,
    isBurning,
    isConfused,
    TILE_SIZE,
  } from "./helpers/common"
  import SpriteMonster from "./sprites/SpriteMonster.svelte"
  import SpriteRogue from "./sprites/SpriteRogue.svelte"
  import { debug, gameState } from "./state.svelte"
  import { TURN_PLAYERS } from "./helpers/game"
  import Health from "./Health.svelte"
  import { fade } from "svelte/transition"
  import type { Actor } from "./types"
  import FrozenOverlay from "./FrozenOverlay.svelte"
  import BurningOverlay from "./BurningOverlay.svelte"
  import ConfusedOverlay from "./ConfusedOverlay.svelte"

  let {
    actor,
    highlight = false,
  }: {
    actor: Actor
    highlight?: boolean
  } = $props()

  let lastPosition = actor.position
  let lookRight = $state(false)
  let frozen = $derived(isFrozen(actor))
  let burning = $derived(isBurning(actor))
  let confused = $derived(isConfused(actor))

  $effect(() => {
    if (actor.position.x !== lastPosition.x) {
      lookRight = actor.position.x > lastPosition.x
    }
    if (!lastPosition.isEqual(actor.position)) {
      walkSound()
      lastPosition = actor.position
    }
  })
</script>

{#if actor.isAlive}
  <div
    class="avatar"
    style:left="{actor.position.x * TILE_SIZE + actor.offset.x}px"
    style:top="{actor.position.y * TILE_SIZE + actor.offset.y}px"
    out:fade
  >
    {#if debug.showHealth}
      <Health health={actor.currentStats.health} />
    {/if}

    {#if gameState.turn === TURN_PLAYERS && highlight}
      <div class="highlight"></div>
    {/if}

    <div
      class="sprite-wrapper"
      class:ethereal={isEthereal(actor)}
      class:frozen
      class:burning
      class:confused
    >
      {#if frozen}
        <FrozenOverlay />
      {/if}
      {#if burning}
        <BurningOverlay />
      {/if}
      {#if confused}
        <ConfusedOverlay />
      {/if}
      {#if actor.type === "player"}
        <SpriteRogue name={actor.sprite} invert={lookRight} />
      {:else}
        <SpriteMonster name={actor.sprite} invert={lookRight} />
      {/if}
    </div>
  </div>
{/if}

<style>
  .avatar {
    position: absolute;
    z-index: 1;
    transition-duration: 200ms;
    width: var(--tile-size);
    height: var(--tile-size);
  }

  .sprite-wrapper {
    position: relative;
    width: 100%;
    height: 100%;

    &.ethereal {
      filter: drop-shadow(0 0 1px white);
      opacity: 0.8;
    }

    &.frozen {
      filter: saturate(0.9) brightness(1.05);
    }

    &.burning {
      filter: saturate(1.3) brightness(1.1);
    }

    &.confused {
      animation: confused-wobble 300ms ease-in-out infinite alternate;
    }
  }

  @keyframes confused-wobble {
    from {
      transform: translateX(-1px);
    }
    to {
      transform: translateX(1px);
    }
  }

  .highlight {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px dotted var(--color-gold-yellow);
  }
</style>
