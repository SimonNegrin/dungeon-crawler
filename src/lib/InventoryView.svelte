<script lang="ts">
  import ItemSprite from "./ItemSprite.svelte"
  import type { Inventory } from "./types"

  let {
    selectedIndex = $bindable(0),
    inventory,
    focus = false,
    capacity = 6,
    onselect,
    onleft,
    onright,
  }: {
    selectedIndex?: number
    inventory: Inventory
    focus?: boolean
    capacity?: number
    onselect?: (index: number) => void
    onleft?: (index: number) => void
    onright?: (index: number) => void
  } = $props()

  let viewWidth = $state(0)
  let gridWidth = $state(0)
  let scale = $derived(viewWidth / gridWidth)

  function onkeydowncapture(event: KeyboardEvent): void {
    if (!focus) {
      return
    }

    const handlers: Record<string, () => void> = {
      ArrowRight: moveRight,
      ArrowLeft: moveLeft,
      ArrowUp: moveUp,
      ArrowDown: moveDown,
      " ": emitSelect,
    }

    if (handlers[event.key]) {
      event.stopPropagation()
      handlers[event.key]()
    }
  }

  function moveRight(): void {
    const next = selectedIndex + 1
    const a = Math.floor(selectedIndex / 3)
    const b = Math.floor(next / 3)
    if (a !== b) {
      onright?.(selectedIndex)
      return
    }
    selectedIndex = next
  }

  function moveLeft(): void {
    const next = selectedIndex - 1
    const a = Math.floor(selectedIndex / 3)
    const b = Math.floor(next / 3)
    if (a !== b) {
      onleft?.(selectedIndex)
      return
    }
    selectedIndex = next
  }

  function moveUp(): void {
    const next = selectedIndex - 3
    if (next < 0) return
    const a = selectedIndex % 3
    const b = next % 3
    if (a === b) {
      selectedIndex = next
    }
  }

  function moveDown(): void {
    const next = selectedIndex + 3
    if (next > 5) return
    const a = selectedIndex % 3
    const b = next % 3
    if (a === b) {
      selectedIndex = next
    }
  }

  function emitSelect(): void {
    if (inventory.items[selectedIndex]) {
      onselect?.(selectedIndex)
    }
  }
</script>

<svelte:window {onkeydowncapture} />

<div class="inventory-view" bind:clientWidth={viewWidth}>
  <div
    class="inventory-grid"
    style="transform: scale({scale})"
    bind:offsetWidth={gridWidth}
  >
    {#each Array(capacity) as _, index}
      {@const item = inventory.items[index]}
      <div class="slot" class:selected={focus && selectedIndex === index}>
        {#if item}
          <ItemSprite id={item.spriteId} />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .inventory-view {
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 100 / 66;
  }
  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(3, 32px);
    grid-template-rows: repeat(2, 32px);
  }
  .slot {
    &.selected {
      outline: 1px solid var(--color-back);
    }
  }
</style>
