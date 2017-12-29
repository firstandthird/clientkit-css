const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('mqpacker with breakpoints', (t) => {
  const css = new ClientKitCss('mqpacker', {
    breakpoints: {
      desktop: {
        'max-width': '1339px',
        'min-width': '1024px'
      }
    },
    files: {
      'test/out/mqpacker.css': 'test/fixtures/mqpacker.css'
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'mqpacker.css');
    t.end();
  });
});
