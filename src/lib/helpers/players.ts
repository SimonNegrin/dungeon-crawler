import {
  tiredSound,
  doorUnlockSound,
  doorLockedSound,
  walkSound,
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
} from "./common"
import { gameState } from "../state.svelte"
import { clearFogAt } from "./fog"
import {
  getActorAtPosition,
  getRectAdjacentActors,
  getCharacterPathTo,
  isActorAtPositon,
} from "./stage"
import type { Player } from "../types"
import { projectileTo, combat, physicAttack } from "./combat"
import type Vec2 from "../Vec2"

export async function currentPlayerAction(): Promise<void> {
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
  const player = gameState.players.find((player) => {
    return player.position.isEqual(gameState.cursorPosition)
  })

  if (!player) {
    return false
  }

  if (!gameState.currentPlayer.position.isRectAdjacent(player.position)) {
    return false
  }

  // Check if the player has the initiative needed
  // to interact with a chest
  if (gameState.currentPlayer.currentStats.actions <= 0) {
    tiredSound()
    return true
  }

  gameState.currentPlayer.currentStats.actions--
  gameState.openInventory = player

  return true
}

async function interactChest(): Promise<boolean> {
  const chest = getTileTypeAt("chest", gameState.cursorPosition)

  if (!chest) {
    return false
  }

  if (!gameState.currentPlayer.position.isRectAdjacent(chest.position)) {
    return false
  }

  // Check if the player has the initiative needed
  // to interact with a chest
  if (gameState.currentPlayer.currentStats.actions <= 0) {
    tiredSound()
    return true
  }

  gameState.currentPlayer.currentStats.actions--
  gameState.openInventory = chest.attributes

  return true
}

async function interactDoor(): Promise<boolean> {
  const currentPlayer = gameState.currentPlayer

  const door = getTileTypeAt("door", gameState.cursorPosition)

  if (!door) {
    return false
  }

  // If door is open no interation is needed
  if (door.attributes.isOpen) {
    return false
  }

  // To interact is needed to be rect adjacent
  if (!currentPlayer.position.isRectAdjacent(door.position)) {
    return false
  }

  // If the door does not need key we open the door inmediatly
  if (!door.attributes.keyName) {
    if (currentPlayer.currentStats.actions > 0) {
      currentPlayer.currentStats.actions--
      door.attributes.isOpen = true
      doorUnlockSound()
    } else {
      tiredSound()
    }
    return true
  }

  // To open the door the player needs the key
  const { keyName } = door.attributes
  if (currentPlayer.items.some((item) => item.name === keyName)) {
    if (currentPlayer.currentStats.actions > 0) {
      // Open the door with key
      door.attributes.isOpen = true
      // Remove key from player inventory
      removeItemByName(currentPlayer, keyName)
      gameState.currentPlayer.currentStats.actions--
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

  const player = gameState.currentPlayer

  if (isActorAtPositon(gameState.cursorPosition)) {
    return false
  }

  const path = await getCharacterPathTo(player, gameState.cursorPosition)

  if (!path) {
    return false
  }

  await walkTo(player, path.slice(1))

  return true
}

async function walkTo(player: Player, path: Vec2[]): Promise<void> {
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
  const player = gameState.currentPlayer
  const monster = getActorAtPosition(gameState.cursorPosition)

  if (!monster?.isAlive || monster.type !== "monster") {
    return false
  }

  const attackPlan = await createAttackPlan(player, monster)

  if (!attackPlan) {
    return false
  }

  await walkTo(player, attackPlan.path)

  if (player.currentStats.actions <= 0) {
    tiredSound()
    return false
  }

  player.currentStats.actions--
  await combat(player, monster)
  return true
}

export async function shootMonster(): Promise<boolean> {
  const player = gameState.currentPlayer

  // Check if the player have the ability of shoot arrows
  if (player.currentStats.aim <= 0) {
    return false
  }

  const monster = getActorAtPosition(gameState.cursorPosition)

  if (!monster?.isAlive || monster.type !== "monster") {
    return false
  }

  // Check if the player has actions to shoot
  if (player.currentStats.actions <= 0) {
    tiredSound()
    return false
  }

  // Check if the monster is near enough to shoot
  if (monster.position.distanceTo(player.position) > SHOOT_DISTANCE) {
    return false
  }

  // Check if we have line of sight
  const visionSystem = createVisionSystem()
  if (
    !visionSystem.hasLineOfSight(
      player.position.x,
      player.position.y,
      monster.position.x,
      monster.position.y,
    )
  ) {
    return false
  }

  player.currentStats.actions--

  // Shoot monster
  await projectileTo(player, monster)

  return true
}
