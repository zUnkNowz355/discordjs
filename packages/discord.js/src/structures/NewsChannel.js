'use strict';

const { Routes } = require('discord-api-types/v10');
const BaseGuildTextChannel = require('./BaseGuildTextChannel');
const { Error, ErrorCodes } = require('../errors');

/**
 * Represents a guild news channel on Discord.
 * @extends {BaseGuildTextChannel}
 */
class NewsChannel extends BaseGuildTextChannel {
  /**
   * Adds the target to this channel's followers.
   * @param {TextChannelResolvable} channel The channel where the webhook should be created
   * @param {string} [reason] Reason for creating the webhook
   * @returns {Promise<Snowflake>} Returns created target webhook id.
   * @example
   * if (channel.type === ChannelType.GuildNews) {
   *   channel.addFollower('222197033908436994', 'Important announcements')
   *     .then(() => console.log('Added follower'))
   *     .catch(console.error);
   * }
   */
  async addFollower(channel, reason) {
    const channelId = this.guild.channels.resolveId(channel);
    if (!channelId) throw new Error(ErrorCodes.GuildChannelResolve);
    const { webhook_id } = await this.client.rest.post(Routes.channelFollowers(this.id), {
      body: { webhook_channel_id: channelId },
      reason,
    });
    return webhook_id;
  }
}

module.exports = NewsChannel;
