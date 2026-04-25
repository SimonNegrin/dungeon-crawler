import {
  tiredSound,
  doorUnlockSound,
  doorLockedSound,
  walkSound,
  maleHurtSound,
  femaleHurtSound,
} from "./audio"
import {
  getTileTypeAt,
  removeItemByName,
  waitTime,
  STEP_TIME,
  createAttackPlan,
  TIME_AFTER_ATTACK,
  SHOOT_DISTANCE,
  createVisionSystem,
  PLAYER_DEFAULT_HEATH,
} from "./common"
import { gameState } from "../state.svelte"
import { clearFogAt } from "./fog"
import {
  getAliveActorAtPosition,
  getRectAdjacentActors,
  getCharacterPathTo,
  isActorAtPositon,
} from "./stage"
import type { CharacterStats, IPlayer, PlayerGenre } from "../types"
import { projectileTo, combat, physicAttack } from "./combat"
import Vec2 from "../Vec2"
import type { RogueName } from "../sprites/SpriteRogue.svelte"

export async function currentPlayerAction(): Promise<void> {
  if (gameState.ignoreInput) {
    return
  }
  gameState.ignoreInput = true
  await executePlayerAction()
  gameState.ignoreInput = false
}

async function executePlayerAction(): Promise<void> {
  if (await interactPlayer()) {
    return
  }

  if (await interactChest()) {
    return
  }

  if (await interactDoor()) {
    return
  }

  await playerMove()
}

async function interactPlayer(): Promise<boolean> {
  const currentPlayer = gameState.currentPlayer!

  const player = gameState.players.find((player) => {
    return player.actor.position.isEqual(gameState.cursorPosition)
  })

  if (!player) {
    return false
  }

  if (!currentPlayer.actor.position.isRectAdjacent(player.actor.position)) {
    return false
  }

  // Check if the player has the initiative needed
  // to interact with a chest
  if (currentPlayer.actor.currentStats.actions <= 0) {
    tiredSound()
    return true
  }

  currentPlayer.actor.currentStats.actions--
  gameState.openInventory = player.actor

  return true
}

async function interactChest(): Promise<boolean> {
  const currentPlayer = gameState.currentPlayer!
  const chest = getTileTypeAt("chest", gameState.cursorPosition)

  if (!chest) {
    return false
  }

  if (!currentPlayer.actor.position.isRectAdjacent(chest.position)) {
    return false
  }

  // Check if the player has the initiative needed
  // to interact with a chest
  if (currentPlayer.actor.currentStats.actions <= 0) {
    tiredSound()
    return true
  }

  currentPlayer.actor.currentStats.actions--
  gameState.openInventory = chest.attributes

  return true
}

async function interactDoor(): Promise<boolean> {
  const currentPlayer = gameState.currentPlayer!

  const door = getTileTypeAt("door", gameState.cursorPosition)

  if (!door) {
    return false
  }

  // If door is open no interation is needed
  if (door.attributes.isOpen) {
    return false
  }

  // To interact is needed to be rect adjacent
  if (!currentPlayer.actor.position.isRectAdjacent(door.position)) {
    return false
  }

  // If the door does not need key we open the door inmediatly
  if (!door.attributes.keyName) {
    if (currentPlayer.actor.currentStats.actions > 0) {
      currentPlayer.actor.currentStats.actions--
      door.attributes.isOpen = true
      doorUnlockSound()
    } else {
      tiredSound()
    }
    return true
  }

  // To open the door the player needs the key
  const { keyName } = door.attributes
  if (currentPlayer.actor.items.some((item) => item.name === keyName)) {
    if (currentPlayer.actor.currentStats.actions > 0) {
      // Open the door with key
      door.attributes.isOpen = true
      // Remove key from player inventory
      removeItemByName(currentPlayer.actor, keyName)
      gameState.currentPlayer!.actor.currentStats.actions--
      doorUnlockSound()
    } else {
      tiredSound()
    }
    return true
  }

  // The player can't open the door but we return true
  // to indicate the interaction try
  doorLockedSound()
  return true
}

async function playerMove(): Promise<boolean> {
  if (!gameState.stage) {
    return false
  }

  const player = gameState.currentPlayer!

  if (isActorAtPositon(gameState.cursorPosition)) {
    return false
  }

  const path = await getCharacterPathTo(player.actor, gameState.cursorPosition)

  if (!path) {
    return false
  }

  await walkTo(player.actor, path.slice(1))

  return true
}

