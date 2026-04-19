<script lang="ts">
  import { onMount } from "svelte"
  import CrtScreen from "./CrtScreen.svelte"
  import PlayerBinding from "./PlayerBinding.svelte"
  import type { PlayerConnection } from "./types"

  let {
    onclick,
  }: {
    onclick: () => void
  } = $props()

  let playerIds: string[] = $state([crypto.randomUUID()])
  let connections: PlayerConnection[] = $state([])
  let wrapperWidth: number = $state(0)
  let landingScale = $derived(wrapperWidth / 736)

  onMount(() => {})

  function onconnection(connection: PlayerConnection): void {
    // connection.channel.addEventListener("message", (event) => {
    //   console.log(event.data)
    // })

    connections.push(connection)
    playerIds.push(crypto.randomUUID())
  }

  function ondisconnect(playerId: string): void {
    connections = connections.filter((conn) => {
      return conn.playerId !== playerId
    })
    playerIds = playerIds.filter((playerId) => {
      return connections.some((conn) => conn.playerId === playerId)
    })
    playerIds.push(crypto.randomUUID())
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
          {#each playerIds as playerId (playerId)}
            <PlayerBinding {playerId} {onconnection} {ondisconnect} />
          {/each}
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
