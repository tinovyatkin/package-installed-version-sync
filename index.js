'use strict';

/* eslint-disable no-sync */

const { execFileSync } = require('child_process');
const { existsSync, statSync, readFileSync } = require('fs');
const path = require('path');
const yarnLockfile = require('@yarnpkg/lockfile');

const cache = new Map();
let checkedLockfiles = false;

function searchFileSync(dirToStart, fileToSearch) {
  try {
    let curDir = dirToStart;
    let deep = 0;
    do {
      // console.log(curDir);
      const filePath = path.join(curDir, fileToSearch);
      if (existsSync(filePath)) return filePath;
      curDir = path.resolve(curDir, '..');
    } while (curDir.length > 1 && statSync(curDir).isDirectory() && ++deep < 6);
  } catch (e) {
    // console.error(e);
  } // eslint-disable-line no-empty
  return undefined;
}

function readAndParseYarnLock(yarnLockFilepath) {
  // console.info('Parsing yarn.lock');
  try {
    const file = readFileSync(yarnLockFilepath, 'utf8');
    const parsedYarnLock = yarnLockfile.parse(file);
    if (parsedYarnLock) {
      if (parsedYarnLock.type === 'success') {
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
        for (const [key, { version }] of Object.entries(
          parsedYarnLock.object
        )) {
          const [, packageName] = /^(\S+)@[^@]+$/.exec(key);
          cache.set(packageName, version);
        }
      }
    }
  } catch (e) {} // eslint-disable-line no-empty
}

function readAndParsePackageLock(filepath) {
  // console.info('Parsing package-lock.json');
  const { dependencies } = require(filepath); // eslint-disable-line global-require, import/no-dynamic-require
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
  */
  for (const [packageName, { version }] of Object.entries(dependencies)) {
    cache.set(packageName, version);
  }
}

function searchLockfiles() {
  try {
    checkedLockfiles = true;
    const yl = searchFileSync(__dirname, 'yarn.lock');
    if (yl) readAndParseYarnLock(yl);
    else {
      // let's check packages-lock.json
      const pl = searchFileSync(__dirname, 'package-lock.json');
      if (pl) readAndParsePackageLock(pl);
    }
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

    const { dependencies: { [packageName]: { version } } } = JSON.parse(
      execRes
    );
    if (version) cache.set(packageName, version);
    return version;
  } catch (err) {
    // console.error(err);
    throw new ReferenceError(
      `Unable to get installed version of "${packageName}"`
    );
  }
}

module.exports = getPackageInstalledVersion;
module.exports.searchFileSync = searchFileSync;
