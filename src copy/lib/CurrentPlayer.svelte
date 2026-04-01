<../../src/lib/state.sveltescript lang="ts">
  import { calcStat } from "../../src/lib/constantsmport Sprite from ".././Sprite.svelte } from "./state.svelte"
</script>

<div class="current-player">
  <div class="sprite-container">
    <Sprite path={gameState.currentPlayer.spritePath} scale={12} />
  </div>
  <div class="player-name">{gameState.currentPlayer.name}</div>

  <table class="stats-table">
    <tbody>
      <tr>
        <td>Iniciativa</td>
        <td
          >{gameState.initiativeLeft}/{calcStat(
            "initiative",
            gameState.currentPlayer,
          )}</td
        >
      </tr>
      <tr>
        <td>Salud</td>
        <td
          >{calcStat("health", gameState.currentPlayer)}/{calcStat(
            "totalHealth",
            gameState.currentPlayer,
          )}</td
        >
      </tr>
      <tr>
        <td>Ataque</td>
        <td>{calcStat("attack", gameState.currentPlayer)}</td>
      </tr>
      <tr>
        <td>Daño</td>
        <td>{calcStat("damage", gameState.currentPlayer)}</td>
      </tr>

      <tr>
        <td>Defensa</td>
        <td>{calcStat("defence", gameState.currentPlayer)}</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
  .current-player {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    font-size: 2em;
  }
  .sprite-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(var(--tile-size) * 12);
    height: calc(var(--tile-size) * 12);
  }
  .player-name {
    font-size: 2em;
  }
  .stats-table {
    width: 50%;

    & td:nth-child(2) {
      text-align: right;
    }
  }
</style>
