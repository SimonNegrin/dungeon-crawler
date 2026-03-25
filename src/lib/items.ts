import { playAnimation, removeItemById } from "./common"
import type { Character, Item } from "./types"

export const itemsFactory: Record<string, (id: string) => Item> = {
  dagger: createDagger,
  short_sword: createShortSword,
  sword: createSword,
  bastard_sword: createBastardSword,
  big_sword: createBigSword,
  great_sword: createGreatSword,
  axe: createAxe,
  big_axe: createBigAxe,
  great_axe: createGreatAxe,
  shield_1: createShield1,
  shield_2: createShield2,
  shield_3: createShield3,
  shield_4: createShield4,
  shield_5: createShield5,
  shield_6: createShield6,
  shield_7: createShield7,
  wizzard_hat: createWizzardHat,
  red_necklace: createRedNecklace,
  iron_necklace: createIronNecklace,
  crystal_necklace: createCrystalNecklace,
  wood_necklace: createWoodNecklace,
  sacred_necklace: createSacredNecklace,
  damned_necklace: createDamnedNecklace,
  parchment: createParchment,
  coin: createCoin,
  coins_1: createCoins1,
  coins_2: createCoins2,
  coins_bag: createCoinsBag,
  cheese: createCheese,
  bread: createBread,
  apple: createApple,
  wine: createWine,
  water: createWater,
  brass_key: createBrassKey,
  iron_key: createIronKey,
  silver_key: createSilverKey,
  rusty_key: createRustyKey,
  life_potion: createLifePotion,
}

function createDagger(id: string): Item {
  return {
    id,
    spriteId: "dagger",
    name: "Daga",
    desc: "Una daga pequeña pero afilada",
    statModifiers: [
      {
        stat: "attack",
        value: 1,
      },
      {
        stat: "initiative",
        value: 1,
      },
    ],
  }
}

function createShortSword(id: string): Item {
  return {
    id,
    spriteId: "short_sword",
    name: "Espada corta",
    desc: "Mejor que nada",
    statModifiers: [
      {
        stat: "attack",
        value: 2,
      },
    ],
  }
}

function createSword(id: string): Item {
  return {
    id,
    spriteId: "sword",
    name: "Espada",
    desc: "Una espada estándar",
    statModifiers: [
      {
        stat: "attack",
        value: 3,
      },
    ],
  }
}

function createBastardSword(id: string): Item {
  return {
    id,
    spriteId: "bastard_sword",
    name: "Espada bastarda",
    desc: "Una espada versátil de una mano y media",
    statModifiers: [
      {
        stat: "attack",
        value: 4,
      },
      {
        stat: "initiative",
        value: -1,
      },
    ],
  }
}

function createBigSword(id: string): Item {
  return {
    id,
    spriteId: "big_sword",
    name: "Espada grande",
    desc: "Una espada enorme",
    statModifiers: [
      {
        stat: "attack",
        value: 5,
      },
      {
        stat: "initiative",
        value: -2,
      },
    ],
  }
}

function createGreatSword(id: string): Item {
  return {
    id,
    spriteId: "great_sword",
    name: "Espadón",
    desc: "Una espada gigantesca para los más fuertes",
    statModifiers: [
      {
        stat: "attack",
        value: 6,
      },
      {
        stat: "damage",
        value: 1,
      },
      {
        stat: "initiative",
        value: -3,
      },
    ],
  }
}

function createAxe(id: string): Item {
  return {
    id,
    spriteId: "axe",
    name: "Hacha",
    desc: "Un hacha de batalla",
    statModifiers: [
      {
        stat: "attack",
        value: 3,
      },
      {
        stat: "damage",
        value: 1,
      },
      {
        stat: "initiative",
        value: -1,
      },
    ],
  }
}

function createBigAxe(id: string): Item {
  return {
    id,
    spriteId: "big_axe",
    name: "Hacha grande",
    desc: "Un hacha enorme",
    statModifiers: [
      {
        stat: "attack",
        value: 4,
      },
      {
        stat: "damage",
        value: 2,
      },
      {
        stat: "initiative",
        value: -2,
      },
    ],
  }
}

