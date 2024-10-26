/* eslint-disable jsdoc/check-param-names */

import type { RequestData, REST } from '@discordjs/rest';
import {
	Routes,
	type RESTGetAPIStickerPackResult,
	type RESTGetAPIStickerResult,
	type RESTGetStickerPacksResult,
	type Snowflake,
} from 'discord-api-types/v10';

export class StickersAPI {
	public constructor(private readonly rest: REST) {}

	/**
	 * Fetches a sticker pack
	 *
	 * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack}
	 * @param packId - The id of the sticker pack
	 * @param options - The options for fetching the sticker pack
	 */
	public async getStickerPack(packId: Snowflake, { signal }: Pick<RequestData, 'signal'> = {}) {
		return this.rest.get(Routes.stickerPack(packId), { signal }) as Promise<RESTGetAPIStickerPackResult>;
	}

	/**
	 * Fetches all of the sticker packs
	 *
	 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
	 * @param options - The options for fetching the sticker packs
	 */
	public async getStickers({ signal }: Pick<RequestData, 'signal'> = {}) {
		return this.rest.get(Routes.stickerPacks(), { signal }) as Promise<RESTGetStickerPacksResult>;
	}

	/**
	 * Fetches all of the sticker packs
	 *
	 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
	 * @param options - The options for fetching the sticker packs
	 * @deprecated Use {@link StickersAPI.getStickers} instead.
	 */
	public async getNitroStickers(options: Pick<RequestData, 'signal'> = {}) {
		return this.getStickers(options);
	}

	/**
	 * Fetches a sticker
	 *
	 * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
	 * @param stickerId - The id of the sticker
	 * @param options - The options for fetching the sticker
	 */
	public async get(stickerId: Snowflake, { signal }: Pick<RequestData, 'signal'> = {}) {
		return this.rest.get(Routes.sticker(stickerId), { signal }) as Promise<RESTGetAPIStickerResult>;
	}
}
