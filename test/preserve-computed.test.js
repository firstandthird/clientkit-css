const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('preserve computed styles', (t) => {
  const css = new ClientKitCss('imports', {
    files: {
      'test/out/preserve-computed.css': 'test/fixtures/preserve-computed.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'preserve-computed.css');
    t.end();
  });
});
