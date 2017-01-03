const Request = require('./Request/Request');
const Constants = require('./Constants');

/**
 * Gets the recommended shard count from Discord
 * @param {string} token Discord auth token
 * @param {number} [guildsPerShard=1000] Number of guilds per shard
 * @returns {Promise<number>} the recommended number of shards
 */
module.exports = function fetchRecommendedShards(token, guildsPerShard = 1000) {
  return new Promise((resolve, reject) => {
    if (!token) throw new Error('A token must be provided.');
    new Request('get', Constants.Endpoints.botGateway)
      .set('Authorization', `Bot ${token.replace(/^Bot\s*/i, '')}`)
      .end((err, res) => {
        if (err) reject(err);
        resolve(res.body.shards * (1000 / guildsPerShard));
      });
  });
};
