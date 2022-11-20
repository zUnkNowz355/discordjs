'use strict';

const EventEmitter = require('node:events');
const { setTimeout, setInterval, clearTimeout, clearInterval } = require('node:timers');
const { GatewayDispatchEvents, GatewayIntentBits, GatewayOpcodes } = require('discord-api-types/v10');
const WebSocket = require('../../WebSocket');
const Events = require('../../util/Events');
const Status = require('../../util/Status');
const WebSocketShardEvents = require('../../util/WebSocketShardEvents');

const STATUS_KEYS = Object.keys(Status);
const CONNECTION_STATE = Object.keys(WebSocket.WebSocket);

let zlib;

try {
  zlib = require('zlib-sync');
} catch {} // eslint-disable-line no-empty

/**
 * Represents a Shard's WebSocket connection
 * @extends {EventEmitter}
 */
class WebSocketShard extends EventEmitter {
  constructor(manager, id) {
    super();

    /**
     * The WebSocketManager of the shard
     * @type {WebSocketManager}
     */
    this.manager = manager;

    /**
     * The shard's id
     * @type {number}
     */
    this.id = id;

    /**
     * The current status of the shard
     * @type {Status}
     */
    this.status = Status.Idle;

    /**
     * The current sequence of the shard
     * @type {number}
     * @private
     */
    this.sequence = -1;

    /**
     * The sequence of the shard after close
     * @type {number}
     * @private
     */
    this.closeSequence = 0;

    /**
     * The current session id of the shard
     * @type {?string}
     * @private
     */
    this.sessionId = null;

    /**
     * The previous heartbeat ping of the shard
     * @type {number}
     */
    this.ping = -1;

    /**
     * The last time a ping was sent (a timestamp)
     * @type {number}
     * @private
     */
    this.lastPingTimestamp = -1;

    /**
     * If we received a heartbeat ack back. Used to identify zombie connections
     * @type {boolean}
     * @private
     */
    this.lastHeartbeatAcked = true;

    /**
     * Used to prevent calling {@link WebSocketShard#event:close} twice while closing or terminating the WebSocket.
     * @type {boolean}
     * @private
     */
    this.closeEmitted = false;

    /**
     * Contains the rate limit queue and metadata
     * @name WebSocketShard#ratelimit
     * @type {Object}
     * @private
     */
    Object.defineProperty(this, 'ratelimit', {
      value: {
        queue: [],
        total: 120,
        remaining: 120,
        time: 60e3,
        timer: null,
      },
    });

    /**
     * The WebSocket connection for the current shard
     * @name WebSocketShard#connection
     * @type {?WebSocket}
     * @private
     */
    Object.defineProperty(this, 'connection', { value: null, writable: true });

    /**
     * @external Inflate
     * @see {@link https://www.npmjs.com/package/zlib-sync}
     */

    /**
     * The compression to use
     * @name WebSocketShard#inflate
     * @type {?Inflate}
     * @private
     */
    Object.defineProperty(this, 'inflate', { value: null, writable: true });

    /**
     * The HELLO timeout
     * @name WebSocketShard#helloTimeout
     * @type {?NodeJS.Timeout}
     * @private
     */
    Object.defineProperty(this, 'helloTimeout', { value: null, writable: true });

    /**
     * The RESUMED dispatch timeout
     * @name WebSocketShard#resumedDispatchTimeout
     * @type {?NodeJS.Timeout}
     * @private
     */
    Object.defineProperty(this, 'resumedDispatchTimeout', { value: null, writable: true });

    /**
     * The WebSocket timeout.
     * @name WebSocketShard#wsCloseTimeout
     * @type {?NodeJS.Timeout}
     * @private
     */
    Object.defineProperty(this, 'wsCloseTimeout', { value: null, writable: true });

    /**
     * If the manager attached its event handlers on the shard
     * @name WebSocketShard#eventsAttached
     * @type {boolean}
     * @private
     */
    Object.defineProperty(this, 'eventsAttached', { value: false, writable: true });

    /**
     * A set of guild ids this shard expects to receive
     * @name WebSocketShard#expectedGuilds
     * @type {?Set<string>}
     * @private
     */
    Object.defineProperty(this, 'expectedGuilds', { value: null, writable: true });

    /**
     * The ready timeout
     * @name WebSocketShard#readyTimeout
     * @type {?NodeJS.Timeout}
     * @private
     */
    Object.defineProperty(this, 'readyTimeout', { value: null, writable: true });

    /**
     * The READY dispatch event timeout
     * @name WebSocketShard#readyDispatchTimeout
     * @type {?NodeJS.Timeout}
     * @private
     */
    Object.defineProperty(this, 'readyDispatchTimeout', { value: null, writable: true });

    /**
     * Time when the WebSocket connection was opened
     * @name WebSocketShard#connectedAt
     * @type {number}
     * @private
     */
    Object.defineProperty(this, 'connectedAt', { value: 0, writable: true });

    /**
     * Time when the last replayed event was received
     * @name WebSocketShard#lastReplayedAt
     * @type {number}
     * @private
     */
    Object.defineProperty(this, 'lastReplayedAt', { value: 0, writable: true });
  }

