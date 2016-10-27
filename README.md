<div align="center">
  <p>
    <a href="https://hydrabolt.github.io/discord.js">
      <img src="http://i.imgur.com/StEGtEh.png" width="546" alt="discord.js" />
    </a>
  </p>
  <p>
    <a href="https://discord.gg/bRCvFy9">
      <img src="https://discordapp.com/api/guilds/222078108977594368/embed.png" alt="Discord server" />
    </a>
    <a href="https://www.npmjs.com/package/discord.js">
      <img src="https://img.shields.io/npm/v/discord.js.svg?maxAge=3600" alt="NPM version" />
    </a>
    <a href="https://www.npmjs.com/package/discord.js">
      <img src="https://img.shields.io/npm/dt/discord.js.svg?maxAge=3600" alt="NPM downloads" />
    </a>
    <a href="https://travis-ci.org/hydrabolt/discord.js">
      <img src="https://travis-ci.org/hydrabolt/discord.js.svg" alt="Build status" />
    </a>
    <a href="https://david-dm.org/hydrabolt/discord.js">
      <img src="https://img.shields.io/david/hydrabolt/discord.js.svg?maxAge=3600" alt="Dependencies" />
    </a>
  </p>
  <p>
    <a href="https://nodei.co/npm/discord.js/">
      <img src="https://nodei.co/npm/discord.js.png?downloads=true&stars=true" alt="NPM info" />
    </a>
  </p>
  <br />
</div>

discord.js is a powerful node.js module that allows you to interact with the [Discord API](https://discordapp.com/developers/docs/intro) very easily.

## Installation
**Node.js 6.0.0 or newer is required.**  
Without voice support: `npm install discord.js --save`  
With voice support ([node-opus](https://www.npmjs.com/package/node-opus)): `npm install discord.js node-opus --save`  
With voice support ([opusscript](https://www.npmjs.com/package/opusscript)): `npm install discord.js opusscript --save`  
If both audio packages are installed, discord.js will automatically choose node-opus.

The preferred audio engine is node-opus, as it performs significantly better than opusscript.
Using opusscript is only recommended for development on Windows, since getting node-opus to build there can be a bit of a challenge.
For production bots, using node-opus should be considered a necessity, especially if they're going to be running on multiple servers.

## Example Usage
```js
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong');
  }
});

client.login('your token');
```

A bot template using discord.js can be generated using [generator-discordbot](https://www.npmjs.com/package/generator-discordbot).

## Links
* [Website](http://hydrabolt.github.io/discord.js/)
* [Discord.js server](https://discord.gg/bRCvFy9)
* [Discord API server](https://discord.gg/rV4BwdK)
* [Documentation](http://hydrabolt.github.io/discord.js/#!/docs/tag/master)
* [Legacy (v8) documentation](http://discordjs.readthedocs.io/en/8.2.0/docs_client.html)
* [Examples](https://github.com/hydrabolt/discord.js/tree/master/docs/custom/examples)
* [GitHub](https://github.com/hydrabolt/discord.js)
* [NPM](https://www.npmjs.com/package/discord.js)
* [Related libraries](https://discordapi.com/unofficial/libs.html)

## Contributing
Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation](http://hydrabolt.github.io/discord.js/#!/docs/tag/master).  
See [the contributing guide](CONTRIBUTING.md) if you'd like to submit a PR.

## Help
If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [Discord.js Server](https://discord.gg/bRCvFy9).
