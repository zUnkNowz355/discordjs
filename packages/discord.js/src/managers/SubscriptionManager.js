'use strict';

const { Collection } = require('@discordjs/collection');
const { makeURLSearchParams } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const CachedManager = require('./CachedManager');
const { ErrorCodes, DiscordjsTypeError } = require('../errors/index');
const { Subscription } = require('../structures/Subscription');
const { resolveSKUId } = require('../util/Util');

/**
 * Manages API methods for subscriptions and stores their cache.
 * @extends {CachedManager}
 */
class SubscriptionManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Subscription, iterable);
  }

  /**
   * The cache of this manager
   * @type {Collection<Snowflake, Subscription>}
   * @name SubscriptionManager#cache
   */

  /**
   * Options used to fetch subscriptions
   * @typedef {Object} FetchSubscriptionsOptions
   * @property {number} [limit=50] The maximum number of subscriptions to fetch
   * @property {SKUResolvable} sku The SKU to fetch subscriptions for
   * @property {Snowflake} [subscriptionId] The subscription id to fetch
   * @property {UserResolvable} user The user to fetch entitlements for
   * @property {boolean} [cache=true] Whether to cache the fetched subscriptions
   * @property {Snowflake} [before] Consider only subscriptions before this subscription id
   * @property {Snowflake} [after] Consider only subscriptions after this subscription id
   * <warn>If both `before` and `after` are provided, only `before` is respected</warn>
   */

  /**
   * Fetches subscriptions for this application
   * @param {FetchSubscriptionsOptions} [options={}] Options for fetching the subscriptions
   * @returns {Promise<Collection<Snowflake, Subscription>>}
   */
  async fetch(options = {}) {
    if (typeof options !== 'object') throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options', 'object', true);

    const { limit = 50, sku, subscriptionId, user, cache = true, before, after } = options;

    const skuId = resolveSKUId(sku);

    if (!skuId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'sku', 'SKUResolvable');

    if (subscriptionId) {
      const subscription = await this.client.rest.get(Routes.skuSubscription(skuId, subscriptionId));

      return this._add(subscription, cache);
    }

    const query = makeURLSearchParams({
      limit,
      user_id: this.client.users.resolveId(user) ?? undefined,
      sku_id: skuId,
      before,
      after,
    });

    const subscriptions = await this.client.rest.get(Routes.skuSubscriptions(skuId), { query });

    return subscriptions.reduce(
      (coll, subscription) => coll.set(subscription.id, this._add(subscription, cache)),
      new Collection(),
    );
  }
}

exports.SubscriptionManager = SubscriptionManager;
