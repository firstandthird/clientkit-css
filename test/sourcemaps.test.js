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

tap.test('disable sourcemaps', (t) => {
  const css = new ClientKitCss('sourcemaps', {
    sourcemap: false,
    files: {
      'test/out/nosourcemaps.css': 'test/fixtures/sourcemaps.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'nosourcemaps.css');
    t.end();
  });
});