async function walkTo(player: IPlayer, path: Vec2[]): Promise<void> {
  for (const step of path) {
    // Check if the player has the initiative needed to walk
    if (player.currentStats.movement <= 0) {
      tiredSound()
      break
    }
    player.currentStats.movement--

    // If the player current position is rect adjacent to a monster
    // the monster has an oportunity to attack the player
    const adjacentMonsters = getRectAdjacentActors(player.position, "monster")
    for (const adjacentMonster of adjacentMonsters) {
      await physicAttack(adjacentMonster, player)
      await waitTime(TIME_AFTER_ATTACK)
    }

    if (!player.isAlive) {
      break
    }

    player.position = step
    clearFogAt(step)
    await waitTime(STEP_TIME)
    walkSound()
    gameState.cursorPath = gameState.cursorPath.slice(1)
  }
}

export async function attackMonster(): Promise<boolean> {
  const player = gameState.currentPlayer!

  // Check if the player has actions to attack
  if (player.actor.currentStats.actions <= 0) {
    return false
  }

  const monster = getAliveActorAtPosition(gameState.cursorPosition)

  if (!monster?.isAlive || monster.type !== "monster") {
    return false
  }

  const attackPlan = await createAttackPlan(player.actor, monster)

  if (!attackPlan) {
    return false
  }

  await walkTo(player.actor, attackPlan.path)

  if (player.actor.currentStats.actions <= 0) {
    tiredSound()
    return false
  }

  player.actor.currentStats.actions--
  await combat(player.actor, monster)
  return true
}

export async function shootMonster(): Promise<boolean> {
  const player = gameState.currentPlayer!

  // Check if the player have the ability of shoot arrows
  if (player.actor.currentStats.aim <= 0) {
    return false
  }

  const monster = getAliveActorAtPosition(gameState.cursorPosition)

  if (monster?.type !== "monster") {
    return false
  }

  // Check if the player has actions to shoot
  if (player.actor.currentStats.actions <= 0) {
    tiredSound()
    return false
  }

  // Check if the monster is near enough to shoot
  if (monster.position.distanceTo(player.actor.position) > SHOOT_DISTANCE) {
    return false
  }

  // Check if we have line of sight
  const visionSystem = createVisionSystem()
  if (
    !visionSystem.hasLineOfSight(
      player.actor.position.x,
      player.actor.position.y,
      monster.position.x,
      monster.position.y,
    )
  ) {
    return false
  }

  player.actor.currentStats.actions--

  // Shoot monster
  await projectileTo({
    id: Symbol(),
    from: player.actor,
    target: monster,
    type: "arrow",
  })

  return true
}

export async function magickAttack(): Promise<boolean> {
  const player = gameState.currentPlayer!

  // Check if the player have magic ability
  if (player.actor.currentStats.magic <= 0) {
    return false
  }

  const monster = getAliveActorAtPosition(gameState.cursorPosition)

  if (monster?.type !== "monster") {
    return false
  }

  // Check if the player has actions to do magic
  if (player.actor.currentStats.actions <= 0) {
    tiredSound()
    return false
  }

  // Check if the monster is near enough to shoot
  if (monster.position.distanceTo(player.actor.position) > SHOOT_DISTANCE) {
    return false
  }

  // Check if we have line of sight
  const visionSystem = createVisionSystem()
  if (
    !visionSystem.hasLineOfSight(
      player.actor.position.x,
      player.actor.position.y,
      monster.position.x,
      monster.position.y,
    )
  ) {
    return false
  }

  player.actor.currentStats.actions--

  await projectileTo({
    id: Symbol(),
    from: player.actor,
    target: monster,
    type: "fireball",
  })

  return true
}

export function createPlayerActor(
  playerId: string,
  sprite: RogueName,
  genre: PlayerGenre,
): IPlayer {
  const hurtSound = genre === "male" ? maleHurtSound : femaleHurtSound
  const stats: CharacterStats = {
    attack: 0,
    aim: 0,
    magic: 0,
    defence: 0,
    movement: 0,
    actions: 0,
    health: PLAYER_DEFAULT_HEATH,
  }
  return {
    id: playerId,
    type: "player",
    sprite: sprite,
    isAlive: true,
    name: "",
    position: new Vec2(0, 0),
    offset: new Vec2(0, 0),
    sounds: {
      hurt: hurtSound,
      death: hurtSound,
    },
    baseStats: { ...stats },
    totalStats: { ...stats },
    currentStats: { ...stats },
    traits: [],
    items: [],
  }
}
