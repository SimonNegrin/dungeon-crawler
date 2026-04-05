import { Tween } from "svelte/motion"
import {
  ATTACK_TIME,
  getCharacterPathTo,
  INITIATIVE_ATTACK,
  INITIATIVE_STEP,
  STEP_TIME,
  TILE_SIZE,
  waitTime,
} from "./common"
import { gameState } from "./state.svelte"
import type { Monster, Player } from "./types"
import Vec2 from "./Vec2"
import { toStore } from "svelte/store"
import { attackSword, walkSound } from "./audio"

interface AttackPlan {
  monster: Monster
  player: Player
  path: Vec2[]
}

export default class MonstersController {
  private monstersPool: Monster[] = []

  async execute(): Promise<void> {
    this.restoreMonstersInitiative()

    // Create a monsters pool
    // The monsters will be extracted from the pool each time
    // they are used to attack or move
    // Once the pool is empty the turn of the monsters
    // will have finished
    this.monstersPool = gameState.monsters.slice(0)

    let monsterPath: AttackPlan | undefined
    // 1. Get a monster that can see a player and can attack
    while ((monsterPath = await this.getAttackMonsterPath())) {
      await this.executeAttackPlan(monsterPath)
    }
    // Divide them in two groups
    // Those that can attack and those that not
    // Attack with monsters that can do it
    // Move the rest to get best positions
  }

  // Return a monster that can see a player
  // and is close enough to attack
  private async getAttackMonsterPath(): Promise<AttackPlan | undefined> {
    for (let i = 0; i < this.monstersPool.length; i++) {
      const monster = this.monstersPool[i]
      for (const player of gameState.players) {
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
    gameState.centerActor = attackPlan.player

    const nextToPath = attackPlan.path.slice(0, -1)

    await this.moveAlongPath(attackPlan.monster, nextToPath)

    while (attackPlan.monster.initiativeLeft >= INITIATIVE_ATTACK) {
      await this.attack(attackPlan.monster, attackPlan.player)
    }
  }

  private async attack(monster: Monster, player: Player): Promise<void> {
    monster.initiativeLeft -= INITIATIVE_ATTACK

    const displacement = player.position
      .sub(monster.position)
      .multiply(TILE_SIZE / 2)

    const tween = new Tween(monster.offset, {
      duration: Math.floor(ATTACK_TIME / 2),
      interpolate: (a) => {
        return (t: number): Vec2 => {
          return a.add(displacement.multiply(t))
        }
      },
    })

    const store = toStore(() => tween.current)

    store.subscribe((offset) => {
      monster.offset = offset
    })

    await tween.set(monster.offset.add(displacement))
    attackSword()
    await tween.set(new Vec2(0, 0))
    await waitTime(200)
  }

  private async moveAlongPath(monster: Monster, path: Vec2[]): Promise<void> {
    for (const step of path) {
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
