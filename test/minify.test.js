const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('minify', (t) => {
  const css = new ClientKitCss('minify', {
    files: {
      'test/out/minify.css': 'test/fixtures/minify.css'
    },
    minify: true
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'minify.css');
    t.end();
  });
});
