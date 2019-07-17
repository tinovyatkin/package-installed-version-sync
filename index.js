'use strict';

const { execFileSync } = require('child_process');
const { readFileSync } = require('fs');
const path = require('path');

const yarnLockfile = require('@yarnpkg/lockfile');
const { valid, clean } = require('semver');
const findUp = require('find-up');

const cache = new Map();
let checkedLockfiles = false;

function readAndParseYarnLock(yarnLockFilepath) {
  // console.info('Parsing yarn.lock');
  try {
    const file = readFileSync(yarnLockFilepath, 'utf8');
    const parsedYarnLock = yarnLockfile.parse(file);
    if (parsedYarnLock && parsedYarnLock.type === 'success') {
      // we have successfully parsed yarn.lock
      // so we will just add everything from it to cache
      /* properties looks like:
        "@destinationstransfers/eslint-config@^1.0.2": {
          "version": "1.0.2",
          "resolved": "https://registry.yarnpkg.com/@destinationstransfers/eslint-config/-/eslint-config-1.0.2.tgz#b130b2406b3f95103efaf474a594748d64485346",
          "dependencies": {
            "eslint-config-airbnb-base": "^11.3.1",
            "eslint-config-prettier": "^2.3.0",
            "eslint-plugin-import": "^2.7.0",
            "eslint-plugin-jest": "^20.0.3",
            "eslint-plugin-jsdoc": "^3.1.2",
            "eslint-plugin-prefer-object-spread": "^1.2.1",
            "eslint-plugin-prettier": "^2.1.2",
            "prettier": "^1.5.3"
          }
        },
        */
      for (const [key, { version }] of Object.entries(parsedYarnLock.object)) {
        const [, packageName] = /^(\S+)@[^@]+$/.exec(key);
        if (valid(version)) cache.set(packageName, version);
      }
    }
  } catch (err) {} // eslint-disable-line no-empty
}

function readAndParsePackageLock(filepath) {
  // console.info('Parsing package-lock.json');
  const { dependencies } = require(filepath);
  /*
      "@destinationstransfers/eslint-config": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@destinationstransfers/eslint-config/-/eslint-config-1.0.2.tgz",
      "integrity": "sha512-/Nkbh1NdFUy17nfquvczEuSiP/G46e5q8190Sgo46JhJpGng6o2qyKEJ5F8qf8oBqdXqgjsVvajraSX5TyyJNw==",
      "dev": true,
      "requires": {
        "eslint-config-airbnb-base": "11.3.2",
        "eslint-config-prettier": "2.6.0",
        "eslint-plugin-import": "2.8.0",
        "eslint-plugin-jest": "20.0.3",
        "eslint-plugin-jsdoc": "3.1.3",
        "eslint-plugin-prefer-object-spread": "1.2.1",
        "eslint-plugin-prettier": "2.3.1",
        "prettier": "1.7.4"
      }
    },
    "browser-logos": {
      "version": "github:alrra/browser-logos#95dbf80b1be5c7e70b2df97f84c711e3949ebdd1",
      "from": "github:alrra/browser-logos#56.2.0",
      "dev": true
    },
  */
  for (const [packageName, { version, from }] of Object.entries(dependencies)) {
    if (valid(version)) cache.set(packageName, version);
    // special github case
    else if (from) {
      const [, savedVersion] = /#([\d.]+)$/.exec(from);
      const ver = clean(savedVersion);
      if (valid(ver)) cache.set(packageName, ver);
    }
  }
}

function searchLockfiles() {
  try {
    checkedLockfiles = true;
    const lockFile = findUp.sync(['yarn.lock', 'package-lock.json']);
    if (!lockFile) return;

    if (lockFile.endsWith('yarn.lock')) readAndParseYarnLock(lockFile);
    else readAndParsePackageLock(lockFile);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Returns currently installed version of a package
 *
 * @param {string} packageName - NPM package name, like 'eslint'
 * @returns {string}
 * @throws on unknown package
 */
function getPackageInstalledVersion(packageName) {
  // check cache first

  try {
    // check yarn once
    if (!checkedLockfiles) searchLockfiles();

    // if we found yarn.lock or package-lock.json we have added everything to cache
    if (cache.has(packageName)) return cache.get(packageName);

    // execute NPM ls with JSON output
    const execRes = execFileSync('npm', ['-j', 'ls', packageName], {
      cwd: __dirname.includes('node_modules')
        ? path.resolve(__dirname, '../../')
        : __dirname,
      encoding: 'utf8',
      timeout: 40000,
    });

    const {
      dependencies: {
        [packageName]: { version },
      },
    } = JSON.parse(execRes);
    if (version) cache.set(packageName, version);
    return version;
  } catch (err) {
    // console.error(err);
    throw new ReferenceError(
      `Unable to get installed version of "${packageName}"`,
    );
  }
}

module.exports = getPackageInstalledVersion;
