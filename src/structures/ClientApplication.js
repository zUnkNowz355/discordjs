const Snowflake = require('../util/Snowflake');
const { ClientApplicationAssetTypes } = require('../util/Constants');
const DataResolver = require('../util/DataResolver');
const Base = require('./Base');

/**
 * Represents a Client OAuth2 Application.
 * @extends {Base}
 */
class ClientApplication extends Base {
  constructor(client, data) {
    super(client);
    this._patch(data);
  }

  _patch(data) {
    /**
     * The ID of the app
     * @type {Snowflake}
     */
    this.id = data.id;

    /**
     * The name of the app
     * @type {string}
     */
    this.name = data.name;

    /**
     * The app's description
     * @type {string}
     */
    this.description = data.description;

    /**
     * The app's icon hash
     * @type {string}
     */
    this.icon = data.icon;

    /**
     * The app's RPC origins, if enabled
     * @type {?string[]}
     */
    this.rpcOrigins = data.rpc_origins || [];

    /**
     * If this app's bot requires a code grant when using the OAuth2 flow
     * @type {boolean}
     */
    this.botRequireCodeGrant = data.bot_require_code_grant;

    /**
     * If this app's bot is public
     * @type {boolean}
     */
    this.botPublic = data.bot_public;

    /**
     * The owner of this OAuth application
     * @type {User}
     */
    this.owner = this.client.users.add(data.owner);
  }

  /**
   * The timestamp the app was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return Snowflake.deconstruct(this.id).timestamp;
  }

  /**
   * The time the app was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * A link to the application's icon.
   * @param {ImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string} URL to the icon
   */
  iconURL({ format, size } = {}) {
    if (!this.icon) return null;
    return this.client.rest.cdn.AppIcon(this.id, this.icon, { format, size });
  }

  /**
   * Get rich presence assets.
   * @returns {Promise<Object>}
   */
  fetchAssets() {
    const types = Object.keys(ClientApplicationAssetTypes);
    return this.client.api.oauth2.applications(this.id).assets.get()
      .then(assets => assets.map(a => ({
        id: a.id,
        name: a.name,
        type: types[a.type - 1],
      })));
  }

  /**
   * Creates a rich presence asset.
   * @param {string} name Name of the asset
   * @param {Base64Resolvable} data Data of the asset
   * @param {string} type Type of the asset. `big`, or `small`
   * @returns {Promise}
   */
  async createAsset(name, data, type) {
    return this.client.api.oauth2.applications(this.id).assets.post({ data: {
      name,
      type: ClientApplicationAssetTypes[type.toUpperCase()],
      image: await DataResolver.resolveImage(data),
    } });
  }

  /**
   * When concatenated with a string, this automatically returns the application's name instead of the
   * ClientApplication object.
   * @returns {string}
   * @example
   * // Logs: Application name: My App
   * console.log(`Application name: ${application}`);
   */
  toString() {
    return this.name;
  }

  toJSON() {
    return super.toJSON({ createdTimestamp: true });
  }
}

module.exports = ClientApplication;
