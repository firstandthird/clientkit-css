const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('font parsing whitelist in css', (t) => {
  const css = new ClientKitCss('font parsing whitelist', {
    fontParsingWhitelist: 'font-parsing-whitelist.css',
    files: {
      'test/out/font-parsing-whitelist.css': 'test/fixtures/font-parsing-whitelist.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'font-parsing-whitelist.css');
    t.end();
  });
});
