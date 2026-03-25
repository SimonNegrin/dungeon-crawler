<script lang="ts">
  import { fade, fly } from "svelte/transition"
  import { gameState } from "./state.svelte"
  import type { Inventory } from "./types"
  import { onMount } from "svelte"
  import { chestOpenSound } from "./audio"
  import InventoryView from "./InventoryView.svelte"

  let {
    inventory,
  }: {
    inventory: Inventory
  } = $props()

  let focusChest = $state(true)
  let currentPlayer = $derived(gameState.currentPlayer)
  let indexLeft = $state(0)
  let indexRight = $state(0)

  onMount(chestOpenSound)

  function moveToRight(index: number): void {
    const [item] = inventory.items.splice(index, 1)
    currentPlayer.items.push(item)
  }

  function moveToLeft(index: number): void {
    const [item] = currentPlayer.items.splice(index, 1)
    inventory.items.push(item)
  }

  function onleft(index: number): void {
    const row = Math.floor(index / 3)
    indexLeft = row === 0 ? 2 : 5
    toggleFocus()
  }

  function onright(index: number): void {
    const row = Math.floor(index / 3)
    indexRight = row * 3
    toggleFocus()
  }

  function toggleFocus(): void {
    focusChest = !focusChest
  }
</script>

<div class="inventory-exchange" transition:fade>
  <div class="inventories" transition:fly={{ y: 20 }}>
    <div class="inventory">
      <div class="inventory-name">{inventory.name}</div>
      <div class="inventory-content">
        <InventoryView
          bind:selectedIndex={indexLeft}
          {inventory}
          focus={focusChest}
          onselect={moveToRight}
          {onright}
        />
      </div>
    </div>
    <div class="inventory">
      <div class="inventory-name">{currentPlayer.name}</div>
      <div class="inventory-content">
        <InventoryView
          bind:selectedIndex={indexRight}
          inventory={currentPlayer}
          focus={!focusChest}
          onselect={moveToLeft}
          {onleft}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .inventory-exchange {
    --color-font: #f5e9bc;
    --color-back: #a78a20;

    position: absolute;
    z-index: 300;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .inventories {
    pointer-events: all;
    display: flex;
    width: 80%;
    height: 80%;
    background-color: var(--color-font);
    border-radius: 10px;
  }
  .inventory {
    flex: 1 0 0;
    min-height: 0;
    color: var(--color-back);
    text-align: center;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .inventory-name {
    font-size: 1em;
    border-bottom: 2px dotted var(--color-back);
  }
  .inventory-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
