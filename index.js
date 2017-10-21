'use strict';

const { execFileSync } = require('child_process');
const { resolve } = require('path');

const cache = new Map();

/**
 * Returns currently installed version of a package
 * 
 * @param {string} packageName - NPM package name, like 'eslint'
 * @returns {string}
 * @throws on unknown package
 */
function getPackageInstalledVersion(packageName) {
  // check cache first
  if (cache.has(packageName)) return cache.get(packageName);

  try {
    // execute NPM ls with JSON output
    const execRes = execFileSync('npm', ['-j', 'ls', packageName], {
      cwd: __dirname.includes('node_modules')
        ? resolve(__dirname, '../../')
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
    throw new ReferenceError(
      `Unable to get installed version of "${packageName}"`
    );
  }
}

module.exports = getPackageInstalledVersion;
