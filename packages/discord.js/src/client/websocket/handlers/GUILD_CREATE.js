'use strict';

const Events = require('../../../util/Events');
const Status = require('../../../util/Status');

/**
 * @import Client from '../../Client';
 * @import { GatewayGuildCreateDispatch } from 'discord-api-types/v10';
 * @import WebSocketShard from '../WebSocketShard';
 */

/**
 * @param {Client} client The client
 * @param {GatewayGuildCreateDispatch} packet The received packet
 * @param {WebSocketShard} shard The shard that the event was received on
 */
module.exports = (client, { d: data }, shard) => {
  let guild = client.guilds.cache.get(data.id);
  if (guild) {
    if (!guild.available && !data.unavailable) {
      // A newly available guild
      guild._patch(data);

      /**
       * Emitted whenever a guild becomes available.
       * @event Client#guildAvailable
       * @param {Guild} guild The guild that became available
       */
      client.emit(Events.GuildAvailable, guild);
    }
  } else {
    // A new guild
    data.shardId = shard.id;
    guild = client.guilds._add(data);
    if (client.ws.status === Status.Ready) {
      /**
       * Emitted whenever the client joins a guild.
       * @event Client#guildCreate
       * @param {Guild} guild The created guild
       */
      client.emit(Events.GuildCreate, guild);
    }
  }
};
