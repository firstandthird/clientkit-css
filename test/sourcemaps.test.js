const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('sourcemaps', (t) => {
  const css = new ClientKitCss('sourcemaps', {
    files: {
      'test/out/sourcemaps.css': 'test/fixtures/sourcemaps.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'sourcemaps.css.map');
    t.end();
  });
});
