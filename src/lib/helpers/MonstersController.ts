import {
  createAttackPlan,
  createVisionSystem,
  INITIATIVE_ATTACK,
  INITIATIVE_STEP,
  STEP_TIME,
  VIEW_DISTANCE,
  waitTime,
} from "./common"
import { gameState } from "../state.svelte"
import type { AttackPlan, Monster, Player } from "../types"
import Vec2 from "../Vec2"
import { walkSound } from "./audio"
import { getAdjacentActors, getCharacterPathTo } from "./stage"
import { combat, physicAttack } from "./combat"

export default class MonstersController {
  private monstersPool: Monster[] = []
  private visionSystem = createVisionSystem()

  async execute(): Promise<void> {
    this.restoreMonstersInitiative()
    this.loadMonstersPool()
    await this.attackPhase()
    await this.movePhase()
  }

  // Create a monsters pool
  // The monsters will be extracted from the pool each time
  // they are used to attack or move
  // Once the pool is empty the turn of the monsters
  // will have finished
  private loadMonstersPool(): void {
    this.monstersPool = gameState.monsters.filter((monster) => {
      return monster.isAlive
    })
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
      const attackPlans: AttackPlan[] = []

      for (const player of gameState.players) {
        const attackPlan = await this.getAttackPlanForPlayer(monster, player)
        if (attackPlan) {
          attackPlans.push(attackPlan)
        }
      }

      if (!attackPlans.length) {
        continue
      }

      // Remove the monster from the pool
      this.monstersPool.splice(i, 1)
      return this.selectBestAttackPlan(attackPlans)
    }
  }

  private selectBestAttackPlan(attackPlans: AttackPlan[]): AttackPlan {
    const [attackPlan] = attackPlans.toSorted((a, b) => {
      const healthPointsA = a.target.stats.totalHealth - a.target.stats.health
      const healthPointsB = b.target.stats.totalHealth - b.target.stats.health
      const pathPointsA =
        a.attacker.stats.initiative - a.path.length * INITIATIVE_STEP
      const pathPointsB =
        b.attacker.stats.initiative - b.path.length * INITIATIVE_STEP

      return healthPointsA + pathPointsA - (healthPointsB + pathPointsB)
    })
    return attackPlan
  }

  private async getAttackPlanForPlayer(
    monster: Monster,
    player: Player,
  ): Promise<AttackPlan | undefined> {
    if (!player.isAlive) {
      return
    }

    if (!this.monsterCanViewPlayer(monster, player)) {
      return
    }

    return createAttackPlan(monster, player)
  }

  private async executeAttackPlan(attackPlan: AttackPlan): Promise<void> {
    const monster = attackPlan.attacker as Monster
    const player = attackPlan.target as Player
    gameState.centerActor = player

    await this.moveAlongPath(monster as Monster, attackPlan.path)

    while (
      monster.isAlive &&
      player.isAlive &&
      monster.initiativeLeft >= INITIATIVE_ATTACK
    ) {
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
    // // Skip the first step because is the current monster position
    // path = path.slice(1)

    // // If the last step is the position of a character we skip it
    // // to prevent occupy the same position
    // if (path.length > 0 && isActorAtPositon(path.at(-1)!)) {
    //   path = path.slice(0, -1)
    // }

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
