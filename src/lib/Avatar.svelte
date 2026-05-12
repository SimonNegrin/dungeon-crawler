<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import { walkSound } from "./helpers/audio"
  import { isEthereal, isFrozen, TILE_SIZE } from "./helpers/common"
  import SpriteMonster from "./sprites/SpriteMonster.svelte"
  import SpriteRogue from "./sprites/SpriteRogue.svelte"
  import { debug, gameState } from "./state.svelte"
  import { TURN_PLAYERS } from "./helpers/game"
  import Health from "./Health.svelte"
  import { fade } from "svelte/transition"
  import type { Actor } from "./types"

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
    >
      {#if frozen}
        <div class="frozen-overlay"></div>
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
  }

  .frozen-overlay {
    position: absolute;
    z-index: 1;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        circle at 30% 20%,
        rgba(178, 226, 255, 0.35),
        transparent 55%
      ),
      radial-gradient(
        circle at 70% 80%,
        rgba(120, 205, 255, 0.25),
        transparent 60%
      ),
      linear-gradient(
        135deg,
        rgba(200, 240, 255, 0.18),
        rgba(0, 0, 0, 0)
      );
    mix-blend-mode: screen;
    box-shadow:
      inset 0 0 0 1px rgba(140, 220, 255, 0.25),
      0 0 10px rgba(120, 205, 255, 0.25);
    animation: frozen-shimmer 900ms ease-in-out infinite alternate;
  }

  @keyframes frozen-shimmer {
    from {
      opacity: 0.55;
    }
    to {
      opacity: 0.85;
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
