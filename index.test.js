'use strict';

const path = require('path');

const { getVersion } = require('jest');

const getPackageInstalledVersionSync = require('./');

const { searchFileSync } = getPackageInstalledVersionSync;

describe('Getting package installed version', () => {
  it('searchFileSync', () => {
    // searching ourselves
    const deepDir = path.resolve(
      __dirname,
      'node_modules',
      '@desitnationstransfers',
    );
    console.log('Searching from %s', deepDir);
    const res = searchFileSync(deepDir, path.basename(__filename));
    expect(res).toBe(__filename);
    // should faild well on unknown file
    expect(searchFileSync(deepDir, 'byaka.buka')).toBeUndefined();
  });

  it('should return installed version of a package from deps', () => {
    const res = getPackageInstalledVersionSync('jest');
    expect(res).toBe(getVersion());
  });

  it('should throw on unknow package', () => {
    expect(() => getPackageInstalledVersionSync('byaka')).toThrow(
      ReferenceError,
    );
  });

  it('Github installed package', () => {
    expect(getPackageInstalledVersionSync('browser-logos')).toBe('56.2.0');
  });
});
