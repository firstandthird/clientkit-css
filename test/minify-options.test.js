const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('minify options', (t) => {
  const css = new ClientKitCss('minify', {
    files: {
      'test/out/minify-options.css': 'test/fixtures/minify-options.css'
    },
    minify: true,
    minifyOptions: {
      zindex: false,
      reduceIdents: true
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'minify-options.css');
    t.end();
  });
});
