import { BaseRedisBroker } from './BaseRedis';
import type { IPubSubBroker } from '../Broker.interface';

export class PubSubRedisBroker<TEvents extends Record<string, any>>
	extends BaseRedisBroker<TEvents>
	implements IPubSubBroker<TEvents>
{
	public async publish<T extends keyof TEvents>(event: T, data: TEvents[T]): Promise<void> {
		await this.options.redisClient.xadd(
			event as string,
			'*',
			BaseRedisBroker.STREAM_DATA_KEY,
			this.options.encode(data),
		);
	}

	protected emitEvent(id: Buffer, group: string, event: string, data: unknown) {
		const payload: { data: unknown; ack: () => Promise<void> } = {
			data,
			ack: async () => {
				await this.options.redisClient.xack(event, group, id);
			},
		};

		this.emit(event, payload);
	}
}
