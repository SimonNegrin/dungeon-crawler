import { gameState, loadStage } from "../state.svelte"
import type { IGamepadState, IPlayerConnection, IPlayerPreset } from "../types"
import { playerReadySound } from "./audio"
import { setBaseStat } from "./common"
import {
  moveCursorDown,
  moveCursorLeft,
  moveCursorRight,
  moveCursorUp,
} from "./cursor"
import { nextPlayer } from "./game"
import {
  attackMonster,
  currentPlayerAction,
  magickAttack,
  shootMonster,
} from "./players"

type PktHandler = (pkt: Uint8Array) => void

export const PKT_GAMEPAD_STATE = 1
export const PKT_MENU = 2
export const PKT_PLAYER_CONFIG = 3
export const PKT_PLAYER_ACCEPT = 4
export const PKT_PLAYER_READY = 5
export const PKT_GAME_START = 6
export const PKT_ENABLE_TURN = 7
export const PKT_DISABLE_TURN = 8
export const PKT_NEXT_PLAYER = 9
export const PKT_PLAYER_HEALTH = 10
export const PKT_PLAYER_STATE_SYNC = 11

export function setupPlayerConnection(conn: IPlayerConnection): void {
  conn.channel.addEventListener("message", (event: MessageEvent) => {
    const pkt = new Uint8Array(event.data)
    const handlers: Record<number, PktHandler> = {
      [PKT_PLAYER_CONFIG]: createPlayerConfigHandler(conn),
      [PKT_PLAYER_ACCEPT]: createPlayerAcceptHandler(conn),
      [PKT_PLAYER_READY]: createPlayerReadyHandler(conn),
      [PKT_GAMEPAD_STATE]: createGamepadStateHandler(conn),
      [PKT_NEXT_PLAYER]: createNextTurnHandler(conn),
    }
    const pktType = pkt[0]
    if (!handlers[pktType]) {
      console.warn(`Unknown packet number "${pktType}"`)
    }
    handlers[pktType](pkt)
  })

  conn.channel.addEventListener("close", () => {
    conn.isConnected = false
  })
}

function createPlayerConfigHandler(conn: IPlayerConnection): PktHandler {
  return (pkt) => {
    if (conn.isWaiting || conn.isReady) {
      return
    }
    const decoder = new TextDecoder()
    const preset: IPlayerPreset = JSON.parse(decoder.decode(pkt.slice(1)))
    conn.actor.sprite = preset.sprite
    conn.actor.name = preset.name
    setBaseStat("movement", preset.movement, conn.actor)
    setBaseStat("actions", preset.actions, conn.actor)
    setBaseStat("attack", preset.attack, conn.actor)
    setBaseStat("defence", preset.defence, conn.actor)
    setBaseStat("aim", preset.aim, conn.actor)
    setBaseStat("magic", preset.magic, conn.actor)
    setBaseStat("health", preset.health, conn.actor)
  }
}

function createPlayerAcceptHandler(conn: IPlayerConnection): PktHandler {
  return () => {
    conn.isWaiting = true
  }
}

function createPlayerReadyHandler(conn: IPlayerConnection): PktHandler {
  return async () => {
    if (conn.isReady) return
    conn.isReady = true
    playerReadySound()

    // If all players are ready start the game
    if (!gameState.players.every((conn) => conn.isReady)) {
      return
    }

    // Start game
    await loadStage("stage_2")

    // Send game start pkt to all players
    const gameStartPkt = new Uint8Array([PKT_GAME_START])
    gameState.players.forEach((conn) => {
      conn.channel.send(gameStartPkt)
    })

    // Enable turn to the current player
    const enableTurnPkt = new Uint8Array([PKT_ENABLE_TURN])
    gameState.currentPlayer!.channel.send(enableTurnPkt)
  }
}

function createGamepadStateHandler(conn: IPlayerConnection): PktHandler {
  return async (pkt) => {
    // Only the current player can interact
    if (conn.playerId !== gameState.currentPlayer?.playerId) {
      return
    }
    const gamepadState = pktToGamepadState(pkt)
    if (gamepadState.joystick.right) moveCursorRight()
    if (gamepadState.joystick.left) moveCursorLeft()
    if (gamepadState.joystick.top) moveCursorUp()
    if (gamepadState.joystick.bottom) moveCursorDown()
    if (gamepadState.abtn) magickAttack()
    if (gamepadState.bbtn) attackMonster()
    if (gamepadState.cbtn) currentPlayerAction()
    if (gamepadState.dbtn) shootMonster()
  }
}

function createNextTurnHandler(_: IPlayerConnection): PktHandler {
  return async () => {
    // Disable current player turn
    let pkt = new Uint8Array([PKT_DISABLE_TURN])
    gameState.currentPlayer!.channel.send(pkt.buffer)

    await nextPlayer()

    // Enable current player turn
    pkt = new Uint8Array([PKT_ENABLE_TURN])
    gameState.currentPlayer!.channel.send(pkt.buffer)
  }
}

function pktToGamepadState(pkt: Uint8Array): IGamepadState {
  const btns = pkt[1]
  const gamepadState: IGamepadState = {
    joystick: {
      top: ((btns >> 7) & 1) === 1,
      right: ((btns >> 6) & 1) === 1,
      bottom: ((btns >> 5) & 1) === 1,
      left: ((btns >> 4) & 1) === 1,
    },
    abtn: ((btns >> 3) & 1) === 1,
    bbtn: ((btns >> 2) & 1) === 1,
    cbtn: ((btns >> 1) & 1) === 1,
    dbtn: (btns & 1) === 1,
  }
  return gamepadState
}
