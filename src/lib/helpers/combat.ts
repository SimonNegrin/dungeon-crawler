import { Tween } from "svelte/motion"
import { toStore } from "svelte/store"
import { arrowShootSound, attackFailSound, attackSwordSound } from "./audio"
import { TILE_SIZE, ATTACK_TIME, waitTime, TIME_AFTER_ATTACK } from "./common"
import type { Actor, Arrow, Character } from "../types"
import Vec2 from "../Vec2"
import { createDice, killActor } from "./common"
import { gameState } from "../state.svelte"

const dice6 = createDice(6)

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

  if (hitRoll(from.currentStats.attack, target.currentStats.defence)) {
    damage(from, target)
    attackSwordSound()
  } else {
    attackFailSound()
  }

  await attackMovement.back()
}

function damage(from: Actor, target: Actor): void {
  const damage = 1
  target.currentStats.health -= damage
  gameState.hurts.push({
    damage: damage * -1,
    position: target.position,
  })

  if (target.currentStats.health <= 0) {
    killActor(target)
  } else {
    target.sounds.hurt()
  }
}

class AttackMovement {
  private tween: Tween<Vec2>

  constructor(
    private from: Character,
    private target: Character,
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

export async function arrowTo(from: Actor, target: Actor): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>()

  const arrow: Arrow = {
    id: Symbol(),
    resolve,
    from,
    target,
    hit: hitRoll(from.currentStats.aim, target.currentStats.defence),
  }

  arrowShootSound()

  gameState.arrows.push(arrow)

  await promise

  removeArrow(arrow)

  if (arrow.hit) {
    damage(from, target)
  }
}

function removeArrow(arrow: Arrow): void {
  gameState.arrows = gameState.arrows.filter((a) => {
    return a.id !== arrow.id
  })
}

function hitRoll(attack: number, defence: number): boolean {
  const attackRoll = dice6()
  const defenceRoll = dice6()

  const attackTotal = attack + attackRoll
  const defenceTotal = defence + defenceRoll

  return attackTotal > defenceTotal
}
