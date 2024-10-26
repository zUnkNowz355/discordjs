# Changelog

All notable changes to this project will be documented in this file.

# [@discordjs/proxy@2.1.1](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@2.1.0...@discordjs/proxy@2.1.1) - (2024-09-01)

# [@discordjs/proxy@2.1.0](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@2.0.2...@discordjs/proxy@2.1.0) - (2024-05-04)

## Bug Fixes

- Anchor link for events ([0efd1be](https://github.com/discordjs/discord.js/commit/0efd1bea46fa2fc8bcd3dcfd0ac5cd608a0a7df0))
- Minify mainlib docs json (#9963) ([4b88306](https://github.com/discordjs/discord.js/commit/4b88306dcb2b16b840ec61e9e33047af3a31c45d))

## Documentation

- Split docs.api.json into multiple json files ([597340f](https://github.com/discordjs/discord.js/commit/597340f288437c35da8c703d9b621274de60d880))
- Remove hyphen after `@returns` (#9989) ([e9ff991](https://github.com/discordjs/discord.js/commit/e9ff99101b9800f36839e6158d544c8ef5938d22))

## Features

- Local and preview detection ([79fbda3](https://github.com/discordjs/discord.js/commit/79fbda3aac6d4f0f8bfb193e797d09cbe331d315))

## Refactor

- Docs (#10126) ([18cce83](https://github.com/discordjs/discord.js/commit/18cce83d80598c430218775c53441b6b2ecdc776))

# [@discordjs/proxy@2.0.2](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@2.0.1...@discordjs/proxy@2.0.2) - (2023-11-12)

## Bug Fixes

- Forward x-audit-log-reason header (#9889) ([6a63c44](https://github.com/discordjs/discord.js/commit/6a63c441fe378ca6dd630ad05e29647903f898bc))

## Documentation

- **create-discord-bot:** Support bun in create-discord-bot (#9798) ([7157748](https://github.com/discordjs/discord.js/commit/7157748fe3a69265896adf0450cd3f37acbcf97b))

# [@discordjs/proxy@2.0.1](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@2.0.0...@discordjs/proxy@2.0.1) - (2023-08-17)

## Documentation

- Update Node.js requirement to 16.11.0 (#9764) ([188877c](https://github.com/discordjs/discord.js/commit/188877c50af70f0d5cffb246620fa277435c6ce6))

# [@discordjs/proxy@2.0.0](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@1.4.1...@discordjs/proxy@2.0.0) - (2023-07-31)

## Refactor

- **REST:** Remove double classing (#9722) ([8f4256d](https://github.com/discordjs/discord.js/commit/8f4256db8a52ac08359d0b3436f41b641ac4e382))
  - **BREAKING CHANGE:** `REST` and `RequestManager` have been combined, most of the properties, methods, and events from both classes can now be found on `REST`
  - **BREAKING CHANGE:** `REST#raw` has been removed in favor of `REST#queueRequest`
  - **BREAKING CHANGE:** `REST#getAgent` has been removed in favor of `REST#agent`

* chore: update for /rest changes
- **rest:** Switch api to fetch-like and provide strategies (#9416) ([cdaa0a3](https://github.com/discordjs/discord.js/commit/cdaa0a36f586459f1e5ede868c4250c7da90455c))
  - **BREAKING CHANGE:** NodeJS v18+ is required when using node due to the use of global `fetch`
  - **BREAKING CHANGE:** The raw method of REST now returns a web compatible `Respone` object.
  - **BREAKING CHANGE:** The `parseResponse` utility method has been updated to operate on a web compatible `Response` object.
  - **BREAKING CHANGE:** Many underlying internals have changed, some of which were exported.
  - **BREAKING CHANGE:** `DefaultRestOptions` used to contain a default `agent`, which is now set to `null` instead.

# [@discordjs/proxy@1.4.1](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@1.4.0...@discordjs/proxy@1.4.1) - (2023-05-01)

## Bug Fixes

- Fix external links (#9313) ([a7425c2](https://github.com/discordjs/discord.js/commit/a7425c29c4f23f1b31f4c6a463107ca9eb7fd7e2))

## Documentation

- Generate static imports for types with api-extractor ([98a76db](https://github.com/discordjs/discord.js/commit/98a76db482879f79d6bb2fb2e5fc65ac2c34e2d9))

## Refactor

- **proxy:** Rely on auth header instead (#9422) ([a49ed0a](https://github.com/discordjs/discord.js/commit/a49ed0a2d5934ad7af2e9cfbf7c5ccf171599591))

# [@discordjs/proxy@1.4.0](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@1.3.0...@discordjs/proxy@1.4.0) - (2023-04-01)

## Bug Fixes

- **scripts:** Accessing tsComment ([d8d5f31](https://github.com/discordjs/discord.js/commit/d8d5f31d3927fd1de62f1fa3a1a6e454243ad87b))

## Features

- **website:** Render syntax and mdx on the server (#9086) ([ee5169e](https://github.com/discordjs/discord.js/commit/ee5169e0aadd7bbfcd752aae614ec0f69602b68b))

# [@discordjs/proxy@1.3.0](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@1.2.1...@discordjs/proxy@1.3.0) - (2023-03-12)

## Documentation

- Fix typos (#9127) ([1ba1f23](https://github.com/discordjs/discord.js/commit/1ba1f238f04221ec890fc921678909b5b7d92c26))

## Features

- **website:** Add support for source file links (#9048) ([f6506e9](https://github.com/discordjs/discord.js/commit/f6506e99c496683ee0ab67db0726b105b929af38))

# [@discordjs/proxy@1.2.1](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@1.2.0...@discordjs/proxy@1.2.1) - (2022-11-25)

## Bug Fixes

- Pin @types/node version ([9d8179c](https://github.com/discordjs/discord.js/commit/9d8179c6a78e1c7f9976f852804055964d5385d4))

# [@discordjs/proxy@1.2.0](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@1.1.0...@discordjs/proxy@1.2.0) - (2022-10-07)

## Bug Fixes

- **proxyRequests:** Forward query parameters (#8691) ([f063625](https://github.com/discordjs/discord.js/commit/f063625836915b0fa3b0f0b89d073e877465dfd4))
- Footer / sidebar / deprecation alert ([ba3e0ed](https://github.com/discordjs/discord.js/commit/ba3e0ed348258fe8e51eefb4aa7379a1230616a9))

## Documentation

- Change name (#8604) ([dd5a089](https://github.com/discordjs/discord.js/commit/dd5a08944c258a847fc4377f1d5e953264ab47d0))

## Features

- Web-components (#8715) ([0ac3e76](https://github.com/discordjs/discord.js/commit/0ac3e766bd9dbdeb106483fa4bb085d74de346a2))
- Add `@discordjs/util` (#8591) ([b2ec865](https://github.com/discordjs/discord.js/commit/b2ec865765bf94181473864a627fb63ea8173fd3))

## Refactor

- Website components (#8600) ([c334157](https://github.com/discordjs/discord.js/commit/c3341570d983aea9ecc419979d5a01de658c9d67))
- Use `eslint-config-neon` for packages. (#8579) ([edadb9f](https://github.com/discordjs/discord.js/commit/edadb9fe5dfd9ff51a3cfc9b25cb242d3f9f5241))

# [@discordjs/proxy@1.1.0](https://github.com/discordjs/discord.js/compare/@discordjs/proxy@1.0.1...@discordjs/proxy@1.1.0) - (2022-08-22)

## Bug Fixes

- **proxyRequests:** Typo in error message (#8537) ([dd44e8b](https://github.com/discordjs/discord.js/commit/dd44e8b6ec141e630af4543bd3babcce39aa2887))

## Features

- **website:** Show `constructor` information (#8540) ([e42fd16](https://github.com/discordjs/discord.js/commit/e42fd1636973b10dd7ed6fb4280ee1a4a8f82007))

## Refactor

- Docs design (#8487) ([4ab1d09](https://github.com/discordjs/discord.js/commit/4ab1d09997a18879a9eb9bda39df6f15aa22557e))

# [@discordjs/proxy@1.0.1](https://github.com/discordjs/discord.js/tree/@discordjs/proxy@1.0.1) - (2022-07-27)

## Bug Fixes

- **proxy-container:** Proper deps (#8120) ([17867f9](https://github.com/discordjs/discord.js/commit/17867f9154d0dd16357f4ff29da641e23a33a9fa))
- **proxy:** Add docs script ([a45bef4](https://github.com/discordjs/discord.js/commit/a45bef4cad77dac1a4138fd0d52b769ce09b5678))

## Documentation

- Add codecov coverage badge to readmes (#8226) ([f6db285](https://github.com/discordjs/discord.js/commit/f6db285c073898a749fe4591cbd4463d1896daf5))

## Features

- Codecov (#8219) ([f10f4cd](https://github.com/discordjs/discord.js/commit/f10f4cdcd88ca6be7ec735ed3a415ba13da83db0))
- Proxy container (#8000) ([2681929](https://github.com/discordjs/discord.js/commit/2681929e4263032ad34a99ecb42465c320b271ba))
- **docgen:** Update typedoc ([b3346f4](https://github.com/discordjs/discord.js/commit/b3346f4b9b3d4f96443506643d4631dc1c6d7b21))
- Website (#8043) ([127931d](https://github.com/discordjs/discord.js/commit/127931d1df7a2a5c27923c2f2151dbf3824e50cc))
- **docgen:** Typescript support ([3279b40](https://github.com/discordjs/discord.js/commit/3279b40912e6aa61507bedb7db15a2b8668de44b))
- Docgen package (#8029) ([8b979c0](https://github.com/discordjs/discord.js/commit/8b979c0245c42fd824d8e98745ee869f5360fc86))
- Use vitest instead of jest for more speed ([8d8e6c0](https://github.com/discordjs/discord.js/commit/8d8e6c03decd7352a2aa180f6e5bc1a13602539b))
- Add scripts package for locally used scripts ([f2ae1f9](https://github.com/discordjs/discord.js/commit/f2ae1f9348bfd893332a9060f71a8a5f272a1b8b))
- @discordjs/proxy (#7925) ([1ba2d2a](https://github.com/discordjs/discord.js/commit/1ba2d2a898613e5fcc119a97dce935f4db91162c))

## Refactor

- Move all the config files to root (#8033) ([769ea0b](https://github.com/discordjs/discord.js/commit/769ea0bfe78c4f1d413c6b397c604ffe91e39c6a))

## Styling

- Cleanup tests and tsup configs ([6b8ef20](https://github.com/discordjs/discord.js/commit/6b8ef20cb3af5b5cfd176dd0aa0a1a1e98551629))
