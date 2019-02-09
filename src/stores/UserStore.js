'use strict';

const DataStore = require('./DataStore');
const User = require('../structures/User');
const GuildMember = require('../structures/GuildMember');
const Message = require('../structures/Message');

/**
 * A data store to store User models.
 * @extends {DataStore}
 */
class UserStore extends DataStore {
  constructor(client, iterable) {
    super(client, iterable, User);
  }

  /**
   * Data that resolves to give a User object. This can be:
   * * A User object
   * * A Snowflake
   * * A Message object (resolves to the message author)
   * * A GuildMember object
   * @typedef {User|Snowflake|Message|GuildMember} UserResolvable
   */

  /**
   * Resolves a UserResolvable to a User object.
   * @param {UserResolvable} user The UserResolvable to identify
   * @returns {?User}
   */
  resolve(user) {
    if (user instanceof GuildMember) return user.user;
    if (user instanceof Message) return user.author;
    return super.resolve(user);
  }

  /**
   * Resolves a UserResolvable to a user ID string.
   * @param {UserResolvable} user The UserResolvable to identify
   * @returns {?Snowflake}
   */
  resolveID(user) {
    if (user instanceof GuildMember) return user.user.id;
    if (user instanceof Message) return user.author.id;
    return super.resolveID(user);
  }

  /**
   * Obtains a user from Discord, or the user cache if it's already available.
   * @param {Snowflake} id ID of the user
   * @param {boolean} [cache=true] Whether to cache the new user object if it isn't already
   * @param {boolean} [overwrite=false] Whether to overwrite any existing user instances
   * @returns {Promise<User>}
   */
  async fetch(id, cache = true, overwrite = false) {
    const existing = this.get(id);
    if (existing && !overwrite) return existing;
    const data = await this.client.api.users(id).get();
    if (existing) existing._patch(data);
    return this.add(data, cache);
  }
}

module.exports = UserStore;
