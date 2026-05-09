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

