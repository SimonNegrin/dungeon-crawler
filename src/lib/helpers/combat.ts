import { Tween } from "svelte/motion"
import { toStore } from "svelte/store"
import { attackFailSound, attackSwordSound } from "./audio"
import { TILE_SIZE, ATTACK_TIME, waitTime, TIME_AFTER_ATTACK } from "./common"
import type { Actor, Character } from "../types"
import Vec2 from "../Vec2"
import { calcStat, createDice, killActor } from "./common"

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

  const attack = calcStat("attack", from)
  const defence = calcStat("defence", from)

  const attackRoll = dice6()
  const defenceRoll = dice6()

  const attackTotal = attack + attackRoll
  const defenceTotal = defence + defenceRoll

  await attackMovement.advance()

  if (attackTotal > defenceTotal) {
    damage(from, target)
    attackSwordSound()
  } else {
    attackFailSound()
  }

  await attackMovement.back()
}

function damage(from: Actor, target: Actor): void {
  const damage = calcStat("damage", from)
  target.stats.health -= damage

  if (target.stats.health <= 0) {
    killActor(target)
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
