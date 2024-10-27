import { type APIInvite, type APIExtendedInvite, RouteBases } from 'discord-api-types/v10';
import { Structure } from '../Structure.js';
import { kData, kExpiresTimestamp, kCreatedTimestamp } from '../utils/symbols.js';

/**
 * Represents an invitation to a discord channel
 *
 * @typeParam Omitted - Specify the propeties that will not be stored in the raw data field as a union, implement via `DataTemplate`
 * @typeParam Extended - Whether the invite is a full extended invite
 */
export class Invite<
	Omitted extends keyof APIExtendedInvite | '' = 'created_at' | 'expires_at',
	Extended extends boolean = false,
> extends Structure<
	APIExtendedInvite,
	Omitted | (Extended extends true ? '' : Exclude<keyof APIExtendedInvite, keyof APIInvite>)
> {
	/**
	 * A regular expression that matches Discord invite links.
	 * The `code` group property is present on the `exec()` result of this expression.
	 */
	public static InvitesPattern = /discord(?:(?:app)?\.com\/invite|\.gg(?:\/invite)?)\/(?<code>[\w-]{2,255})/i;

	/**
	 * The template used for removing data from the raw data stored for each Invite
	 *
	 * @remarks This template has defaults, if you want to remove additional data and keep the defaults,
	 * use `Object.defineProperties`. To override the defaults, set this value directly.
	 */
	public static override DataTemplate: Partial<APIExtendedInvite> = {
		set created_at(_: string) {},
		set expires_at(_: string) {},
	};

	/**
	 * Optimized storage of {@link APIExtendedInvite.expires_at}
	 *
	 * @internal
	 */
	protected [kExpiresTimestamp]: number | null = null;

	/**
	 * Optimized storage of {@link APIExtendedInvite.created_at}
	 *
	 * @internal
	 */
	protected [kCreatedTimestamp]: number | null = null;

	public constructor(
		/**
		 * The raw data received from the API for the invite
		 */
		data: Omit<APIExtendedInvite, Omitted>,
	) {
		super(data);
	}

	/**
	 * {@inheritDoc Structure._patch}
	 */
	public override _patch(data: Partial<APIExtendedInvite>) {
		super._patch(data);
		return this;
	}

	/**
	 * {@inheritDoc Structure._optimizeData}
	 */
	protected override _optimizeData(data: Partial<APIExtendedInvite>) {
		this[kExpiresTimestamp] = data.expires_at ? Date.parse(data.expires_at) : this[kExpiresTimestamp] ?? null;
		this[kCreatedTimestamp] = data.created_at ? Date.parse(data.created_at) : this[kCreatedTimestamp] ?? null;
	}

	/**
	 * The code for this invite
	 */
	public get code() {
		return this[kData].code;
	}

	/**
	 * The target type (for voice channel invites)
	 */
	public get targetType() {
		return this[kData].target_type;
	}

	/**
	 * The approximate number of online members of the guild this invite is for
	 *
	 * @remarks Only available when the invite was fetched from `GET /invites/<code>` with counts
	 */
	public get presenceCount() {
		return this[kData].approximate_presence_count;
	}

	/**
	 * The approximate total number of members of the guild this invite is for
	 *
	 * @remarks Only available when the invite was fetched from `GET /invites/<code>` with counts
	 */
	public get memberCount() {
		return this[kData].approximate_member_count;
	}

	/**
	 * The timestamp this invite will expire at
	 */
	public get expiresTimestamp() {
		return (
			this[kExpiresTimestamp] ??
			(this[kCreatedTimestamp] && this.maxAge ? this[kCreatedTimestamp] + (this.maxAge as number) * 1_000 : null)
		);
	}

	/**
	 * The time the invite will expire at
	 */
	public get expiresAt() {
		const expiresTimestamp = this.expiresTimestamp;
		return expiresTimestamp ? new Date(expiresTimestamp) : null;
	}

	/**
	 * The number of times this invite has been used
	 */
	public get uses() {
		return this[kData].uses;
	}

	/**
	 * The maximum number of times this invite can be used
	 */
	public get maxUses() {
		return this[kData].max_uses;
	}

	/**
	 * The maximum age of the invite, in seconds, 0 for non-expiring
	 */
	public get maxAge() {
		return this[kData].max_age;
	}

	/**
	 * Whether this invite only grants temporary membership
	 */
	public get temporary() {
		return this[kData].temporary;
	}

	/**
	 * The timestamp this invite was created at
	 */
	public get createdTimestamp() {
		return this[kCreatedTimestamp];
	}

	/**
	 * The time the invite was created at
	 */
	public get createdAt() {
		const createdTimestamp = this.createdTimestamp;
		return createdTimestamp ? new Date(createdTimestamp) : null;
	}

	/**
	 * The URL to the invite
	 */
	public get url() {
		return `${RouteBases.invite}/${this.code}`;
	}

	/**
	 * When concatenated with a string, this automatically concatenates the invite's URL instead of the object.
	 *
	 * @returns the url
	 */
	public override toString() {
		return this.url;
	}

	/**
	 * {@inheritDoc Structure.toJSON}
	 */
	public override toJSON() {
		const clone = super.toJSON();
		if (this[kExpiresTimestamp]) {
			clone.expires_at = new Date(this[kExpiresTimestamp]).toISOString();
		}

		if (this[kCreatedTimestamp]) {
			clone.created_at = new Date(this[kCreatedTimestamp]).toISOString();
		}

		return clone;
	}

	/**
	 * {@inheritDoc Object.valueOf}
	 */
	public override valueOf() {
		return this.code ?? super.valueOf();
	}
}
