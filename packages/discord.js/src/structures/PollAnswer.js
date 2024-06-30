'use strict';

const Base = require('./Base');
const { Emoji } = require('./Emoji');
const PollAnswerVoterManager = require('../managers/PollAnswerVoterManager');

/**
 * Represents an answer to a {@link Poll}
 * @extends {Base}
 */
class PollAnswer extends Base {
  constructor(client, data, poll) {
    super(client);

    /**
     * The {@link Poll} this answer is part of
     * @name PollAnswer#poll
     * @type {Poll|PartialPoll}
     * @readonly
     */
    Object.defineProperty(this, 'poll', { value: poll });

    /**
     * The id of this answer
     * @type {number}
     */
    this.id = data.answer_id;

    /**
     * The text of this answer
     * @type {?string}
     */
    this.text = data.poll_media?.text ?? null;

    /**
     * The manager of the voters for this answer
     * @type {PollAnswerVoterManager}
     */
    this.voters = new PollAnswerVoterManager(this);

    /**
     * The raw emoji of this answer
     * @name PollAnswer#_emoji
     * @type {?APIPartialEmoji}
     * @private
     */
    Object.defineProperty(this, '_emoji', { value: data.poll_media?.emoji ?? null });

    this._patch(data);
  }

  _patch(data) {
    // This `count` field comes from `poll.results.answer_counts`
    if ('count' in data) {
      /**
       * The amount of votes this answer has
       * @type {number}
       */
      this.voteCount = data.count;
    } else if (data.poll_media?.text) {
      this.text = data.poll_media.text;
    } else if (data.poll_media?.emoji) {
      Object.defineProperty(this, '_emoji', { value: data.poll_media.emoji });
    } else {
      this.voteCount ??= 0;
    }
  }

  /**
   * The emoji of this answer
   * @type {?(GuildEmoji|Emoji)}
   */
  get emoji() {
    if (!this._emoji || (!this._emoji.id && !this._emoji.name)) return null;
    return this.client.emojis.resolve(this._emoji.id) ?? new Emoji(this.client, this._emoji);
  }

  /**
   * Whether this poll answer is a partial.
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return this.poll.partial || (this.text === null && this.emoji === null);
  }

  /**
   * Options used for fetching voters of a poll answer.
   * @typedef {Object} BaseFetchPollAnswerVotersOptions
   * @property {number} [limit] The maximum number of voters to fetch
   * @property {Snowflake} [after] The user id to fetch voters after
   */

  /**
   * Fetches the users that voted for this answer.
   * @param {BaseFetchPollAnswerVotersOptions} [options={}] The options for fetching voters
   * @returns {Promise<Collection<Snowflake, User>>}
   */
  fetchVoters({ after, limit } = {}) {
    return this.voters.fetch({ after, limit });
  }
}

exports.PollAnswer = PollAnswer;
