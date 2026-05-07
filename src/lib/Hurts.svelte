<script lang="ts">
  import { TILE_SIZE } from "./helpers/common"
  import { gameState } from "./state.svelte"
  import type { Hurt } from "./types"

  function oncompleted(hurt: Hurt): void {
    gameState.hurts = gameState.hurts.filter((h) => {
      return h !== hurt
    })
  }
</script>

{#each gameState.hurts as hurt (hurt)}
  <div
    class="hurt"
    style:left="{TILE_SIZE * hurt.position.x}px"
    style:top="{TILE_SIZE * hurt.position.y}px"
    onanimationend={() => oncompleted(hurt)}
  >
    <div class="damage">
      {hurt.damage}
    </div>
  </div>
{/each}

<style>
  .hurt {
    position: absolute;
    z-index: 5;
    width: 0;
    height: 0;
  }

  .damage {
    --shadow-color: var(--color-mild-yellow-white);
    color: var(--color-tomato-red);
    text-shadow:
      1px 1px 0 var(--shadow-color),
      -1px 1px 0 var(--shadow-color),
      1px -1px 0 var(--shadow-color),
      -1px -1px 0 var(--shadow-color);
    transform: translate(-50%, 0);
    animation-name: number-animation;
    animation-duration: 2s;
    animation-fill-mode: forwards;
    animation-iteration-count: 1;
  }

  @keyframes number-animation {
    0% {
      opacity: 0;
      transform: translate(-50%, 6px);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -6px);
    }
  }
</style>
