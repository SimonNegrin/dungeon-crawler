import { Tween } from "svelte/motion"
import {
  ATTACK_TIME,
  createVisionSystem,
  getCharacterPathTo,
  INITIATIVE_ATTACK,
  INITIATIVE_STEP,
  isCharacterAtPositon,
  STEP_TIME,
  TILE_SIZE,
  VIEW_DISTANCE,
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
    let monsterPath: AttackPlan | undefined
    // 1. Get a monster that can see a player and can attack
    while ((monsterPath = await this.getAttackMonsterPath())) {
      await this.executeAttackPlan(monsterPath)
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
        if (!this.monsterCanViewPlayer(monster, player)) {
          continue
        }

        let path = await getCharacterPathTo(monster, player.position)

        if (!path) {
          continue
        }

        // Skip the first step because is the current monster position
        path = path.slice(1)

        // If the last step is the position of a character we skip it
        if (path.length > 1 && isCharacterAtPositon(path.at(-1)!)) {
          path = path.slice(0, -1)
        }

        await this.moveAlongPath(monster, path)
      }
    }
  }

  // Return a monster that can see a player
  // and is close enough to attack
  private async getAttackMonsterPath(): Promise<AttackPlan | undefined> {
    for (let i = 0; i < this.monstersPool.length; i++) {
      const monster = this.monstersPool[i]
      for (const player of gameState.players) {
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
    gameState.centerActor = attackPlan.player

    const nextToPath = attackPlan.path.slice(0, -1)

    await this.moveAlongPath(attackPlan.monster, nextToPath)

    while (attackPlan.monster.initiativeLeft >= INITIATIVE_ATTACK) {
      await this.attackPlayer(attackPlan.monster, attackPlan.player)
    }
  }

  private async attackPlayer(monster: Monster, player: Player): Promise<void> {
    if (monster.initiativeLeft < INITIATIVE_ATTACK) {
      return
    }
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

  // Move the monster along the path until the end is reached
  // or the monster has enough initiative
  private async moveAlongPath(monster: Monster, path: Vec2[]): Promise<void> {
    for (const step of path) {
      if (monster.initiativeLeft < INITIATIVE_STEP) {
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
