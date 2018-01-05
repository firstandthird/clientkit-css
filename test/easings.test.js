const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('Easings', (t) => {
  const css = new ClientKitCss('css', {
    files: {
      'test/out/easings.css': 'test/fixtures/easings.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'easings.css');
    t.end();
  });
});
