import type { Actor, Item } from "../types"
import { SHOOT_DISTANCE } from "./common"
import { projectileTo } from "./combat"

export type SpellType = "projectile" | "effect" | "support"

export interface SpellCastContext {
  caster: Actor
  target?: Actor
  item?: Item
}

export interface SpellDefinition {
  id: string
  name: string
  type: SpellType
  requiresTarget: boolean
  range: number
  requiresLineOfSight: boolean
  actionCost: number
  consumesItem: boolean
  cast: (ctx: SpellCastContext) => Promise<void>
}

export const SPELLS = {
  magic_projectile: {
    id: "magic_projectile",
    name: "Proyectil mágico",
    type: "projectile",
    requiresTarget: true,
    range: SHOOT_DISTANCE,
    requiresLineOfSight: true,
    actionCost: 1,
    consumesItem: false,
    async cast({ caster, target }) {
      if (!target) {
        return
      }

      await projectileTo({
        id: Symbol(),
        from: caster,
        target,
        type: "fireball",
      })
    },
  },
} satisfies Record<string, SpellDefinition>

export type SpellId = keyof typeof SPELLS

export function getSpell(spellId: SpellId): SpellDefinition {
  return SPELLS[spellId]
}

export function resolveSpell(spellId: string): SpellDefinition | undefined {
  if (Object.hasOwn(SPELLS, spellId)) {
    return SPELLS[spellId as SpellId]
  }
}

export type MagicMenuItem = {
  spellId: string
  name: string
  uses?: number
  item?: Item
}

export function getMagicMenuItems(actor?: Actor): MagicMenuItem[] {
  const items: MagicMenuItem[] = []

  const base = getSpell("magic_projectile")
  items.push({
    spellId: base.id,
    name: base.name,
  })

  if (!actor) {
    return items
  }

  for (const item of [...actor.traits, ...actor.items]) {
    const spellId = item.metadata?.spellId
    if (!spellId) continue

    const spell = resolveSpell(spellId)
    items.push({
      spellId,
      name: spell?.name ?? spellId,
      uses: item.metadata?.uses,
      item,
    })
  }

  return items
}
