'use strict';

const { execFileSync } = require('child_process');

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
      cwd: __dirname,
      encoding: 'utf8',
      timeout: 4000,
    });

    const { dependencies: { [packageName]: { version } } } = JSON.parse(
      execRes
    );
    if (version) cache.set(packageName, version);
    return version;
  } catch (_) {
    throw new ReferenceError(
      `Unable to get installed version of "${packageName}"`
    );
  }
}

module.exports = getPackageInstalledVersion;