  /**
   * Emits a debug event.
   * @param {string} message The debug message
   * @private
   */
  debug(message) {
    this.manager.debug(message, this);
  }

  /**
   * Connects the shard to the gateway.
   * @private
   * @returns {Promise<void>} A promise that will resolve if the shard turns ready successfully,
   * or reject if we couldn't connect
   */
  connect() {
    const { gateway, client } = this.manager;

    if (this.connection?.readyState === WebSocket.OPEN && this.status === Status.Ready) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        this.removeListener(WebSocketShardEvents.Close, onClose);
        this.removeListener(WebSocketShardEvents.Ready, onReady);
        this.removeListener(WebSocketShardEvents.Resumed, onResumed);
        this.removeListener(WebSocketShardEvents.InvalidSession, onInvalidOrDestroyed);
        this.removeListener(WebSocketShardEvents.Destroyed, onInvalidOrDestroyed);
      };

      const onReady = () => {
        cleanup();
        resolve();
      };

      const onResumed = () => {
        cleanup();
        resolve();
      };

      const onClose = event => {
        cleanup();
        reject(event);
      };

      const onInvalidOrDestroyed = () => {
        cleanup();
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      };

      this.once(WebSocketShardEvents.Ready, onReady);
      this.once(WebSocketShardEvents.Resumed, onResumed);
      this.once(WebSocketShardEvents.Close, onClose);
      this.once(WebSocketShardEvents.InvalidSession, onInvalidOrDestroyed);
      this.once(WebSocketShardEvents.Destroyed, onInvalidOrDestroyed);

      if (this.connection?.readyState === WebSocket.OPEN) {
        this.debug('An open connection was found, attempting an immediate identify.');
        this.identify();
        return;
      }

      if (this.connection) {
        this.debug(`A connection object was found. Cleaning up before continuing.
    State: ${CONNECTION_STATE[this.connection.readyState]}`);
        this.destroy({ emit: false });
      }

      const wsQuery = { v: client.options.ws.version };

      if (zlib) {
        this.inflate = new zlib.Inflate({
          chunkSize: 65535,
          flush: zlib.Z_SYNC_FLUSH,
          to: WebSocket.encoding === 'json' ? 'string' : '',
        });
        wsQuery.compress = 'zlib-stream';
      }

      this.debug(
        `[CONNECT]
    Gateway    : ${gateway}
    Version    : ${client.options.ws.version}
    Encoding   : ${WebSocket.encoding}
    Compression: ${zlib ? 'zlib-stream' : 'none'}`,
      );

      this.status = this.status === Status.Disconnected ? Status.Reconnecting : Status.Connecting;
      this.setHelloTimeout();

      this.connectedAt = Date.now();

