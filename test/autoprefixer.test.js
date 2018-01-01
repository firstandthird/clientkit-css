const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('generates prefixes and cleans code in css', (t) => {
  const css = new ClientKitCss('autoprefixer', {
    files: {
      'test/out/autoprefixer.css': 'test/fixtures/autoprefixer.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'autoprefixer.css');
    t.end();
  });
});
