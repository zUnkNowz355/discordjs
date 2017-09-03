const Util = require('./util/Util');

module.exports = {
  // "Root" classes (starting points)
  Client: require('./client/Client'),
  Shard: require('./sharding/Shard'),
  ShardClientUtil: require('./sharding/ShardClientUtil'),
  ShardingManager: require('./sharding/ShardingManager'),
  WebhookClient: require('./client/WebhookClient'),

  // Utilities
  Collection: require('./util/Collection'),
  Constants: require('./util/Constants'),
  DiscordAPIError: require('./client/rest/DiscordAPIError'),
  EvaluatedPermissions: require('./util/Permissions'),
  Permissions: require('./util/Permissions'),
  Snowflake: require('./util/Snowflake'),
  SnowflakeUtil: require('./util/Snowflake'),
  Util: Util,
  util: Util,
  version: require('../package.json').version,

  // Shortcuts to Util methods
  escapeMarkdown: Util.escapeMarkdown,
  fetchRecommendedShards: Util.fetchRecommendedShards,
  splitMessage: Util.splitMessage,

  // Structures
  Activity: require('./structures/Presence').Activity,
  Attachment: require('./structures/Attachment'),
  Channel: require('./structures/Channel'),
  ClientUser: require('./structures/ClientUser'),
  ClientUserSettings: require('./structures/ClientUserSettings'),
  Collector: require('./structures/interfaces/Collector'),
  DMChannel: require('./structures/DMChannel'),
  Emoji: require('./structures/Emoji'),
  GroupDMChannel: require('./structures/GroupDMChannel'),
  Guild: require('./structures/Guild'),
  GuildAuditLogs: require('./structures/GuildAuditLogs'),
  GuildChannel: require('./structures/GuildChannel'),
  GuildMember: require('./structures/GuildMember'),
  Invite: require('./structures/Invite'),
  Message: require('./structures/Message'),
  MessageAttachment: require('./structures/MessageAttachment'),
  MessageCollector: require('./structures/MessageCollector'),
  MessageEmbed: require('./structures/MessageEmbed'),
  MessageMentions: require('./structures/MessageMentions'),
  MessageReaction: require('./structures/MessageReaction'),
  ClientApplication: require('./structures/ClientApplication'),
  PermissionOverwrites: require('./structures/PermissionOverwrites'),
  Presence: require('./structures/Presence').Presence,
  ReactionEmoji: require('./structures/ReactionEmoji'),
  ReactionCollector: require('./structures/ReactionCollector'),
  Role: require('./structures/Role'),
  TextChannel: require('./structures/TextChannel'),
  User: require('./structures/User'),
  VoiceChannel: require('./structures/VoiceChannel'),
  Webhook: require('./structures/Webhook'),

  get static() {
    return require('./static');
  },
};
