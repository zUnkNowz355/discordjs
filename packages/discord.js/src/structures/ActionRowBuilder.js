'use strict';

const { ActionRowBuilder: BuildersActionRow, ComponentBuilder } = require('@discordjs/builders');
const Transformers = require('../util/Transformers');

/**
 * Represents an action row builder.
 */
class ActionRowBuilder extends BuildersActionRow {
  constructor({ components, ...data } = {}) {
    super({
      ...Transformers.toSnakeCase(data),
      components: components?.map(c => (c instanceof ComponentBuilder ? c : Transformers.toSnakeCase(c))),
    });
  }
}

module.exports = ActionRowBuilder;
