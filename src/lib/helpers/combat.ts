import { Tween } from "svelte/motion"
import { toStore } from "svelte/store"
import { attackFailSound, attackSwordSound } from "./audio"
import {
  TILE_SIZE,
  ATTACK_TIME,
  waitTime,
  TIME_AFTER_ATTACK,
  events,
} from "./common"
import type {
  Actor,
  ICharacter,
  IProjectileConfig,
  ProjectileComponent,
  ProjectileType,
} from "../types"
import Vec2 from "../Vec2"
import { createDice, killActor } from "./common"
import { gameState } from "../state.svelte"
import { PKT_PLAYER_HEALTH } from "./connections"
import ProjectileArrow from "../ProjectileArrow.svelte"
import ProjectileMagicFireball from "../ProjectileMagicFireball.svelte"
import MagicProjectile from "../MagicProjectile.svelte"

const dice6 = createDice(6)

export const projectilesMap: Record<ProjectileType, ProjectileComponent> = {
  arrow: ProjectileArrow,
  fireball: ProjectileMagicFireball,
  magic: MagicProjectile,
}

export async function combat(from: Actor, target: Actor): Promise<void> {
  // from attack first
  await physicAttack(from, target)

  // wait a bit
  await waitTime(TIME_AFTER_ATTACK)

  // target fight back
  await physicAttack(target, from)

  // wait a bit more
  await waitTime(TIME_AFTER_ATTACK)
}

export async function physicAttack(from: Actor, target: Actor): Promise<void> {
  if (!from.isAlive) {
    return
  }

  const attackMovement = new AttackMovement(from, target)

  await attackMovement.advance()

  const hits = attackRoll(from.currentStats.attack, target.currentStats.defence)

  if (hits) {
    damage(target, hits)
    attackSwordSound()
  } else {
    attackFailSound()
  }

  await attackMovement.back()
}

export function damage(target: Actor, hits: number): void {
  const health = Math.max(0, target.currentStats.health - hits)
  target.currentStats.health = health

  gameState.hurts.push({
    damage: hits * -1,
    position: target.position,
  })

  if (target.currentStats.health <= 0) {
    killActor(target)
  } else {
    target.sounds.hurt()
  }

  if (target.type === "player") {
    const playerConn = gameState.players.find(
      (conn) => conn.actor.id === target.id,
    )
    if (playerConn) {
      const pkt = new Uint8Array([PKT_PLAYER_HEALTH, health])
      playerConn.webRtc.dataChannel.send(pkt.buffer)
    }
  }
}

class AttackMovement {
  private tween: Tween<Vec2>

  constructor(
    private from: ICharacter,
    private target: ICharacter,
  ) {
    const tween = new Tween(from.offset, {
      duration: Math.floor(ATTACK_TIME / 2),
      interpolate: (a, b) => {
        return (t): Vec2 => {
          return a.add(b.sub(a).multiply(t))
        }
      },
    })

    const store = toStore(() => tween.current)

    store.subscribe((offset) => {
      from.offset = offset
    })

    this.tween = tween
  }

  async advance(): Promise<void> {
    const displacement = this.target.position
      .sub(this.from.position)
      .multiply(TILE_SIZE / 2)
    await this.tween.set(this.from.offset.add(displacement))
  }

  async back(): Promise<void> {
    const zero = new Vec2(0, 0)
    await this.tween.set(zero)
  }
}

export async function projectileTo(config: IProjectileConfig): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = events.shootCompleted.subscribe((completed) => {
      if (completed.id === config.id) {
        unsubscribe()
        resolve()
      }
    })
    events.shoot.emit(config)
  })
}

// Roll attack and defence dices and return the number of hits
export function attackRoll(attack: number, defence: number): number {
  const attackDices = rollDices(attack).toSorted(sortAscent)
  const defenceDices = rollDices(defence).toSorted(sortDescent)

  let hits = 0
  for (let i = 0; i < attackDices.length; i++) {
    const defence = defenceDices[i] ?? 0
    if (attackDices[i] > defence) {
      hits++
    }
  }

  return hits
}

// Roll the given number of dices
function rollDices(dicesNumber: number): number[] {
  const results: number[] = []
  for (let i = 0; i < dicesNumber; i++) {
    results.push(dice6())
  }
  return results
}

const sortAscent = (a: number, b: number) => a - b
const sortDescent = (a: number, b: number) => b - a
