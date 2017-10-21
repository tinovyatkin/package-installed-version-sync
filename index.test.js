'use strict';

const getPackageInstalledVersionSync = require('./');
const { getVersion } = require('jest');

describe('Getting package installed version', () => {
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
