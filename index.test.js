'use strict';

const path = require('path');

const { getVersion } = require('jest');

const getPackageInstalledVersionSync = require('./');

describe('Getting package installed version', () => {
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
