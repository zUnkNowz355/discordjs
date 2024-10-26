import type { Awaitable } from '@discordjs/util';
import type { APIGatewayBotInfo } from 'discord-api-types/v10';
import type { SessionInfo, WebSocketManager, WebSocketManagerOptions } from '../../ws/WebSocketManager.js';

export interface FetchingStrategyOptions
	extends Omit<
		WebSocketManagerOptions,
		| 'buildIdentifyThrottler'
		| 'buildStrategy'
		| 'rest'
		| 'retrieveSessionInfo'
		| 'shardCount'
		| 'shardIds'
		| 'updateSessionInfo'
	> {
	readonly gatewayInformation: APIGatewayBotInfo;
	readonly shardCount: number;
}

/**
 * Strategies responsible solely for making manager information accessible
 */
export interface IContextFetchingStrategy {
	readonly options: FetchingStrategyOptions;
	retrieveSessionInfo(shardId: number): Awaitable<SessionInfo | null>;
	updateSessionInfo(shardId: number, sessionInfo: SessionInfo | null): Awaitable<void>;
	/**
	 * Resolves once the given shard should be allowed to identify
	 * This should correctly handle the signal and reject with an abort error if the operation is aborted.
	 * Other errors will cause the shard to reconnect.
	 */
	waitForIdentify(shardId: number, signal: AbortSignal): Promise<void>;
}

export async function managerToFetchingStrategyOptions(manager: WebSocketManager): Promise<FetchingStrategyOptions> {
	const {
		buildIdentifyThrottler,
		buildStrategy,
		retrieveSessionInfo,
		updateSessionInfo,
		shardCount,
		shardIds,
		rest,
		...managerOptions
	} = manager.options;

	return {
		...managerOptions,
		token: manager.token,
		gatewayInformation: await manager.fetchGatewayInformation(),
		shardCount: await manager.getShardCount(),
	};
}
