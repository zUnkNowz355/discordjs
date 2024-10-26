# Changelog

All notable changes to this project will be documented in this file.

# [@discordjs/brokers@1.0.0](https://github.com/discordjs/discord.js/compare/@discordjs/brokers@0.3.0...@discordjs/brokers@1.0.0) - (2024-09-01)

## Refactor

- **brokers:** Re-design API to make groups a constructor option (#10297) ([38a37b5](https://github.com/discordjs/discord.js/commit/38a37b5caf06913131c6dc2dc5cc258aecfe2266))
- **brokers:** Make option props more correct (#10242) ([393ded4](https://github.com/discordjs/discord.js/commit/393ded4ea14e73b2bb42226f57896130329f88ca))
  - **BREAKING CHANGE:** Classes now take redis client as standalone parameter, various props from the base option interface moved to redis options

# [@discordjs/brokers@0.3.0](https://github.com/discordjs/discord.js/compare/@discordjs/brokers@0.2.3...@discordjs/brokers@0.3.0) - (2024-05-04)

## Bug Fixes

- Minify mainlib docs json (#9963) ([4b88306](https://github.com/discordjs/discord.js/commit/4b88306dcb2b16b840ec61e9e33047af3a31c45d))

## Documentation

- Split docs.api.json into multiple json files ([597340f](https://github.com/discordjs/discord.js/commit/597340f288437c35da8c703d9b621274de60d880))

## Features

- Local and preview detection ([79fbda3](https://github.com/discordjs/discord.js/commit/79fbda3aac6d4f0f8bfb193e797d09cbe331d315))

## Refactor

- Docs (#10126) ([18cce83](https://github.com/discordjs/discord.js/commit/18cce83d80598c430218775c53441b6b2ecdc776))
- Use interfaces for AsyncEventEmitter event maps (#10044) ([adfd9cd](https://github.com/discordjs/discord.js/commit/adfd9cd3b32cfabdcc45ec90f535b2852a3ca4a6))

# [@discordjs/brokers@0.2.2](https://github.com/discordjs/discord.js/compare/@discordjs/brokers@0.2.1...@discordjs/brokers@0.2.2) - (2023-08-17)

## Documentation

- Update Node.js requirement to 16.11.0 (#9764) ([188877c](https://github.com/discordjs/discord.js/commit/188877c50af70f0d5cffb246620fa277435c6ce6))

# [@discordjs/brokers@0.2.1](https://github.com/discordjs/discord.js/compare/@discordjs/brokers@0.2.0...@discordjs/brokers@0.2.1) - (2023-05-01)

## Bug Fixes

- Fix external links (#9313) ([a7425c2](https://github.com/discordjs/discord.js/commit/a7425c29c4f23f1b31f4c6a463107ca9eb7fd7e2))

## Documentation

- Generate static imports for types with api-extractor ([98a76db](https://github.com/discordjs/discord.js/commit/98a76db482879f79d6bb2fb2e5fc65ac2c34e2d9))
- Use `@link` in `@see` (#9348) ([d66d113](https://github.com/discordjs/discord.js/commit/d66d1133331b81563588db4500c63a18c3c3dfae))

# [@discordjs/brokers@0.2.1](https://github.com/discordjs/discord.js/compare/@discordjs/brokers@0.2.0...@discordjs/brokers@0.2.1) - (2023-05-01)

## Bug Fixes

- Fix external links (#9313) ([a7425c2](https://github.com/discordjs/discord.js/commit/a7425c29c4f23f1b31f4c6a463107ca9eb7fd7e2))

## Documentation

- Generate static imports for types with api-extractor ([98a76db](https://github.com/discordjs/discord.js/commit/98a76db482879f79d6bb2fb2e5fc65ac2c34e2d9))
- Use `@link` in `@see` (#9348) ([d66d113](https://github.com/discordjs/discord.js/commit/d66d1133331b81563588db4500c63a18c3c3dfae))

# [@discordjs/brokers@0.2.0](https://github.com/discordjs/discord.js/compare/@discordjs/brokers@0.1.0...@discordjs/brokers@0.2.0) - (2023-04-01)

## Bug Fixes

- **scripts:** Accessing tsComment ([d8d5f31](https://github.com/discordjs/discord.js/commit/d8d5f31d3927fd1de62f1fa3a1a6e454243ad87b))
- **WebSocketShard:** Proper error bubbling (#9119) ([9681f34](https://github.com/discordjs/discord.js/commit/9681f348770b0e2ff9b7c96b1c30575dd950e2ed))

## Features

- **website:** Render syntax and mdx on the server (#9086) ([ee5169e](https://github.com/discordjs/discord.js/commit/ee5169e0aadd7bbfcd752aae614ec0f69602b68b))
- **website:** Add support for source file links (#9048) ([f6506e9](https://github.com/discordjs/discord.js/commit/f6506e99c496683ee0ab67db0726b105b929af38))

# [@discordjs/brokers@0.1.0](https://github.com/discordjs/discord.js/tree/@discordjs/brokers@0.1.0) - (2022-11-23)

## Bug Fixes

- **brokers:** Publish the scripts folder (#8794) ([0bcc18a](https://github.com/discordjs/discord.js/commit/0bcc18a0bdd8f1e1ebb974126a460d2743547b34))
- **BaseRedisBroker:** Proper import path to lua script (#8776) ([e7cbc1b](https://github.com/discordjs/discord.js/commit/e7cbc1bf111b09b64accfd95e82ad9f3a408fc4c))

## Features

- @discordjs/brokers (#8548) ([bf9aa18](https://github.com/discordjs/discord.js/commit/bf9aa1858dab2e1bca3be390ce2392b99d208dbf))

