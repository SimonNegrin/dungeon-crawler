<script lang="ts">
  import { getCharacterPathTo, TILE_SIZE } from "../../src/lib/constants"
  import { gameState } from "../../src/lib/state.svelte"
  import type Vec2 from "../../src/lib/Vec2"

  type Step = {
    position: Vec2
    tooFar: boolean
  }

  let steps = $derived(
    updateSteps(gameState.cursorPath, gameState.initiativeLeft),
  )

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

  function updateSteps(cursorPath: Vec2[], initiativeLeft: number): Step[] {
    const steps: Step[] = []
    for (let i = 1; i + 1 < cursorPath.length; i++) {
      steps.push({
        position: cursorPath[i],
        tooFar: i > initiativeLeft,
      })
    }
    return steps
  }
</script>

{#each steps as step}
  <div
    class="step"
    class:too-far={step.tooFar}
    style:left="{step.position.x * TILE_SIZE}px"
    style:top="{step.position.y * TILE_SIZE}px"
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
      background-color: #1dff09;
      border-radius: 100%;
    }

    &.too-far::before {
      background-color: red;
    }
  }
</style>
