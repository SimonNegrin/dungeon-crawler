import {
  createAttackPlan,
  createVisionSystem,
  STEP_TIME,
  TIME_AFTER_ATTACK,
  VIEW_DISTANCE,
  waitTime,
} from "./common"
import { gameState } from "../state.svelte"
import type { AttackPlan, IMonster, IPlayer } from "../types"
import Vec2 from "../Vec2"
import { walkSound } from "./audio"
import { getRectAdjacentActors, getCharacterPathTo } from "./stage"
import { combat, physicAttack } from "./combat"

export default class MonstersController {
  private monstersPool: IMonster[] = []
  private visionSystem = createVisionSystem()
  private statusBlockedThisTurn = new Set<string>()

  async execute(): Promise<void> {
    gameState.ignoreInput = true
    this.restoreMonstersStats()
    this.tickStatuses()
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
      return monster.isAlive && !this.statusBlockedThisTurn.has(monster.id)
    })
  }

  private tickStatuses(): void {
    this.statusBlockedThisTurn.clear()

    for (const monster of gameState.monsters) {
      if (!monster.isAlive) continue

      const statusItems = [...monster.traits, ...monster.items].filter(
        (item) => {
          const m = item.metadata
          if (!m || typeof m.turns !== "number" || m.turns <= 0) {
            return false
          }
          return (
            m.frozen === true ||
            m.burning === true ||
            m.confused === true ||
            m.statusId !== undefined
          )
        },
      )

      for (const item of statusItems) {
        const m = item.metadata!
        const isFrozen = m.frozen === true || m.statusId === "frozen"

        m.turns = m.turns! - 1

        if (isFrozen) {
          this.statusBlockedThisTurn.add(monster.id)
        }

        if (m.turns <= 0) {
          const inTraits = monster.traits.indexOf(item)
          if (inTraits !== -1) {
            monster.traits.splice(inTraits, 1)
            continue
          }

          const inItems = monster.items.indexOf(item)
          if (inItems !== -1) {
            monster.items.splice(inItems, 1)
          }
        }
      }
    }
  }

  private async attackPhase(): Promise<void> {
    let attackPlan: AttackPlan | undefined
    // 1. Get a monster that can see a player and can attack
    while ((attackPlan = await this.getAttackPlan())) {
      await this.executeAttackPlan(attackPlan)
    }
  }

  private monsterCanViewPlayer(monster: IMonster, player: IPlayer): boolean {
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
    let monster: IMonster | undefined
    while ((monster = this.monstersPool.shift())) {
      for (const player of gameState.players) {
        if (!player.actor.isAlive) {
          continue
        }

        if (!this.monsterCanViewPlayer(monster, player.actor)) {
          continue
        }

        const path = await getCharacterPathTo(monster, player.actor.position)

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
        const attackPlan = await this.getAttackPlanForPlayer(
          monster,
          player.actor,
        )
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
    const playersInPath = new Map<IMonster, number>()

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

      const monster = attackPlan.attacker as IMonster
      playersInPath.set(monster, inPath)
    })

    const [attackPlan] = attackPlans.toSorted((a, b) => {
      const inPathA = playersInPath.get(a.attacker as IMonster)!
      const inPathB = playersInPath.get(b.attacker as IMonster)!
      const healthCostA = a.target.currentStats.health * healthFactor
      const healthCostB = b.target.currentStats.health * healthFactor
      const pathCostA = a.path.length * stepsFactor
      const pathCostB = b.path.length * stepsFactor
      const totalA = healthCostA + pathCostA + inPathA
      const totalB = healthCostB + pathCostB + inPathB
      return totalA - totalB
    })
    return attackPlan
  }

  private async getAttackPlanForPlayer(
    monster: IMonster,
    player: IPlayer,
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
    const monster = attackPlan.attacker as IMonster
    const player = attackPlan.target as IPlayer

    if (gameState.centerActor !== player) {
      gameState.centerActor = player
      await waitTime(200)
    }

    await this.moveAlongPath(monster as IMonster, attackPlan.path)

    while (
      monster.isAlive &&
      player.isAlive &&
      monster.currentStats.actions > 0
    ) {
      monster.currentStats.actions--
      await this.attackPlayer(monster, player)
    }
  }

  private async attackPlayer(
    monster: IMonster,
    player: IPlayer,
  ): Promise<void> {
    await combat(monster, player)
    await waitTime(200)
  }

  // Move the monster along the path until the end is reached
  // or the monster has enough initiative
  private async moveAlongPath(monster: IMonster, path: Vec2[]): Promise<void> {
    for (const step of path) {
      if (monster.currentStats.movement <= 0) {
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
      monster.currentStats.movement--
    }
  }

  private restoreMonstersStats(): void {
    gameState.monsters.forEach((monster) => {
      monster.currentStats = { ...monster.totalStats }
    })
  }
}
