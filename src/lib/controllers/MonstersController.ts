import {
  createVisionSystem,
  INITIATIVE_ATTACK,
  INITIATIVE_STEP,
  STEP_TIME,
  VIEW_DISTANCE,
  waitTime,
} from "../common"
import { gameState } from "../state.svelte"
import type { Monster, Player } from "../types"
import Vec2 from "../Vec2"
import { walkSound } from "../helpers/audio"
import { getCharacterPathTo, isCharacterAtPositon } from "../helpers/stage"
import { combat, physicAttack } from "../helpers/combat"
import { getAdjacentActors } from "../helpers/common"

interface AttackPlan {
  monster: Monster
  player: Player
  path: Vec2[]
}

export default class MonstersController {
  private monstersPool: Monster[] = []
  private visionSystem = createVisionSystem()

  async execute(): Promise<void> {
    this.restoreMonstersInitiative()

    // Create a monsters pool
    // The monsters will be extracted from the pool each time
    // they are used to attack or move
    // Once the pool is empty the turn of the monsters
    // will have finished
    this.monstersPool = gameState.monsters.slice(0)

    await this.attackPhase()
    await this.movePhase()
  }

  private async attackPhase(): Promise<void> {
    let attackPlan: AttackPlan | undefined
    // 1. Get a monster that can see a player and can attack
    while ((attackPlan = await this.getAttackPlan())) {
      await this.executeAttackPlan(attackPlan)
    }
  }

  private monsterCanViewPlayer(monster: Monster, player: Player): boolean {
    // The distance must be lower or equal than VIEW_DISTANCE
    if (monster.position.distanceTo(player.position) > VIEW_DISTANCE) {
      return false
    }

    if (
      !this.visionSystem.hasLineOfSight(
        monster.position.x,
        monster.position.y,
        player.position.x,
        player.position.y,
      )
    ) {
      return false
    }

    return true
  }

  private async movePhase(): Promise<void> {
    let monster: Monster | undefined
    while ((monster = this.monstersPool.shift())) {
      for (const player of gameState.players) {
        if (!player.isAlive) {
          continue
        }

        if (!this.monsterCanViewPlayer(monster, player)) {
          continue
        }

        const path = await getCharacterPathTo(monster, player.position)

        if (!path) {
          continue
        }

        await this.moveAlongPath(monster, path)
      }
    }
  }

  // Return a monster that can see a player
  // and is close enough to attack
  private async getAttackPlan(): Promise<AttackPlan | undefined> {
    for (let i = 0; i < this.monstersPool.length; i++) {
      const monster = this.monstersPool[i]
      for (const player of gameState.players) {
        if (!player.isAlive) {
          continue
        }

        if (!this.monsterCanViewPlayer(monster, player)) {
          continue
        }

        const path = await getCharacterPathTo(monster, player.position)

        if (!path) {
          continue
        }

        const initiativeNeeded = path.length + INITIATIVE_ATTACK

        if (initiativeNeeded > monster.initiativeLeft) {
          continue
        }

        // Remove the monster from the pool
        this.monstersPool.splice(i, 1)

        return { monster, player, path }
      }
    }
  }

  private async executeAttackPlan(attackPlan: AttackPlan): Promise<void> {
    const { monster, player } = attackPlan
    gameState.centerActor = player

    await this.moveAlongPath(monster, attackPlan.path)

    while (player.isAlive && monster.initiativeLeft >= INITIATIVE_ATTACK) {
      await this.attackPlayer(monster, player)
    }
  }

  private async attackPlayer(monster: Monster, player: Player): Promise<void> {
    if (monster.initiativeLeft < INITIATIVE_ATTACK) {
      return
    }
    monster.initiativeLeft -= INITIATIVE_ATTACK

    await combat(monster, player)
    await waitTime(200)
  }

  // Move the monster along the path until the end is reached
  // or the monster has enough initiative
  private async moveAlongPath(monster: Monster, path: Vec2[]): Promise<void> {
    // Skip the first step because is the current monster position
    path = path.slice(1)

    // If the last step is the position of a character we skip it
    // to prevent occupy the same position
    if (path.length > 0 && isCharacterAtPositon(path.at(-1)!)) {
      path = path.slice(0, -1)
    }

    for (const step of path) {
      if (monster.initiativeLeft < INITIATIVE_STEP) {
        break
      }

      // If the player current position is rect adjacent to a player
      // the player has an oportunity to attack the monster
      const adjacentPlayers = getAdjacentActors(monster.position, "player")
      for (const adjacentPlayer of adjacentPlayers) {
        await physicAttack(adjacentPlayer, monster)
        await waitTime(100)
      }

      if (!monster.isAlive) {
        break
      }

      monster.position = step
      await waitTime(STEP_TIME)
      walkSound()
      monster.initiativeLeft -= INITIATIVE_STEP
    }
  }

  private restoreMonstersInitiative(): void {
    gameState.monsters.forEach((monster) => {
      monster.initiativeLeft = monster.stats.initiative
    })
  }
}
