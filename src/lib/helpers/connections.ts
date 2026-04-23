import type { IPlayerConnection, IPlayerPreset } from "../types"
import { setBaseStat } from "./common"

type PktHandler = (pkt: Uint8Array) => void

export function addPlayerConnection(conn: IPlayerConnection): void {}

export function disconnectPlayer(playerId: string): void {}

export function getPlayerConnection(conn: IPlayerConnection): void {}

export const PKT_GAMEPAD_STATE = 1
export const PKT_MENU = 2
export const PKT_PLAYER_CONFIG = 3
export const PKT_PLAYER_ACCEPT = 4
export const PKT_PLAYER_READY = 5

export function setupPlayerConnection(conn: IPlayerConnection): void {
  conn.channel.addEventListener("message", (event: MessageEvent) => {
    const pkt = new Uint8Array(event.data)
    const handlers: Record<number, PktHandler> = {
      [PKT_PLAYER_CONFIG]: createPlayerConfigHandler(conn),
      [PKT_PLAYER_ACCEPT]: createPlayerAcceptHandler(conn),
      [PKT_PLAYER_READY]: createPlayerReadyHandler(conn),
    }
    const pktType = pkt[0]
    if (!handlers[pktType]) {
      console.warn(`Unknown packet number "${pktType}"`)
    }
    handlers[pktType](pkt)
  })
}

function createPlayerConfigHandler(conn: IPlayerConnection): PktHandler {
  return (pkt) => {
    if (conn.isReady) {
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
  }
}

function createPlayerAcceptHandler(conn: IPlayerConnection): PktHandler {
  return () => {
    conn.isWaiting = true
  }
}

function createPlayerReadyHandler(conn: IPlayerConnection): PktHandler {
  return () => {
    conn.isReady = true
  }
}
