const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('Nesting', (t) => {
  const css = new ClientKitCss('css', {
    files: {
      'test/out/nesting.css': 'test/fixtures/nesting.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'nesting.css');
    t.end();
  });
});
