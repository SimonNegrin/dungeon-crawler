<script lang="ts">
  import CrtScreen from "./CrtScreen.svelte"
  import PlayerBinding from "./PlayerBinding.svelte"
  import PlayerPreview from "./PlayerPreview.svelte"
  import { gameState } from "./state.svelte"

  let playerId: string = $state(crypto.randomUUID())
  let wrapperWidth: number = $state(0)
  let landingScale = $derived(wrapperWidth / 736)

  function onconnection(): void {
    playerId = crypto.randomUUID()
  }
</script>

<CrtScreen flickerOpacity={0.9} vhs={true}>
  <div class="landing-wrapper" bind:clientWidth={wrapperWidth}>
    <div
      class="landing"
      role="button"
      tabindex="-1"
      style:--scale={landingScale}
    >
      <div class="landing-content">
        <div class="title">Six Rogues</div>

        <div class="players">
          {#each gameState.players as player (player.playerId)}
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
    color: var(--color-text-primary);
    font-size: 50px;
    text-shadow:
      -2px 0 1px #ff00ff,
      2px 0 1px #00e5ff;
  }
  .players {
    height: 50%;
    display: flex;
    justify-content: center;
    gap: 10px;
  }
</style>
