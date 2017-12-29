const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('generates local mixins', (t) => {
  const css = new ClientKitCss('local mixins', {
    mixinPath: 'test/fixtures/mixins/*',
    files: {
      'test/out/mixins.css': 'test/fixtures/mixins.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'mixins.css');
    t.end();
  });
});