      // Adding a handshake timeout to just make sure no zombie connection appears.
      const ws = (this.connection = WebSocket.create(gateway, wsQuery, { handshakeTimeout: 30_000 }));
      ws.onopen = this.onOpen.bind(this);
      ws.onmessage = this.onMessage.bind(this);
      ws.onerror = this.onError.bind(this);
      ws.onclose = this.onClose.bind(this);
    });
  }

  /**
   * Called whenever a connection is opened to the gateway.
   * @private
   */
  onOpen() {
    this.debug(`[CONNECTED] Took ${Date.now() - this.connectedAt}ms`);
    this.status = Status.Nearly;
  }

  /**
   * Called whenever a message is received.
   * @param {MessageEvent} event Event received
   * @private
   */
  onMessage({ data }) {
    let raw;
    if (data instanceof ArrayBuffer) data = new Uint8Array(data);
    if (zlib) {
      const l = data.length;
      const flush =
        l >= 4 && data[l - 4] === 0x00 && data[l - 3] === 0x00 && data[l - 2] === 0xff && data[l - 1] === 0xff;

      this.inflate.push(data, flush && zlib.Z_SYNC_FLUSH);
      if (!flush) return;
      raw = this.inflate.result;
    } else {
      raw = data;
    }
    let packet;
    try {
      packet = WebSocket.unpack(raw);
    } catch (err) {
      this.manager.client.emit(Events.ShardError, err, this.id);
      return;
    }
    this.manager.client.emit(Events.Raw, packet, this.id);
    if (packet.op === GatewayOpcodes.Dispatch) this.manager.emit(packet.t, packet.d, this.id);
    this.onPacket(packet);
  }

  /**
   * Called whenever an error occurs with the WebSocket.
   * @param {ErrorEvent} event The error that occurred
   * @private
   */
  onError(event) {
    const error = event?.error ?? event;
    if (!error) return;

    /**
     * Emitted whenever a shard's WebSocket encounters a connection error.
     * @event Client#shardError
     * @param {Error} error The encountered error
     * @param {number} shardId The shard that encountered this error
     */
    this.manager.client.emit(Events.ShardError, error, this.id);
  }

  /**
   * @external CloseEvent
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent}
   */

  /**
   * @external ErrorEvent
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent}
   */

  /**
   * @external MessageEvent
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent}
   */

  /**
   * Called whenever a connection to the gateway is closed.
   * @param {CloseEvent} event Close event that was received
   * @private
   */
  onClose(event) {
    this.closeEmitted = true;
    if (this.sequence !== -1) this.closeSequence = this.sequence;
    this.sequence = -1;
    this.setHeartbeatTimer(-1);
    this.setHelloTimeout(-1);
    // Clearing the WebSocket close timeout as close was emitted.
    this.setWsCloseTimeout(-1);
    // If we still have a connection object, clean up its listeners
    if (this.connection) this._cleanupConnection();
    this.status = Status.Disconnected;
    this.emitClose(event);
  }

  /**
   * This method is responsible to emit close event for this shard.
   * This method helps the shard reconnect.
   * @param {CloseEvent} [event] Close event that was received
   */
  emitClose(
    event = {
      code: 1011,
      reason: 'INTERNAL_ERROR',
      wasClean: false,
    },
  ) {
    this.debug(`[CLOSE]
    Event Code: ${event.code}
    Clean     : ${event.wasClean}
    Reason    : ${event.reason ?? 'No reason received'}`);
    /**
     * Emitted when a shard's WebSocket closes.
     * @private
     * @event WebSocketShard#close
     * @param {CloseEvent} event The received event
     */
    this.emit(WebSocketShardEvents.Close, event);
  }
  /**
   * Called whenever a packet is received.
   * @param {Object} packet The received packet
   * @private
   */
  onPacket(packet) {
    if (!packet) {
      this.debug(`Received broken packet: '${packet}'.`);
      return;
    }

    switch (packet.t) {
      case GatewayDispatchEvents.Ready:
        /**
         * Emitted when the shard receives the READY payload and is now waiting for guilds
         * @event WebSocketShard#ready
         */
        this.emit(WebSocketShardEvents.Ready);

        this.sessionId = packet.d.session_id;
        this.expectedGuilds = new Set(packet.d.guilds.map(d => d.id));
        this.status = Status.WaitingForGuilds;
        this.debug(`[READY] Session ${this.sessionId}.`);
        this.setReadyDispatchTimeout(-1);
        this.lastHeartbeatAcked = true;
        this.sendHeartbeat('ReadyHeartbeat');
        break;
      case GatewayDispatchEvents.Resumed: {
        /**
         * Emitted when the shard resumes successfully
         * @event WebSocketShard#resumed
         */
        this.emit(WebSocketShardEvents.Resumed);

        this.status = Status.Ready;
        const replayed = packet.s - this.closeSequence;
        this.debug(`[RESUMED] Session ${this.sessionId} | Replayed ${replayed} events.`);
        this.setResumedDispatchTimeout(-1);
        this.lastHeartbeatAcked = true;
        this.sendHeartbeat('ResumeHeartbeat');
        break;
      }
      default: {
        if (this.status === Status.Resuming) this.lastReplayedAt = Date.now();
        break;
      }
    }

    if (packet.s > this.sequence) this.sequence = packet.s;

    switch (packet.op) {
      case GatewayOpcodes.Hello:
        this.setHelloTimeout(-1);
        this.setHeartbeatTimer(packet.d.heartbeat_interval);
        this.identify();
        break;
      case GatewayOpcodes.Reconnect:
        this.debug('[RECONNECT] Discord asked us to reconnect');
        this.destroy({ closeCode: 4_000 });
        break;
      case GatewayOpcodes.InvalidSession:
        this.debug(`[INVALID SESSION] Resumable: ${packet.d}.`);
        
        // Clear the timers
        this.setReadyDispatchTimeout(-1);
        this.setResumedDispatchTimeout(-1);
        clearTimeout(this.readyTimeout);

        // If we can resume the session, do so immediately
        if (packet.d) {
          this.identifyResume();
          return;
        }
        // Reset the sequence
        this.sequence = -1;
        // Reset the session id as it's invalid
        this.sessionId = null;
        // Set the status to reconnecting
        this.status = Status.Reconnecting;
        // Finally, emit the INVALID_SESSION event
        /**
         * Emitted when the session has been invalidated.
         * @event WebSocketShard#invalidSession
         */
        this.emit(WebSocketShardEvents.InvalidSession);
        break;
      case GatewayOpcodes.HeartbeatAck:
        this.ackHeartbeat();
        break;
      case GatewayOpcodes.Heartbeat:
        this.sendHeartbeat('HeartbeatRequest', true);
        break;
      default:
        this.manager.handlePacket(packet, this);
        if (this.status === Status.WaitingForGuilds && packet.t === GatewayDispatchEvents.GuildCreate) {
          this.expectedGuilds.delete(packet.d.id);
          this.checkReady();
        }
    }
  }

  /**
   * Checks if the shard can be marked as ready
   * @private
   */
  checkReady() {
    // Step 0. Clear the ready timeout, if it exists
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout);
      this.readyTimeout = null;
    }
    // Step 1. If we don't have any other guilds pending, we are ready
    if (!this.expectedGuilds.size) {
      this.debug('Shard received all its guilds. Marking as fully ready.');
      this.status = Status.Ready;

      /**
       * Emitted when the shard is fully ready.
       * This event is emitted if:
       * * all guilds were received by this shard
       * * the ready timeout expired, and some guilds are unavailable
       * @event WebSocketShard#allReady
       * @param {?Set<string>} unavailableGuilds Set of unavailable guilds, if any
       */
      this.emit(WebSocketShardEvents.AllReady);
      return;
    }
    const hasGuildsIntent = this.manager.client.options.intents.has(GatewayIntentBits.Guilds);
    // Step 2. Create a timeout that will mark the shard as ready if there are still unavailable guilds
    // * The timeout is 15 seconds by default
    // * This can be optionally changed in the client options via the `waitGuildTimeout` option
    // * a timeout time of zero will skip this timeout, which potentially could cause the Client to miss guilds.

    const { waitGuildTimeout } = this.manager.client.options;

    this.readyTimeout = setTimeout(
      () => {
        this.debug(
          `Shard ${hasGuildsIntent ? 'did' : 'will'} not receive any more guild packets` +
            `${hasGuildsIntent ? ` in ${waitGuildTimeout} ms` : ''}.\nUnavailable guild count: ${
              this.expectedGuilds.size
            }`,
        );

        this.readyTimeout = null;

        this.status = Status.Ready;

        this.emit(WebSocketShardEvents.AllReady, this.expectedGuilds);
      },
      hasGuildsIntent ? waitGuildTimeout : 0,
    ).unref();
  }

  /**
   * Sets the HELLO packet timeout.
   * @param {number} [time] If set to -1, it will clear the hello timeout
   * @private
   */
  setHelloTimeout(time) {
    if (time === -1) {
      if (this.helloTimeout) {
        this.debug('Clearing the HELLO timeout.');
        clearTimeout(this.helloTimeout);
        this.helloTimeout = null;
      }
      return;
    }
    this.debug('Setting a HELLO timeout for 20s.');
    this.helloTimeout = setTimeout(() => {
      this.debug('Did not receive HELLO in time. Destroying and connecting again.');
      this.destroy({ reset: true, closeCode: 4009 });
    }, 20_000);
  }

  /**
   * Sets the RESUMED dispatch timeout.
   * @param {number} [time] If set to -1, it will clear the resumed timeout
   * @private
   */
  setResumedDispatchTimeout(time) {
    if (time === -1) {
      if (this.resumedDispatchTimeout) {
        this.debug('Clearing the RESUMED dispatch timeout.');
        clearTimeout(this.resumedDispatchTimeout);
        this.resumedDispatchTimeout = null;
      }
      return;
    }
    this.debug('Setting a RESUMED dispatch timeout for 20s.');
    this.resumedDispatchTimeout = setTimeout(() => {
      if ((Date.now() - this.lastReplayedAt) < 20_000) {
        this.debug('Received a message within the last 20s. Delaying RESUMED timeout.');
        return this.setResumedDispatchTimeout();
      }
      this.debug('Did not receive RESUMED in time. Destroying and connecting again.');
      this.destroy({ reset: false, closeCode: 4009 });
    }, 20_000);
  }

  /**
   * Sets the READY dispatch timeout.
   * @param {number} [time] If set to -1, it will clear the ready timeout
   * @private
   */
  setReadyDispatchTimeout(time) {
    if (time === -1) {
      if (this.readyDispatchTimeout) {
        this.debug('Clearing the READY dispatch timeout.');
        clearTimeout(this.readyDispatchTimeout);
        this.readyDispatchTimeout = null;
      }
      return;
    }
    this.debug('Setting a READY dispatch timeout for 20s.');
    this.readyDispatchTimeout = setTimeout(() => {
      this.debug('Did not receive READY in time. Destroying and connecting again.');
      this.destroy({ reset: true, closeCode: 4009 });
    }, 20_000);
  }

  /**
   * Sets the WebSocket Close timeout.
   * This method is responsible for detecting any zombie connections if the WebSocket fails to close properly.
   * @param {number} [time] If set to -1, it will clear the timeout
   * @private
   */
  setWsCloseTimeout(time) {
    if (this.wsCloseTimeout) {
      this.debug('[WebSocket] Clearing the close timeout.');
      clearTimeout(this.wsCloseTimeout);
    }
    if (time === -1) {
      this.wsCloseTimeout = null;
      return;
    }
    this.wsCloseTimeout = setTimeout(() => {
      this.setWsCloseTimeout(-1);
      this.debug(`[WebSocket] Close Emitted: ${this.closeEmitted}`);
      // Check if close event was emitted.
      if (this.closeEmitted) {
        this.debug(
          `[WebSocket] was closed. | WS State: ${
            CONNECTION_STATE[this.connection?.readyState ?? WebSocket.CLOSED]
          } | Close Emitted: ${this.closeEmitted}`,
        );
        // Setting the variable false to check for zombie connections.
        this.closeEmitted = false;
        return;
      }

      this.debug(
        `[WebSocket] did not close properly, assuming a zombie connection.\nEmitting close and reconnecting again.`,
      );

      this.emitClose();
      // Setting the variable false to check for zombie connections.
      this.closeEmitted = false;
    }, time);
  }

  /**
   * Sets the heartbeat timer for this shard.
   * @param {number} time If -1, clears the interval, any other number sets an interval
   * @private
   */
  setHeartbeatTimer(time) {
    if (time === -1) {
      if (this.heartbeatInterval) {
        this.debug('Clearing the heartbeat interval.');
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      return;
    }
    this.debug(`Setting a heartbeat interval for ${time}ms.`);
    // Sanity checks
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), time).unref();
  }

  /**
   * Sends a heartbeat to the WebSocket.
   * If this shard didn't receive a heartbeat last time, it will destroy it and reconnect
   * @param {string} [tag='HeartbeatTimer'] What caused this heartbeat to be sent
   * @param {boolean} [ignoreHeartbeatAck] If we should send the heartbeat forcefully.
   * @private
   */
  sendHeartbeat(
    tag = 'HeartbeatTimer',
    ignoreHeartbeatAck = [Status.WaitingForGuilds, Status.Identifying, Status.Resuming].includes(this.status),
  ) {
    if (ignoreHeartbeatAck && !this.lastHeartbeatAcked) {
      this.debug(`[${tag}] Didn't process heartbeat ack yet but we are still connected. Sending one now.`);
    } else if (!this.lastHeartbeatAcked) {
      this.debug(
        `[${tag}] Didn't receive a heartbeat ack last time, assuming zombie connection. Destroying and reconnecting.
    Status          : ${STATUS_KEYS[this.status]}
    Sequence        : ${this.sequence}
    Connection State: ${this.connection ? CONNECTION_STATE[this.connection.readyState] : 'No Connection??'}`,
      );

      this.destroy({ reset: true, closeCode: 4009 });
      return;
    }

    this.debug(`[${tag}] Sending a heartbeat.`);
    this.lastHeartbeatAcked = false;
    this.lastPingTimestamp = Date.now();
    this.send({ op: GatewayOpcodes.Heartbeat, d: this.sequence }, true);
  }

  /**
   * Acknowledges a heartbeat.
   * @private
   */
  ackHeartbeat() {
    this.lastHeartbeatAcked = true;
    const latency = Date.now() - this.lastPingTimestamp;
    this.debug(`Heartbeat acknowledged, latency of ${latency}ms.`);
    this.ping = latency;
  }

  /**
   * Identifies the client on the connection.
   * @private
   * @returns {void}
   */
  identify() {
    return this.sessionId ? this.identifyResume() : this.identifyNew();
  }

  /**
   * Identifies as a new connection on the gateway.
   * @private
   */
  identifyNew() {
    const { client } = this.manager;
    if (!client.token) {
      this.debug('[IDENTIFY] No token available to identify a new session.');
      return;
    }

    this.status = Status.Identifying;

    // Clone the identify payload and assign the token and shard info
    const d = {
      ...client.options.ws,
      intents: client.options.intents.bitfield,
      token: client.token,
      shard: [this.id, Number(client.options.shardCount)],
    };

    this.debug(`[IDENTIFY] Shard ${this.id}/${client.options.shardCount} with intents: ${d.intents}`);
    this.send({ op: GatewayOpcodes.Identify, d }, true);

    this.setReadyDispatchTimeout();
  }

  /**
   * Resumes a session on the gateway.
   * @private
   */
  identifyResume() {
    if (!this.sessionId) {
      this.debug('[RESUME] No session id was present; identifying as a new session.');
      this.identifyNew();
      return;
    }

    this.status = Status.Resuming;

    this.debug(`[RESUME] Session ${this.sessionId}, sequence ${this.closeSequence}`);

    const d = {
      token: this.manager.client.token,
      session_id: this.sessionId,
      seq: this.closeSequence,
    };

    this.send({ op: GatewayOpcodes.Resume, d }, true);

    this.setResumedDispatchTimeout();
  }

  /**
   * Adds a packet to the queue to be sent to the gateway.
   * <warn>If you use this method, make sure you understand that you need to provide
   * a full [Payload](https://discord.com/developers/docs/topics/gateway#commands-and-events-gateway-commands).
   * Do not use this method if you don't know what you're doing.</warn>
   * @param {Object} data The full packet to send
   * @param {boolean} [important=false] If this packet should be added first in queue
   */
  send(data, important = false) {
    this.ratelimit.queue[important ? 'unshift' : 'push'](data);
    this.processQueue();
  }

  /**
   * Sends data, bypassing the queue.
   * @param {Object} data Packet to send
   * @returns {void}
   * @private
   */
  _send(data) {
    if (this.connection?.readyState !== WebSocket.OPEN) {
      this.debug(`Tried to send packet '${JSON.stringify(data)}' but no WebSocket is available!`);
      this.destroy({ closeCode: 4_000 });
      return;
    }

    this.connection.send(WebSocket.pack(data), err => {
      if (err) this.manager.client.emit(Events.ShardError, err, this.id);
    });
  }

  /**
   * Processes the current WebSocket queue.
   * @returns {void}
   * @private
   */
  processQueue() {
    if (this.ratelimit.remaining === 0) return;
    if (this.ratelimit.queue.length === 0) return;
    if (this.ratelimit.remaining === this.ratelimit.total) {
      this.ratelimit.timer = setTimeout(() => {
        this.ratelimit.remaining = this.ratelimit.total;
        this.processQueue();
      }, this.ratelimit.time).unref();
    }
    while (this.ratelimit.remaining > 0) {
      const item = this.ratelimit.queue.shift();
      if (!item) return;
      this._send(item);
      this.ratelimit.remaining--;
    }
  }

  /**
   * Destroys this shard and closes its WebSocket connection.
   * @param {Object} [options={ closeCode: 1000, reset: false, emit: true, log: true }] Options for destroying the shard
   * @private
   */
  destroy({ closeCode = 1_000, reset = false, emit = true, log = true } = {}) {
    if (log) {
      this.debug(`[DESTROY]
    Close Code    : ${closeCode}
    Reset         : ${reset}
    Emit DESTROYED: ${emit}`);
    }

    // Step 0: Remove all timers
    this.setHeartbeatTimer(-1);
    this.setHelloTimeout(-1);
    this.setReadyDispatchTimeout(-1);
    this.setResumedDispatchTimeout(-1);
    clearTimeout(this.readyTimeout);

    this.debug(
      `[WebSocket] Destroy: Attempting to close the WebSocket. | WS State: ${
        CONNECTION_STATE[this.connection?.readyState ?? WebSocket.CLOSED]
      }`,
    );
    // Step 1: Close the WebSocket connection, if any, otherwise, emit DESTROYED
    if (this.connection) {
      // If the connection is currently opened, we will (hopefully) receive close
      if (this.connection.readyState === WebSocket.OPEN) {
        this.connection.close(closeCode);
        this.debug(`[WebSocket] Close: Tried closing. | WS State: ${CONNECTION_STATE[this.connection.readyState]}`);
      } else {
        // Connection is not OPEN
        this.debug(`WS State: ${CONNECTION_STATE[this.connection.readyState]}`);
        // Remove listeners from the connection
        this._cleanupConnection();
        // Attempt to close the connection just in case
        try {
          this.connection.close(closeCode);
        } catch (err) {
          this.debug(
            `[WebSocket] Close: Something went wrong while closing the WebSocket: ${
              err.message || err
            }. Forcefully terminating the connection | WS State: ${CONNECTION_STATE[this.connection.readyState]}`,
          );
          this.connection.terminate();
        }
        // Emit the destroyed event if needed
        if (emit) this._emitDestroyed();
      }
    } else if (emit) {
      // We requested a destroy, but we had no connection. Emit destroyed
      this._emitDestroyed();
    }

    if (this.connection?.readyState === WebSocket.CLOSING || this.connection?.readyState === WebSocket.CLOSED) {
      this.closeEmitted = false;
      this.debug(
        `[WebSocket] Adding a WebSocket close timeout to ensure a correct WS reconnect.
        Timeout: ${this.manager.client.options.closeTimeout}ms`,
      );
      this.setWsCloseTimeout(this.manager.client.options.closeTimeout);
    }

    // Step 2: Null the connection object
    this.connection = null;

    // Step 3: Set the shard status to disconnected
    this.status = Status.Disconnected;

    // Step 4: Cache the old sequence (use to attempt a resume)
    if (this.sequence !== -1) this.closeSequence = this.sequence;

    // Step 5: Reset the sequence and session id if requested
    if (reset) {
      this.sequence = -1;
      this.sessionId = null;
    }

    // Step 6: reset the rate limit data
    this.ratelimit.remaining = this.ratelimit.total;
    this.ratelimit.queue.length = 0;
    if (this.ratelimit.timer) {
      clearTimeout(this.ratelimit.timer);
      this.ratelimit.timer = null;
    }
  }

  /**
   * Cleans up the WebSocket connection listeners.
   * @private
   */
  _cleanupConnection() {
    this.connection.onopen = this.connection.onclose = this.connection.onmessage = null;
    this.connection.onerror = () => null;
  }

  /**
   * Emits the DESTROYED event on the shard
   * @private
   */
  _emitDestroyed() {
    /**
     * Emitted when a shard is destroyed, but no WebSocket connection was present.
     * @private
     * @event WebSocketShard#destroyed
     */
    this.emit(WebSocketShardEvents.Destroyed);
  }
}

module.exports = WebSocketShard;
