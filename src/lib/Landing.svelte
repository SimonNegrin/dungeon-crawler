<script lang="ts">
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

  function onconnection(connection: PlayerConnection): void {
    connection.channel.addEventListener("message", (event) => {
      console.log(event.data)
    })

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

<div class="landing" {onclick} onkeydown={onclick} role="button" tabindex="-1">
  <CrtScreen flickerOpacity={0.9} vhs={true}>
    <div class="landing-content">
      <div class="title">Dungeon Noseque</div>

      <div class="players">
        {#each playerIds as playerId (playerId)}
          <PlayerBinding {playerId} {onconnection} {ondisconnect} />
        {/each}
      </div>
    </div>
  </CrtScreen>
</div>

<style>
  .landing {
    width: 100%;
    height: 100%;
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
    font-size: 100px;
    text-shadow:
      -4px 0 0 rgb(226, 62, 251),
      4px 0 0 rgb(62, 251, 223);
  }

  .players {
    height: 50%;
    display: flex;
    justify-content: center;
    gap: 10px;
  }
</style>
