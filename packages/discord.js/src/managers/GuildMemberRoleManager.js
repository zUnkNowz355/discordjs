'use strict';

const { Collection } = require('@discordjs/collection');
const { Routes } = require('discord-api-types/v10');
const DataManager = require('./DataManager');
const { DiscordjsTypeError, ErrorCodes } = require('../errors');
const { Role } = require('../structures/Role');

/**
 * Manages API methods for roles of a GuildMember and stores their cache.
 * @extends {DataManager}
 */
class GuildMemberRoleManager extends DataManager {
  constructor(member) {
    super(member.client, Role);

    /**
     * The GuildMember this manager belongs to
     * @type {GuildMember}
     */
    this.member = member;

    /**
     * The Guild this manager belongs to
     * @type {Guild}
     */
    this.guild = member.guild;
  }

  /**
   * The roles of this member
   * @type {Collection<Snowflake, Role>}
   * @readonly
   */
  get cache() {
    const everyone = this.guild.roles.everyone;
    return this.guild.roles.cache.filter(role => this.member._roles.includes(role.id)).set(everyone.id, everyone);
  }

  /**
   * The role of the member used to hoist them in a separate category in the users list
   * @type {?Role}
   * @readonly
   */
  get hoist() {
    const hoistedRoles = this.cache.filter(role => role.hoist);
    if (!hoistedRoles.size) return null;
    return hoistedRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
  }

  /**
   * The role of the member used to set their role icon
   * @type {?Role}
   * @readonly
   */
  get icon() {
    const iconRoles = this.cache.filter(role => role.icon || role.unicodeEmoji);
    if (!iconRoles.size) return null;
    return iconRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
  }

  /**
   * The role of the member used to set their color
   * @type {?Role}
   * @readonly
   */
  get color() {
    const coloredRoles = this.cache.filter(role => role.color);
    if (!coloredRoles.size) return null;
    return coloredRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
  }

  /**
   * The role of the member with the highest position
   * @type {Role}
   * @readonly
   */
  get highest() {
    return this.cache.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev), this.cache.first());
  }

  /**
   * The premium subscriber role of the guild, if present on the member
   * @type {?Role}
   * @readonly
   */
  get premiumSubscriberRole() {
    return this.cache.find(role => role.tags?.premiumSubscriberRole) ?? null;
  }

  /**
   * The managed role this member created when joining the guild, if any
   * <info>Only ever available on bots</info>
   * @type {?Role}
   * @readonly
   */
  get botRole() {
    if (!this.member.user.bot) return null;
    return this.cache.find(role => role.tags?.botId === this.member.user.id) ?? null;
  }

  /**
   * Adds a role (or multiple roles) to the member.
   * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, Role>} roleOrRoles The role or roles to add
   * @param {string} [reason] Reason for adding the role(s)
   * @returns {Promise<GuildMember>}
   */
  async add(roleOrRoles, reason) {
    if (roleOrRoles instanceof Collection || Array.isArray(roleOrRoles)) {
      const resolvedRoles = this.resolveRoles(roleOrRoles);

      const newRoles = [...new Set(resolvedRoles.concat(...this.cache.keys()))];
      return this.set(newRoles, reason);
    } else {
      roleOrRoles = this.guild.roles.resolveId(roleOrRoles);
      if (roleOrRoles === null) {
        throw new DiscordjsTypeError(
          ErrorCodes.InvalidType,
          'roles',
          'Role, Snowflake or Array or Collection of Roles or Snowflakes',
        );
      }

      await this.client.rest.put(Routes.guildMemberRole(this.guild.id, this.member.id, roleOrRoles), { reason });

      const clone = this.member._clone();
      clone._roles = [...this.cache.keys(), roleOrRoles];
      return clone;
    }
  }

  /**
   * Removes a role (or multiple roles) from the member.
   * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, Role>} roleOrRoles The role or roles to remove
   * @param {string} [reason] Reason for removing the role(s)
   * @returns {Promise<GuildMember>}
   */
  async remove(roleOrRoles, reason) {
    if (roleOrRoles instanceof Collection || Array.isArray(roleOrRoles)) {
      const resolvedRoles = this.resolveRoles(roleOrRoles);

      const newRoles = this.cache.filter(role => !resolvedRoles.includes(role.id));
      return this.set(newRoles, reason);
    } else {
      roleOrRoles = this.guild.roles.resolveId(roleOrRoles);
      if (roleOrRoles === null) {
        throw new DiscordjsTypeError(
          ErrorCodes.InvalidType,
          'roles',
          'Role, Snowflake or Array or Collection of Roles or Snowflakes',
        );
      }

      await this.client.rest.delete(Routes.guildMemberRole(this.guild.id, this.member.id, roleOrRoles), { reason });

      const clone = this.member._clone();
      const newRoles = this.cache.filter(role => role.id !== roleOrRoles);
      clone._roles = [...newRoles.keys()];
      return clone;
    }
  }
  
  /**
   * Modifies the roles of the member.
   * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, Role>} rolesToAdd The roles to add
   * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, Role>} rolesToRemove The roles to remove
   * @param {string} [reason] Reason for modifying the roles
   * @returns {Promise<GuildMember>}
   */
  async modify(rolesToAdd, rolesToRemove, reason) {
    const resolvedRolesToAdd = this.resolveRoles(rolesToAdd)
    const resolvedRolesToRemove = this.resolveRoles(rolesToRemove);

    const currentRoles = new Set(this.member.roles.cache.keys());
    for (const role of resolvedRolesToAdd) {
        currentRoles.add(role.id);
    }
    for (const role of resolvedRolesToRemove) {
        currentRoles.delete(role.id);
    }

    return await this.member.roles.set([...currentRoles], reason);
}

  /**
   * Resolves roles from the input.
   * @param {RoleResolvable[] | Collection<Snowflake, Role>} rolesToResolve The roles to resolve
   * @returns {Array} The resolved roles
   */
  resolveRoles(rolesToResolve, guild) {
    const resolvedRoles = [];
    for (const role of rolesToResolve.values()) {
        const resolvedRole = this.guild.roles.resolveId(role);
        if (!resolvedRole) {
          throw new DiscordjsTypeError(ErrorCodes.InvalidElement, 'Array or Collection', 'roles', role);
        }
        resolvedRoles.push(resolvedRole);
    }
    return resolvedRoles;
}

  /**
   * Sets the roles applied to the member.
   * @param {Collection<Snowflake, Role>|RoleResolvable[]} roles The roles or role ids to apply
   * @param {string} [reason] Reason for applying the roles
   * @returns {Promise<GuildMember>}
   * @example
   * // Set the member's roles to a single role
   * guildMember.roles.set(['391156570408615936'])
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Remove all the roles from a member
   * guildMember.roles.set([])
   *   .then(member => console.log(`Member roles is now of ${member.roles.cache.size} size`))
   *   .catch(console.error);
   */
  set(roles, reason) {
    return this.member.edit({ roles, reason });
  }

  clone() {
    const clone = new this.constructor(this.member);
    clone.member._roles = [...this.cache.keys()];
    return clone;
  }
}

module.exports = GuildMemberRoleManager;
