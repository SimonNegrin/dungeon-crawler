<script lang="ts">
  import { TILE_SIZE } from "./helpers/common"
  import { getCharacterPathTo } from "./helpers/stage"
  import { gameState } from "./state.svelte"
  import type Vec2 from "./Vec2"

  type Step = {
    position: Vec2
    tooFar: boolean
  }

  let steps = $derived(
    updateSteps(
      gameState.cursorPath,
      gameState.currentPlayer?.actor.currentStats.movement ?? 0,
    ),
  )

  $effect(() => {
    if (gameState.freezePath || !gameState.currentPlayer) return
    getCharacterPathTo(
      gameState.currentPlayer.actor,
      gameState.cursorPosition,
    ).then((path) => {
      if (!path) {
        gameState.cursorPath = []
        return
      }
      gameState.cursorPath = path
    })
  })

  function updateSteps(cursorPath: Vec2[], movement: number): Step[] {
    const steps: Step[] = []
    for (let i = 1; i + 1 < cursorPath.length; i++) {
      steps.push({
        position: cursorPath[i],
        tooFar: i > movement,
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
    z-index: 3;
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
      background-color: var(--color-yellow-green);
      border-radius: 100%;
    }

    &.too-far::before {
      background-color: var(--color-tomato-red);
    }
  }
</style>
