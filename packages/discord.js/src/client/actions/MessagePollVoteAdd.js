'use strict';

const Action = require('./Action');
const Events = require('../../util/Events');

class MessagePollVoteAddAction extends Action {
  handle(data) {
    const channel = this.getChannel(data);
    if (!channel?.isTextBased()) return false;

    const message = this.getMessage(data, channel);
    if (!message) return false;

    const poll = this.getPoll(data, message, channel);
    if (!poll) return false;

    const answer = poll.answers.get(data.answer_id);
    if (!answer) return false;

    const user = this.getUser(data);

    answer.voters._add(user);
    answer.voteCount++;

    /**
     * Emitted whenever a user votes in a poll.
     * @event Client#messagePollVoteAdd
     * @param {PollAnswer} pollAnswer The answer that was voted on
     * @param {Snowflake} userId The id of the user that voted
     */
    this.client.emit(Events.MessagePollVoteAdd, answer, data.user_id);

    return { poll };
  }
}

module.exports = MessagePollVoteAddAction;
