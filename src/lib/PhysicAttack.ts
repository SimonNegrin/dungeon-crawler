import { calcStat } from "./common"
import type Dice from "./Dice"
import type { Character } from "./types"

export default class PhysicAttack {
  constructor(private dice: Dice) {}

  attack(from: Character, target: Character): boolean {
    const attack = calcStat("attack", from)
    const defence = calcStat("defence", from)

    const attackRoll = this.dice.roll()
    const defenceRoll = this.dice.roll()

    const attackTotal = attack + attackRoll
    const defenceTotal = defence + defenceRoll

    if (defenceTotal >= attackTotal) {
      return false
    }

    this.damage(from, target)

    return true
  }

  private damage(from: Character, target: Character): void {
    const damage = calcStat("damage", from)
    target.stats.health -= damage
  }
}
