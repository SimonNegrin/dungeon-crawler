<script lang="ts">
  import { TILE_SIZE } from "./common"
  import { gameState } from "./state.svelte"
  import type Vec2 from "./Vec2"

  type Step = {
    current: Vec2
    next: Vec2
  }

  let steps = $derived(updateSteps(gameState.cursorPath))

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

  // function stepClass(step: Step): string {
  //   if (step.current.x > step.next.x) {
  //     return "step-left"
  //   }
  //   if (step.current.x < step.next.x) {
  //     return "step-right"
  //   }
  //   if (step.current.y > step.next.y) {
  //     return "step-up"
  //   }
  //   return "step-down"
  // }
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
      /* border-top: 2px solid yellow;
      border-right: 2px solid yellow; */
    }

    /* &.step-right::before {
      transform: rotate(45deg);
    }
    &.step-left::before {
      transform: rotate(-135deg);
    }
    &.step-up::before {
      transform: rotate(-45deg);
    }
    &.step-down::before {
      transform: rotate(135deg);
    } */
  }
</style>
