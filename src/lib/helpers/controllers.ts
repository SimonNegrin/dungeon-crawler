import type { IPlayerConnection } from "../types"

const connections = new Map<string, IPlayerConnection>()

export function playerConnect(playerId: string): void {}

export function playerAccept(playerId: string): void {}

export function playerReady(playerId: string): void {}
