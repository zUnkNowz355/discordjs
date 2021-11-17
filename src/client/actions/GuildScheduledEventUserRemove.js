'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class GuildScheduledEventUserRemoveAction extends Action {
  handle(data) {
    const client = this.client;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      const guildScheduledEvent = guild.scheduledEvents.cache.get(data.guild_scheduled_event_id);
      const user = client.users.cache.get(data.user_id);

      /**
       * Emitted whenever a user unsubscribes from a guild scheduled event
       * @event Client#guildScheduledEventUserRemove
       * @param {GuildScheduledEvent} guildScheduledEvent The guild scheduled event
       * @param {User} user user who unsubscribed
       */
      client.emit(Events.GUILD_SCHEDULED_EVENT_USER_REMOVE, guildScheduledEvent, user);

      return { guildScheduledEvent, user };
    }

    return {};
  }
}

module.exports = GuildScheduledEventUserRemoveAction;
