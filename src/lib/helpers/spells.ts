import type { Actor, Item } from "../types"
import { canCastMagic, createVisionSystem, SHOOT_DISTANCE } from "./common"
import { tiredSound } from "./audio"
import { projectileTo, attackRoll, damage } from "./combat"

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
        type: "magic",
        variant: "orb",
        tint: "var(--color-mild-yellow-white)",
        impactTint: "var(--color-gold-yellow)",
        onImpact(config) {
          const hits = attackRoll(
            config.from.currentStats.magic,
            config.target.currentStats.defence,
          )
          if (hits > 0) {
            damage(config.target, hits)
          }
        },
      })
    },
  },
  freeze: {
    id: "freeze",
    name: "Congelación",
    type: "effect",
    requiresTarget: true,
    range: SHOOT_DISTANCE,
    requiresLineOfSight: true,
    actionCost: 1,
    consumesItem: true,
    async cast({ target }) {
      if (!target) {
        return
      }

      const existing = [...target.traits, ...target.items].find((item) => {
        return item.metadata?.frozen === true
      })

      if (existing?.metadata) {
        existing.metadata.turns = Math.max(2, existing.metadata.turns ?? 0)
        return
      }

      target.traits.push({
        sprite: "scroll",
        name: "Congelado",
        desc: "No puede actuar",
        metadata: {
          frozen: true,
          turns: 2,
        },
      })
    },
  },
  magic_bolt: {
    id: "magic_bolt",
    name: "Rayo arcano",
    type: "projectile",
    requiresTarget: true,
    range: SHOOT_DISTANCE,
    requiresLineOfSight: true,
    actionCost: 1,
    consumesItem: true,
    async cast({ caster, target }) {
      if (!target) {
        return
      }

      await projectileTo({
        id: Symbol(),
        from: caster,
        target,
        type: "magic",
        variant: "bolt",
        tint: "#aa55ff",
        impactTint: "#cc88ff",
        onImpact(config) {
          const hits = attackRoll(
            config.from.currentStats.magic,
            config.target.currentStats.defence,
          )
          if (hits > 0) {
            damage(config.target, hits)
          }
        },
      })
    },
  },
  magic_shard: {
    id: "magic_shard",
    name: "Esquirla de hielo",
    type: "projectile",
    requiresTarget: true,
    range: SHOOT_DISTANCE,
    requiresLineOfSight: true,
    actionCost: 1,
    consumesItem: true,
    async cast({ caster, target }) {
      if (!target) {
        return
      }

      await projectileTo({
        id: Symbol(),
        from: caster,
        target,
        type: "magic",
        variant: "shard",
        tint: "#55ccff",
        impactTint: "#88ddff",
        onImpact(config) {
          const hits = attackRoll(
            config.from.currentStats.magic,
            config.target.currentStats.defence,
          )
          if (hits > 0) {
            damage(config.target, hits)
          }
        },
      })
    },
  },
  magic_poison: {
    id: "magic_poison",
    name: "Orbe tóxico",
    type: "projectile",
    requiresTarget: true,
    range: SHOOT_DISTANCE,
    requiresLineOfSight: true,
    actionCost: 1,
    consumesItem: true,
    async cast({ caster, target }) {
      if (!target) {
        return
      }

      await projectileTo({
        id: Symbol(),
        from: caster,
        target,
        type: "magic",
        variant: "orb",
        tint: "#44cc44",
        impactTint: "#77ff77",
        onImpact(config) {
          const hits = attackRoll(
            config.from.currentStats.magic,
            config.target.currentStats.defence,
          )
          if (hits > 0) {
            damage(config.target, hits)
          }
        },
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

export type CastSpellArgs = {
  caster: Actor
  spellId: string
  target?: Actor
  item?: Item
}

export async function castSpell({
  caster,
  spellId,
  target,
  item,
}: CastSpellArgs): Promise<boolean> {
  if (!canCastMagic(caster)) {
    return false
  }

  const spell = resolveSpell(spellId)
  if (!spell) {
    return false
  }

  const requiredActions = spell.actionCost || 1
  if (caster.currentStats.actions < requiredActions) {
    tiredSound()
    return false
  }

  if (spell.requiresTarget) {
    if (!target || target.type !== "monster") {
      return false
    }

    const range = item?.metadata?.range ?? spell.range
    if (target.position.distanceTo(caster.position) > range) {
      return false
    }

    if (spell.requiresLineOfSight) {
      const visionSystem = createVisionSystem()
      if (
        !visionSystem.hasLineOfSight(
          caster.position.x,
          caster.position.y,
          target.position.x,
          target.position.y,
        )
      ) {
        return false
      }
    }
  }

  caster.currentStats.actions -= requiredActions

  await spell.cast({ caster, target, item })

  if (item && spell.consumesItem) {
    const uses = item.metadata?.uses
    if (typeof uses === "number") {
      item.metadata!.uses = uses - 1
      if (item.metadata!.uses <= 0) {
        removeItemInstance(caster, item)
      }
    }
  }

  return true
}

function removeItemInstance(actor: Actor, item: Item): void {
  const inItems = actor.items.indexOf(item)
  if (inItems !== -1) {
    actor.items.splice(inItems, 1)
    return
  }

  const inTraits = actor.traits.indexOf(item)
  if (inTraits !== -1) {
    actor.traits.splice(inTraits, 1)
  }
}
