<script lang="ts">
  import { INVENTORY_SLOTS } from "./constants"
  import ArrowUpIcon from "./icons/ArrowUpIcon.svelte"
  import Item from "./Item.svelte"
  import ItemStats from "./ItemStats.svelte"
  import type { Inventory } from "./types"

  let {
    selectedIndex = $bindable(0),
    inventory,
    focus = false,
    onselect,
    onleft,
    onright,
  }: {
    selectedIndex?: number
    inventory: Inventory
    focus?: boolean
    onselect?: (index: number) => void
    onleft?: () => void
    onright?: () => void
  } = $props()

  let selectedItem = $derived(inventory.items[selectedIndex])

  function onkeydowncapture(event: KeyboardEvent): void {
    if (!focus) {
      return
    }

    const handlers: Record<string, () => void> = {
      ArrowRight: moveRight,
      ArrowLeft: moveLeft,
      " ": emitSelect,
    }

    if (handlers[event.key]) {
      event.stopImmediatePropagation()
      handlers[event.key]()
    }
  }

  function moveRight(): void {
    const next = selectedIndex + 1
    if (next === 3) {
      onright?.()
      return
    }
    selectedIndex = next
  }

  function moveLeft(): void {
    const next = selectedIndex - 1
    if (next === -1) {
      onleft?.()
      return
    }
    selectedIndex = next
  }

  function emitSelect(): void {
    if (inventory.items[selectedIndex]) {
      onselect?.(selectedIndex)
    }
  }
</script>

<svelte:window {onkeydowncapture} />

<div class="inventory-view" style:--selected-index={selectedIndex}>
  <div class="inventory-grid">
    {#each Array(INVENTORY_SLOTS) as _, i}
      <div class="slot" class:selected={focus && selectedIndex === i}>
        {#if inventory.items[i]}
          <Item name={inventory.items[i].spriteName} />
        {/if}
      </div>
    {/each}spriteName
  </div>

  {#if focus}
    <div class="cursor">
      <div class="pointer" style:left="calc(33% * var(--selected-index) + 13%)">
        <ArrowUpIcon color1="#a78a20" color2="#f5e9bc" />
      </div>
    </div>

    <div class="selected-item">
      {#if selectedItem}
        <div>{selectedItem.name}</div>
        <div>{selectedItem.desc}</div>
        <div>
          <ItemStats item={selectedItem} />
        </div>
      {:else}
        <div class="empty">Vacio</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .inventory-view {
    --bg-color: #a78a2047;

    aspect-ratio: 100 / 66;
  }
  .inventory-grid {
    display: flex;
    gap: 2px;
    padding: 2px;
  }
  .slot {
    flex: 1 0 0;
    aspect-ratio: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid transparent;
    border-radius: 5px;
    background-color: var(--bg-color);
    box-shadow:
      inset 1px 1px 3px var(--color-back),
      inset 1px 1px 5px var(--color-back);

    &.selected {
      border-color: var(--color-back);
    }
  }

  .cursor {
    position: relative;
    height: 10px;
  }

  .pointer {
    position: absolute;
    transition-duration: 100ms;
  }

  .selected-item {
    padding: 10px;
    border: 2px solid var(--color-back);
    border-radius: 5px;
    text-align: left;
  }

  .empty {
    text-align: center;
  }
</style>
