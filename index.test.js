'use strict';

const getPackageInstalledVersionSync = require('./');
const { getVersion } = require('jest');
const path = require('path');

const { searchFileSync } = getPackageInstalledVersionSync;

describe('Getting package installed version', () => {
  test('searchFileSync', () => {
    // searching ourselves
    const deepDir = path.resolve(
      __dirname,
      'node_modules',
      '@desitnationstransfers'
    );
    console.log('Searching from %s', deepDir);
    const res = searchFileSync(deepDir, path.basename(__filename));
    expect(res).toBe(__filename);
    // should faild well on unknown file
    expect(searchFileSync(deepDir, 'byaka.buka')).toBeUndefined();
  });

  test('should return installed version of a package from deps', () => {
    const res = getPackageInstalledVersionSync('jest');
    expect(res).toBe(getVersion());
  });

  test('should throw on unknow package', () => {
    expect(() => getPackageInstalledVersionSync('byaka')).toThrow(
      ReferenceError
    );
  });

  test('Github installed package', () => {
    expect(getPackageInstalledVersionSync('browser-logos')).toBe('43.1.0');
  });
});
