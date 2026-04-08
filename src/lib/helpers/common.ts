import { waitTime } from "../common"
import { gameState } from "../state.svelte"
import type { StatType, Character, Actor, GameState, ActorType } from "../types"
import Vec2 from "../Vec2"
import { monsterDeathSound } from "./audio"

export function getRandomFromArray<T>(items: T[]): T {
  const index = Math.floor(items.length * Math.random())
  return items[index]
}

export function calcStat(stat: StatType, character: Character): number {
  let value = character.stats[stat]
  ;[...character.traits, ...character.items].forEach((item) => {
    item.statModifiers?.forEach((item) => {
      if (item.stat === stat) {
        value += item.value
      }
    })
  })
  return value
}

export function createDice(faces: number): () => number {
  return () => {
    return 1 + Math.floor(faces * Math.random())
  }
}

export async function killActor(actor: Actor): Promise<void> {
  actor.isAlive = false

  // switch (actor.type) {
  //   case "monster":
  //     gameState.monsters = gameState.monsters.filter((m) => {
  //       return m !== actor
  //     })
  //     monsterDeathSound()
  //     break
  //   case "player":
  //     gameState.players = gameState.players.filter((m) => {
  //       return m !== actor
  //     })
  //     monsterDeathSound()
  //     break
  //   }

  monsterDeathSound()
  await waitTime(1000)
}

export function getRectAdjacents(pos: Vec2): Vec2[] {
  return [
    pos.add(new Vec2(0, -1)), // left
    pos.add(new Vec2(0, 1)), // right
    pos.add(new Vec2(-1, 0)), // up
    pos.add(new Vec2(1, 0)), // down
  ]
}

export function getAllActors(): Actor[] {
  return [...gameState.players, ...gameState.monsters]
}

export function getActorAtPosition(pos: Vec2): Actor | undefined {
  return getAllActors().find((character) => character.position.isEqual(pos))
}

export function getAdjacentActors(pos: Vec2, actorType?: ActorType): Actor[] {
  const rectAdjacents = getRectAdjacents(pos)
  const actors: Actor[] = []
  rectAdjacents.forEach((adjacent) => {
    const actor = getActorAtPosition(adjacent)
    if (actor && (!actorType || actor.type === actorType)) {
      actors.push(actor)
    }
  })
  return actors
}
