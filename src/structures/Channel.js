const Snowflake = require('../util/Snowflake');
const Constants = require('../util/Constants');

/**
 * Represents any channel on Discord.
 */
class Channel {
  constructor(client, data) {
    /**
     * The client that instantiated the Channel
     * @name Channel#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The type of the channel, either:
     * * `dm` - a DM channel
     * * `group` - a Group DM channel
     * * `text` - a guild text channel
     * * `voice` - a guild voice channel
     * * `unknown` - a generic channel of unknown type, could be Channel or GuildChannel
     * @type {string}
     */
    this.type = Object.keys(Constants.ChannelTypes)[data.type] || 'unknown';

    if (data) this.setup(data);
  }

  setup(data) {
    /**
     * The unique ID of the channel
     * @type {Snowflake}
     */
    this.id = data.id;
  }

  /**
   * The timestamp the channel was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return Snowflake.deconstruct(this.id).timestamp;
  }

  /**
   * The time the channel was created
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * Deletes this channel.
   * @returns {Promise<Channel>}
   * @example
   * // Delete the channel
   * channel.delete()
   *  .then() // Success
   *  .catch(console.error); // Log error
   */
  delete() {
    return this.client.api.channels(this.id).delete().then(() => this);
  }

  static create(client, data, guild) {
    const DMChannel = require('./DMCHannel');
    const GroupDMChannel = require('./GroupDMChannel');
    const TextChannel = require('./TextChannel');
    const VoiceChannel = require('./VoiceChannel');
    const GuildChannel = require('./GuildChannel');
    let channel;
    if (data.type === Constants.ChannelTypes.DM) {
      channel = new DMChannel(client, data);
    } else if (data.type === Constants.ChannelTypes.GROUP_DM) {
      channel = new GroupDMChannel(client, data);
    } else {
      guild = guild || client.guilds.get(data.guild_id);
      if (guild) {
        const types = Constants.ChannelTypes;
        switch (data.type) {
          case types.text:
            channel = new TextChannel(guild, data);
            break;
          case types.voice:
            channel = new VoiceChannel(guild, data);
            break;
          default:
            channel = new GuildChannel(guild, data);
        }
        guild.channels.set(channel.id, channel);
      }
    }
    return channel;
  }
}

module.exports = Channel;
