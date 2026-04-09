import {
  createAttackPlan,
  createVisionSystem,
  INITIATIVE_ATTACK,
  INITIATIVE_STEP,
  STEP_TIME,
  TIME_AFTER_ATTACK,
  VIEW_DISTANCE,
  waitTime,
} from "./common"
import { gameState } from "../state.svelte"
import type { AttackPlan, Monster, Player } from "../types"
import Vec2 from "../Vec2"
import { walkSound } from "./audio"
import { getRectAdjacentActors, getCharacterPathTo } from "./stage"
import { combat, physicAttack } from "./combat"

export default class MonstersController {
  private monstersPool: Monster[] = []
  private visionSystem = createVisionSystem()

  async execute(): Promise<void> {
    gameState.ignoreInput = true
    this.restoreMonstersInitiative()
    this.loadMonstersPool()
    await this.attackPhase()
    await this.movePhase()
    gameState.ignoreInput = false
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
    const healthFactor = 1.5
    const stepsFactor = 1
    const playersInPath = new Map<Monster, number>()

    // Count how many players will find the monster in his way
    // So the more players in the way will increate the path cost
    // because they have a change to attack the monster while he walks
    attackPlans.forEach((attackPlan) => {
      let inPath = 0

      attackPlan.path.forEach((step) => {
        const adjacentPlayers = getRectAdjacentActors(step, "player").filter(
          (player) => {
            // We not take into account the target player
            return player !== attackPlan.target
          },
        )
        inPath += adjacentPlayers.length
      })

      const monster = attackPlan.attacker as Monster
      playersInPath.set(monster, inPath)
    })

    const [attackPlan] = attackPlans.toSorted((a, b) => {
      const inPathA = playersInPath.get(a.attacker as Monster)!
      const inPathB = playersInPath.get(b.attacker as Monster)!
      const healthCostA = a.target.stats.health * healthFactor
      const healthCostB = b.target.stats.health * healthFactor
      const pathCostA = a.path.length * stepsFactor
      const pathCostB = b.path.length * stepsFactor
      const totalA = healthCostA + pathCostA + inPathA
      const totalB = healthCostB + pathCostB + inPathB
      return totalA - totalB
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
    for (const step of path) {
      if (monster.initiativeLeft < INITIATIVE_STEP) {
        break
      }

      // If the player current position is rect adjacent to a player
      // the player has an oportunity to attack the monster
      const adjacentPlayers = getRectAdjacentActors(monster.position, "player")
      for (const adjacentPlayer of adjacentPlayers) {
        await physicAttack(adjacentPlayer, monster)
        await waitTime(TIME_AFTER_ATTACK)
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
