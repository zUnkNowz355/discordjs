'use strict';

/**
 * @import Client from '../../Client';
 * @import { GatewayGuildRoleUpdateDispatch } from 'discord-api-types/v10';
 */

/**
 * @param {Client} client The client
 * @param {GatewayGuildRoleUpdateDispatch} packet The received packet
 */
module.exports = (client, packet) => {
  client.actions.GuildRoleUpdate.handle(packet.d);
};
