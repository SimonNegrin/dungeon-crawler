import { playAnimation, removeItemById } from "./common"
import type { Character, Item } from "./types"

export const itemsFactory: Record<string, (id: string) => Item> = {
  short_sword: createShortSwort,
  life_potion: createLifePotion,
}

function createShortSwort(id: string): Item {
  return {
    id,
    spriteId: "sword_short",
    name: "Espada corta",
    desc: "Mejor que nada",
    statModifiers: [
      {
        stat: "attack",
        value: 1,
      },
    ],
  }
}

function createLifePotion(id: string): Item {
  return {
    id,
    spriteId: "potion_red",
    name: "Poción de vida",
    desc: "Genial para la resaca",
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        if (typeof item.metadata?.uses !== "number") {
          removeItemById(character, item.id)
          return
        }

        const amount = Math.floor(1 + 2 * Math.random())
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        item.metadata.uses--
        if (item.metadata.uses <= 0) {
          removeItemById(character, item.id)
        }

        await playAnimation("health", character.position)
      },
    },
  }
}
