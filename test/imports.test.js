const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('imports in css', (t) => {
  const css = new ClientKitCss('imports', {
    files: {
      'test/out/imports.css': 'test/fixtures/imports.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'imports.css');
    t.end();
  });
});

tap.only('import err in css', (t) => {
  const css = new ClientKitCss('imports', {
    files: {
      'test/out/imports-err.css': 'test/fixtures/import-err.css'
    }
  });
  css.execute((err, results) => {
    t.notEqual(err, null);
    t.end();
  });
});