function createGreatAxe(id: string): Item {
  return {
    id,
    spriteId: "great_axe",
    name: "Gran hacha",
    desc: "Un hacha colosal",
    statModifiers: [
      {
        stat: "attack",
        value: 5,
      },
      {
        stat: "damage",
        value: 3,
      },
      {
        stat: "initiative",
        value: -3,
      },
    ],
  }
}

function createShield1(id: string): Item {
  return {
    id,
    spriteId: "shield_1",
    name: "Escudo pequeño",
    desc: "Un escudo básico",
    statModifiers: [
      {
        stat: "defence",
        value: 1,
      },
    ],
  }
}

function createShield2(id: string): Item {
  return {
    id,
    spriteId: "shield_2",
    name: "Escudo",
    desc: "Un escudo estándar",
    statModifiers: [
      {
        stat: "defence",
        value: 2,
      },
    ],
  }
}

function createShield3(id: string): Item {
  return {
    id,
    spriteId: "shield_3",
    name: "Escudo grande",
    desc: "Un escudo grande",
    statModifiers: [
      {
        stat: "defence",
        value: 3,
      },
      {
        stat: "initiative",
        value: -1,
      },
    ],
  }
}

function createShield4(id: string): Item {
  return {
    id,
    spriteId: "shield_4",
    name: "Escudo de torre",
    desc: "Un escudo enorme",
    statModifiers: [
      {
        stat: "defence",
        value: 4,
      },
      {
        stat: "initiative",
        value: -2,
      },
    ],
  }
}

function createShield5(id: string): Item {
  return {
    id,
    spriteId: "shield_5",
    name: "Escudo de hierro",
    desc: "Un escudo reforzado",
    statModifiers: [
      {
        stat: "defence",
        value: 3,
      },
    ],
  }
}

function createShield6(id: string): Item {
  return {
    id,
    spriteId: "shield_6",
    name: "Escudo de acero",
    desc: "Un escudo de alta calidad",
    statModifiers: [
      {
        stat: "defence",
        value: 4,
      },
    ],
  }
}

function createShield7(id: string): Item {
  return {
    id,
    spriteId: "shield_7",
    name: "Escudo mágico",
    desc: "Un escudo encantado",
    statModifiers: [
      {
        stat: "defence",
        value: 3,
      },
      {
        stat: "initiative",
        value: 1,
      },
    ],
    metadata: {
      magic: true,
    },
  }
}

function createWizzardHat(id: string): Item {
  return {
    id,
    spriteId: "wizzard_hat",
    name: "Sombrero de mago",
    desc: "Un sombrero que otorga sabiduría",
    statModifiers: [
      {
        stat: "initiative",
        value: 1,
      },
    ],
    metadata: {
      magic: true,
    },
  }
}

function createRedNecklace(id: string): Item {
  return {
    id,
    spriteId: "red_necklace",
    name: "Collar rojo",
    desc: "Un collar que aumenta la vitalidad",
    statModifiers: [
      {
        stat: "health",
        value: 2,
      },
      {
        stat: "totalHealth",
        value: 2,
      },
    ],
  }
}

function createIronNecklace(id: string): Item {
  return {
    id,
    spriteId: "iron_necklace",
    name: "Collar de hierro",
    desc: "Un collar que fortalece la defensa",
    statModifiers: [
      {
        stat: "defence",
        value: 1,
      },
    ],
  }
}

function createCrystalNecklace(id: string): Item {
  return {
    id,
    spriteId: "crystal_necklace",
    name: "Collar de cristal",
    desc: "Un collar que mejora la puntería",
    statModifiers: [
      {
        stat: "aim",
        value: 2,
      },
    ],
  }
}

function createWoodNecklace(id: string): Item {
  return {
    id,
    spriteId: "wood_necklace",
    name: "Collar de madera",
    desc: "Un collar que acelera la iniciativa",
    statModifiers: [
      {
        stat: "initiative",
        value: 2,
      },
    ],
  }
}

