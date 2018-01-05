const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('grid vars', (t) => {
  const css = new ClientKitCss('css', {
    grid: {
      gutters: '15px'
    }
  });
  t.deepEqual(css.cssVars, {
    'grid-gutters': '15px'
  });
  t.end();
});

tap.test('grid vars in css', (t) => {
  const css = new ClientKitCss('css', {
    files: {
      'test/out/grid.css': 'test/fixtures/grid.css'
    },
    grid: {
      gutters: '15px'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'grid.css');
    t.end();
  });
});
