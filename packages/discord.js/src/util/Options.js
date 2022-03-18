'use strict';

const process = require('node:process');
const { DefaultRestOptions } = require('@discordjs/rest');
const Transformers = require('./Transformers');

/**
 * @typedef {Function} CacheFactory
 * @param {Function} manager The manager class the cache is being requested from.
 * @param {Function} holds The class that the cache will hold.
 * @returns {Collection} A Collection used to store the cache of the manager.
 */

/**
 * Options for a client.
 * @typedef {Object} ClientOptions
 * @property {number|number[]|string} [shards] The shard's id to run, or an array of shard ids. If not specified,
 * the client will spawn {@link ClientOptions#shardCount} shards. If set to `auto`, it will fetch the
 * recommended amount of shards from Discord and spawn that amount
 * @property {number} [shardCount=1] The total amount of shards used by all processes of this bot
 * (e.g. recommended shard count, shard count of the ShardingManager)
 * @property {CacheFactory} [makeCache] Function to create a cache.
 * You can use your own function, or the {@link Options} class to customize the Collection used for the cache.
 * <warn>Overriding the cache used in `GuildManager`, `ChannelManager`, `GuildChannelManager`, `RoleManager`,
 * and `PermissionOverwriteManager` is unsupported and **will** break functionality</warn>
 * @property {MessageMentionOptions} [allowedMentions] Default value for {@link MessageOptions#allowedMentions}
 * @property {Partials[]} [partials] Structures allowed to be partial. This means events can be emitted even when
 * they're missing all the data for a particular structure. See the "Partial Structures" topic on the
 * [guide](https://discordjs.guide/popular-topics/partials.html) for some
 * important usage information, as partials require you to put checks in place when handling data.
 * @property {boolean} [failIfNotExists=true] Default value for {@link ReplyMessageOptions#failIfNotExists}
 * @property {PresenceData} [presence={}] Presence data to use upon login
 * @property {IntentsResolvable} intents Intents to enable for this connection
 * @property {number} [waitGuildTimeout=15_000] Time in milliseconds that Clients with the GUILDS intent should wait for
 * missing guilds to be received before starting the bot. If not specified, the default is 15 seconds.
 * @property {SweeperOptions} [sweepers={}] Options for cache sweeping
 * @property {WebsocketOptions} [ws] Options for the WebSocket
 * @property {RESTOptions} [rest] Options for the REST manager
 * @property {Function} [jsonTransformer] A function used to transform outgoing json data
 */

/**
 * Options for {@link Sweepers} defining the behavior of cache sweeping
 * @typedef {Object<SweeperKey, SweepOptions>} SweeperOptions
 */

/**
 * Options for sweeping a single type of item from cache
 * @typedef {Object} SweepOptions
 * @property {number} interval The interval (in seconds) at which to perform sweeping of the item
 * @property {number} [lifetime] How long an item should stay in cache until it is considered sweepable.
 * <warn>This property is only valid for the `invites`, `messages`, and `threads` keys. The `filter` property
 * is mutually exclusive to this property and takes priority</warn>
 * @property {GlobalSweepFilter} filter The function used to determine the function passed to the sweep method
 * <info>This property is optional when the key is `invites`, `messages`, or `threads` and `lifetime` is set</info>
 */

/**
 * WebSocket options (these are left as snake_case to match the API)
 * @typedef {Object} WebsocketOptions
 * @property {number} [large_threshold=50] Number of members in a guild after which offline users will no longer be
 * sent in the initial guild member list, must be between 50 and 250
 */

/**
 * Contains various utilities for client options.
 */
class Options extends null {
  /**
   * The default client options.
   * @returns {ClientOptions}
   */
  static createDefault() {
    return {
      waitGuildTimeout: 15_000,
      shardCount: 1,
      makeCache: this.cacheWithLimits(this.defaultMakeCacheSettings),
      partials: [],
      failIfNotExists: true,
      presence: {},
      sweepers: this.defaultSweeperSettings,
      ws: {
        large_threshold: 50,
        compress: false,
        properties: {
          $os: process.platform,
          $browser: 'discord.js',
          $device: 'discord.js',
        },
        version: 10,
      },
      rest: DefaultRestOptions,
      jsonTransformer: Transformers.toSnakeCase,
    };
  }

  /**
   * Create a cache factory using predefined settings to sweep or limit.
   * @param {Object<string, LimitedCollectionOptions|number>} [settings={}] Settings passed to the relevant constructor.
   * If no setting is provided for a manager, it uses Collection.
   * If a number is provided for a manager, it uses that number as the max size for a LimitedCollection.
   * If LimitedCollectionOptions are provided for a manager, it uses those settings to form a LimitedCollection.
   * @returns {CacheFactory}
   * @example
   * // Store up to 200 messages per channel and 200 members per guild, always keeping the client member.
   * Options.cacheWithLimits({
   *    MessageManager: 200,
   *    GuildMemberManager: {
   *      maxSize: 200,
   *      keepOverLimit: (member) => member.id === client.user.id,
   *    },
   *  });
   */
  static cacheWithLimits(settings = {}) {
    const { Collection } = require('@discordjs/collection');
    const LimitedCollection = require('./LimitedCollection');

    return manager => {
      const setting = settings[manager.name];
      /* eslint-disable-next-line eqeqeq */
      if (setting == null) {
        return new Collection();
      }
      if (typeof setting === 'number') {
        if (setting === Infinity) {
          return new Collection();
        }
        return new LimitedCollection({ maxSize: setting });
      }
      /* eslint-disable-next-line eqeqeq */
      const noLimit = setting.maxSize == null || setting.maxSize === Infinity;
      if (noLimit) {
        return new Collection();
      }
      return new LimitedCollection(setting);
    };
  }

  /**
   * Create a cache factory that always caches everything.
   * @returns {CacheFactory}
   */
  static cacheEverything() {
    const { Collection } = require('@discordjs/collection');
    return () => new Collection();
  }

  /**
   * The default settings passed to {@link Options.cacheWithLimits}.
   * The caches that this changes are:
   * * `MessageManager` - Limit to 200 messages
   * * `ChannelManager` - Sweep archived threads
   * * `GuildChannelManager` - Sweep archived threads
   * * `ThreadManager` - Sweep archived threads
   * <info>If you want to keep default behavior and add on top of it you can use this object and add on to it, e.g.
   * `makeCache: Options.cacheWithLimits({ ...Options.defaultMakeCacheSettings, ReactionManager: 0 })`</info>
   * @type {Object<string, LimitedCollectionOptions|number>}
   */
  static get defaultMakeCacheSettings() {
    return {
      MessageManager: 200,
    };
  }
}

/**
 * The default settings passed to {@link Options.sweepers} (for v14).
 * The sweepers that this changes are:
 * * `threads` - Sweep archived threads every hour, removing those archived more than 4 hours ago
 * <info>If you want to keep default behavior and add on top of it you can use this object and add on to it, e.g.
 * `sweepers: { ...Options.defaultSweeperSettings, messages: { interval: 300, lifetime: 600 } })`</info>
 * @type {SweeperOptions}
 */
Options.defaultSweeperSettings = {
  threads: {
    interval: 3600,
    lifetime: 14400,
  },
};

module.exports = Options;

/**
 * @external RESTOptions
 * @see {@link https://discord.js.org/#/docs/rest/main/typedef/RESTOptions}
 */
