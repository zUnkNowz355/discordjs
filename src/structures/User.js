const TextBasedChannel = require('./interface/TextBasedChannel');
const Constants = require('../util/Constants');

function defined(p) {
  return typeof p !== 'undefined';
}

/**
 * Represents a User on Discord.
 * @implements {TextBasedChannel}
 */
class User {
  constructor(client, data) {
    /**
     * The Client that created the instance of the the User.
     * @type {Client}
     */
    this.client = client;
    Object.defineProperty(this, 'client', { enumerable: false, configurable: false });

    if (data) this.setup(data);
  }

  patch(data) {
    for (const item of ['id', 'username', 'discriminator', 'game', 'avatar']) {
      if (defined(data[item])) {
        this[item] = data[item];
      }
    }
    if (defined[data.bot]) {
      this.bot = data.bot;
    } else {
      this.bot = this.bot || false;
    }
    if (defined[data.status]) {
      this.status = data.status;
    } else {
      this.status = this.status || 'offline';
    }
  }

  setup(data) {
    /**
     * The ID of the User
     * @type {string}
     */
    this.id = data.id;

    /**
     * The username of the User
     * @type {string}
     */
    this.username = data.username;

    /**
     * A discriminator based on username for the User
     * @type {string}
     */
    this.discriminator = data.discriminator;

    /**
     * The ID of the user's avatar
     * @type {string}
     */
    this.avatar = data.avatar;

    /**
     * Whether or not the User is a Bot.
     * @type {boolean}
     */
    this.bot = data.bot || this.bot;

    /**
     * The status of the user:
     *
     * * **`online`** - user is online
     * * **`offline`** - user is offline
     * * **`idle`** - user is AFK
     * @type {string}
     */
    this.status = data.status || this.status || 'offline';

    /**
     * The game that the user is playing, `null` if they aren't playing a game.
     * @type {string}
     */
    this.game = data.game;
  }

  /**
   * The time the user was created
   * @readonly
   * @type {Date}
   */
  get creationDate() {
    return new Date((this.id / 4194304) + 1420070400000);
  }

  /**
   * A link to the user's avatar (if they have one, otherwise null)
   * @type {?string}
   * @readonly
   */
  get avatarURL() {
    if (!this.avatar) return null;
    return Constants.Endpoints.avatar(this.id, this.avatar);
  }

  /**
   * Check whether the user is typing in a channel.
   * @param {ChannelResolvable} channel The channel to check in
   * @returns {boolean}
   */
  isTyping(channel) {
    channel = this.client.resolver.resolveChannel(channel);
    return channel._typing.has(this.id);
  }

  /**
   * Get the time that the user started typing.
   * @param {ChannelResolvable} channel The channel to get the time in
   * @returns {?Date}
   */
  typingSince(channel) {
    channel = this.client.resolver.resolveChannel(channel);
    return channel._typing.has(this.id) ? new Date(channel._typing.get(this.id).since) : null;
  }

  /**
   * Get the amount of time the user has been typing in a channel for (in milliseconds), or -1 if they're not typing.
   * @param {ChannelResolvable} channel The channel to get the time in
   * @returns {number}
   */
  typingDuration(channel) {
    channel = this.client.resolver.resolveChannel(channel);
    return channel._typing.has(this.id) ? channel._typing.get(this.id).elapsedTime : -1;
  }

  /**
   * Deletes a DM Channel (if one exists) between the Client and the User. Resolves with the Channel if successful.
   * @returns {Promise<DMChannel>}
   */
  deleteDM() {
    return this.client.rest.methods.deleteChannel(this);
  }

  /**
   * Checks if the user is equal to another. It compares username, ID, discriminator, status and the game being played.
   * It is recommended to compare equality by using `user.id === user2.id` unless you want to compare all properties.
   * @param {User} user The user to compare
   * @returns {boolean}
   */
  equals(user) {
    let equal = user &&
      this.id === user.id &&
      this.username === user.username &&
      this.discriminator === user.discriminator &&
      this.avatar === user.avatar &&
      this.bot === Boolean(user.bot);

    if (equal) {
      if (user.status) equal = this.status === user.status;
      if (equal && user.game) equal = this.game === user.game;
    }

    return equal;
  }

  /**
   * When concatenated with a string, this automatically concatenates the User's mention instead of the User object.
   * @returns {string}
   * @example
   * // logs: Hello from <@123456789>!
   * console.log(`Hello from ${user}!`);
   */
  toString() {
    return `<@${this.id}>`;
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  sendMessage() { return; }
  sendTTSMessage() { return; }
  sendFile() { return; }
  sendCode() { return; }
}

TextBasedChannel.applyToClass(User);

module.exports = User;
