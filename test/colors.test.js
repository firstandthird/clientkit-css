const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('color vars', (t) => {
  const css = new ClientKitCss('css', {
    color: {
      test: '#336699'
    }
  });
  t.deepEqual(css.cssVars, {
    'color-test': '#336699'
  });
  t.end();
});

tap.test('color vars in css', (t) => {
  const css = new ClientKitCss('css', {
    files: {
      'test/out/colors.css': 'test/fixtures/colors.css'
    },
    color: {
      test: '#336699'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'colors.css');
    t.end();
  });
});