function createSacredNecklace(id: string): Item {
  return {
    id,
    spriteId: "sacred_necklace",
    name: "Collar sagrado",
    desc: "Un collar bendito",
    statModifiers: [
      {
        stat: "defence",
        value: 2,
      },
      {
        stat: "health",
        value: 1,
      },
    ],
    metadata: {
      magic: true,
    },
  }
}

function createDamnedNecklace(id: string): Item {
  return {
    id,
    spriteId: "damned_necklace",
    name: "Collar maldito",
    desc: "Un collar oscuro",
    statModifiers: [
      {
        stat: "attack",
        value: 3,
      },
      {
        stat: "defence",
        value: -1,
      },
    ],
    metadata: {
      magic: true,
    },
  }
}

function createParchment(id: string): Item {
  return {
    id,
    spriteId: "parchment",
    name: "Pergamino",
    desc: "Un pergamino antiguo",
    // Quest item, no stat modifiers
  }
}

function createCoin(id: string): Item {
  return {
    id,
    spriteId: "coin",
    name: "Moneda",
    desc: "Una moneda de oro",
    // Currency, no stat modifiers
  }
}

function createCoins1(id: string): Item {
  return {
    id,
    spriteId: "coins_1",
    name: "Monedas",
    desc: "Un puñado de monedas",
    // Currency, no stat modifiers
  }
}

function createCoins2(id: string): Item {
  return {
    id,
    spriteId: "coins_2",
    name: "Más monedas",
    desc: "Varias monedas",
    // Currency, no stat modifiers
  }
}

function createCoinsBag(id: string): Item {
  return {
    id,
    spriteId: "coins_bag",
    name: "Bolsa de monedas",
    desc: "Una bolsa llena de monedas",
    // Currency, no stat modifiers
  }
}

function createCheese(id: string): Item {
  return {
    id,
    spriteId: "cheese",
    name: "Queso",
    desc: "Un trozo de queso",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 2
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemById(character, item.id)
        await playAnimation("health", character.position)
      },
    },
  }
}

function createBread(id: string): Item {
  return {
    id,
    spriteId: "bread",
    name: "Pan",
    desc: "Una hogaza de pan",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 3
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemById(character, item.id)
        await playAnimation("health", character.position)
      },
    },
  }
}

function createApple(id: string): Item {
  return {
    id,
    spriteId: "apple",
    name: "Manzana",
    desc: "Una manzana fresca",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 1
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemById(character, item.id)
        await playAnimation("health", character.position)
      },
    },
  }
}

function createWine(id: string): Item {
  return {
    id,
    spriteId: "wine",
    name: "Vino",
    desc: "Una botella de vino",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 2
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemById(character, item.id)
        await playAnimation("health", character.position)
      },
    },
  }
}

function createWater(id: string): Item {
  return {
    id,
    spriteId: "water",
    name: "Agua",
    desc: "Una botella de agua",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 1
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemById(character, item.id)
        await playAnimation("health", character.position)
      },
    },
  }
}

function createBrassKey(id: string): Item {
  return {
    id,
    spriteId: "brass_key",
    name: "Llave de latón",
    desc: "Una llave de latón",
    // Key item, no stat modifiers
  }
}

function createIronKey(id: string): Item {
  return {
    id,
    spriteId: "iron_key",
    name: "Llave de hierro",
    desc: "Una llave de hierro",
    // Key item, no stat modifiers
  }
}

function createSilverKey(id: string): Item {
  return {
    id,
    spriteId: "silver_key",
    name: "Llave de plata",
    desc: "Una llave de plata",
    // Key item, no stat modifiers
  }
}

function createRustyKey(id: string): Item {
  return {
    id,
    spriteId: "rusty_key",
    name: "Llave oxidada",
    desc: "Una llave vieja y oxidada",
    // Key item, no stat modifiers
  }
}

function createLifePotion(id: string): Item {
  return {
    id,
    spriteId: "potion_red",
    name: "Poción de vida",
    desc: "Genial para la resaca",
    metadata: {
      uses: 1,
    },
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
