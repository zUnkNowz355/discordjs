'use strict';

const { EmbedBuilder: BuildersEmbed, embedLength } = require('@discordjs/builders');
const { isJSONEncodable } = require('@discordjs/util');
const { toSnakeCase } = require('../util/Transformers');
const { resolveColor } = require('../util/Util');

/**
 * Represents an embed builder.
 * @extends {BuildersEmbed}
 */
class EmbedBuilder extends BuildersEmbed {
  constructor(data) {
    super(toSnakeCase(data));
    this._id = null; 
  }

  /**
   * Sets the color of this embed
   * @param {?ColorResolvable} color The color of the embed
   * @returns {EmbedBuilder}
   */
  setColor(color) {
    return super.setColor(color && resolveColor(color));
  }

  setID(id){
    this.id = id;
    return {
      id: this
    };
  } 

  /**
   * Creates a new embed builder from JSON data
   * @param {EmbedBuilder|Embed|APIEmbed} other The other data
   * @returns {EmbedBuilder}
   */
  static from(other) {
    return new this(isJSONEncodable(other) ? other.toJSON() : other);
  }

  /**
   * The accumulated length for the embed title, description, fields, footer text, and author name.
   * @type {number}
   * @readonly
   */
  get length() {
    return embedLength(this.data);
  }
  toJSON() {
    const baseData = super.toJSON();
    if (this.id !== null) {
      baseData.ID = this._id;
    }
    return baseData;
  }

}

module.exports = EmbedBuilder;

/**
 * @external BuildersEmbed
 * @see {@link https://discord.js.org/docs/packages/builders/stable/EmbedBuilder:Class}
 */
