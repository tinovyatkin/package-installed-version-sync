# package-installed-version-sync

Synchronously returns installed version of a dependency package

It sometimes useful to get exact currently installed version of a dependency and this package doing exactly that one thing synchronously (with caching).

## Usage

```js
const packageInstalledVersionSync = require('package-installed-version-sync');

const jestVersion = packageInstalledVersionSync('jest'); // => 21.0.1
```

## Changelog

- 3.0 - requires Node.js >= 10.17
- 2.0.2 - fixed error with NPM installed packages from GitHub repos
- 2.0 - now uses lockfiles (`yarn.lock` or `package-lock.json`) when available for faster result and compatibility with Yarn.
