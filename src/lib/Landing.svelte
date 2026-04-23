<script lang="ts">
  import { onMount } from "svelte"
  import CrtScreen from "./CrtScreen.svelte"
  import PlayerBinding from "./PlayerBinding.svelte"
  import PlayerPreview from "./PlayerPreview.svelte"
  import type { IPlayerConnection } from "./types"

  let {
    onclick,
  }: {
    onclick: () => void
  } = $props()

  let playerId: string = $state(crypto.randomUUID())
  let players: IPlayerConnection[] = $state([])
  let wrapperWidth: number = $state(0)
  let landingScale = $derived(wrapperWidth / 736)

  onMount(() => {})

  function onconnection(player: IPlayerConnection): void {
    players.push(player)
    playerId = crypto.randomUUID()
  }
</script>

<CrtScreen flickerOpacity={0.9} vhs={true}>
  <div class="landing-wrapper" bind:clientWidth={wrapperWidth}>
    <div
      class="landing"
      {onclick}
      onkeydown={onclick}
      role="button"
      tabindex="-1"
      style:--scale={landingScale}
    >
      <div class="landing-content">
        <div class="title">Six Rogues</div>

        <div class="players">
          {#each players as player (player.actor.id)}
            <PlayerPreview {player} />
          {/each}

          {#if playerId}
            {#key playerId}
              <PlayerBinding {playerId} {onconnection} />
            {/key}
          {/if}
        </div>
      </div>
    </div>
  </div>
</CrtScreen>

<style>
  .landing-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .landing {
    width: 736px;
    aspect-ratio: 16 / 9;
    transform: scale(var(--scale));
  }
  .landing-content {
    width: 100%;
    height: 100%;
    background-image: url(/images/landing.png);
    background-size: cover;
    display: flex;
    flex-direction: column;
  }
  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50%;
    text-align: center;
    color: #fff;
    font-size: 50px;
    text-shadow:
      -2px 0 0 rgb(226, 62, 251),
      2px 0 0 rgb(62, 251, 223);
  }
  .players {
    height: 50%;
    display: flex;
    justify-content: center;
    gap: 10px;
  }
</style>
