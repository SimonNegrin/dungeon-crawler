<script lang="ts">
  import { getCharacterPathTo, TILE_SIZE } from "./common"
  import { gameState } from "./state.svelte"
  import type Vec2 from "./Vec2"

  type Step = {
    current: Vec2
    next: Vec2
  }

  let steps = $derived(updateSteps(gameState.cursorPath))

  $effect(() => {
    if (gameState.freezePath) return
    getCharacterPathTo(gameState.currentPlayer, gameState.cursorPosition).then(
      (path) => {
        if (!path) {
          gameState.initiativeRequired = 0
          gameState.cursorPath = []
          return
        }
        gameState.initiativeRequired = Math.max(0, path.length - 1)
        gameState.cursorPath = path
      },
    )
  })

  function updateSteps(cursorPath: Vec2[]): Step[] {
    const steps: Step[] = []
    for (let i = 2; i < cursorPath.length; i++) {
      steps.push({
        current: cursorPath[i - 1],
        next: cursorPath[i],
      })
    }
    return steps
  }
</script>

{#each steps as step}
  <div
    class="step"
    style:left="{step.current.x * TILE_SIZE}px"
    style:top="{step.current.y * TILE_SIZE}px"
  ></div>
{/each}

<style>
  .step {
    --sign-size: 8px;

    position: absolute;
    width: var(--tile-size);
    height: var(--tile-size);
    display: flex;
    justify-content: center;
    align-items: center;

    &::before {
      content: "";
      display: block;
      width: var(--sign-size);
      height: var(--sign-size);
      background-color: yellow;
      border-radius: 100%;
    }
  }
</style>
