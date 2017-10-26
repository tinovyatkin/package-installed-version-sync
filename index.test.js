'use strict';

const getPackageInstalledVersionSync = require('./');
const { getVersion } = require('jest');
const path = require('path');

const { searchFileSync } = getPackageInstalledVersionSync;

describe('Getting package installed version', () => {
  test('searchFileSync', () => {
    const deepDir = path.resolve(__dirname, '__tests__', 'test-deep-folder');
    const res = searchFileSync(deepDir, 'package.json');
    expect(res).toBe(path.resolve(__dirname, 'package.json'));
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
});
