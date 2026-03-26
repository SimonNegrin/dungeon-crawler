<script lang="ts">
  import { fade, fly } from "svelte/transition"
  import { gameState } from "./state.svelte"
  import type { Inventory, InventoryType } from "./types"
  import { onMount } from "svelte"
  import { chestCloseSound, chestOpenSound, zipSound } from "./audio"
  import InventoryView from "./InventoryView.svelte"
  import OnkeydownCapture from "./OnkeydownCapture.svelte"

  let {
    inventory,
  }: {
    inventory: Inventory
  } = $props()

  const openSounds: Record<InventoryType, () => void> = {
    chest: chestOpenSound,
    player: zipSound,
    enemy: zipSound,
  }
  const closeSounds: Record<InventoryType, () => void> = {
    chest: chestCloseSound,
    player: zipSound,
    enemy: zipSound,
  }

  let focusRight = $state(true)
  let currentPlayer = $derived(gameState.currentPlayer)
  let indexLeft = $state(0)
  let indexRight = $state(0)

  onMount(() => {
    openSounds[inventory.type]()
  })

  function moveToRight(index: number): void {
    const [item] = currentPlayer.items.splice(index, 1)
    inventory.items.push(item)
  }

  function moveToLeft(index: number): void {
    const [item] = inventory.items.splice(index, 1)
    currentPlayer.items.push(item)
  }

  function onleft(index: number): void {
    const row = Math.floor(index / 3)
    indexLeft = row * 3 + 2
    toggleFocus()
  }

  function onright(index: number): void {
    const row = Math.floor(index / 3)
    indexRight = row * 3
    toggleFocus()
  }

  function toggleFocus(): void {
    focusRight = !focusRight
  }

  function close(): void {
    closeSounds[inventory.type]()
    gameState.openInventory = null
  }
</script>

<OnkeydownCapture key="Escape" handler={close} />

<div class="inventory-exchange" transition:fade>
  <div class="inventories" transition:fly={{ y: 20 }}>
    <div class="inventory">
      <div class="inventory-name">{currentPlayer.name}</div>
      <div class="inventory-content">
        <InventoryView
          bind:selectedIndex={indexLeft}
          inventory={currentPlayer}
          focus={!focusRight}
          onselect={moveToRight}
          {onright}
        />
      </div>
    </div>
    <div class="inventory">
      <div class="inventory-name">{inventory.name}</div>
      <div class="inventory-content">
        <InventoryView
          bind:selectedIndex={indexRight}
          {inventory}
          focus={focusRight}
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
