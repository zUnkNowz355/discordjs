const Action = require('./Action');
const Constants = require('../../util/Constants');
const Message = require('../../structures/Message');

class MessageUpdateAction extends Action {
  handle(data) {
    const client = this.client;

    const channel = client.channels.get(data.channel_id);
    if (channel) {
      const message = channel.messages.get(data.id);
      if (message) {
        message.patch(data);
        client.emit(Constants.Events.MESSAGE_UPDATE, message._edits[0], message);
        return {
          old: message._edits[0],
          updated: message,
        };
      }

      const { autofetch } = client.options;
      if (autofetch && autofetch.includes(Constants.WSEvents.MESSAGE_UPDATE)) {
        if (data.author) {
          const newMessage = channel._cacheMessage(new Message(channel, data, client));
          client.emit(Constants.Events.MESSAGE_UPDATE, null, newMessage);
          return {
            old: null,
            updated: newMessage,
          };
        } else {
          channel.fetchMessage(data.id).then(fetchedMessage => {
            client.emit(Constants.Events.MESSAGE_UPDATE, null, fetchedMessage);
          }).catch(() => this.client.emit('debug', 'Could not fetch message'));
        }
      }
    }

    return {
      old: null,
      updated: null,
    };
  }
}

/**
 * Emitted whenever a message is updated - e.g. embed or content change.
 * @event Client#messageUpdate
 * @param {Message} oldMessage The message before the update
 * @param {Message} newMessage The message after the update
 */

module.exports = MessageUpdateAction;
