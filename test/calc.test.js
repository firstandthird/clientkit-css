const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('Calc', (t) => {
  const css = new ClientKitCss('calc', {
    files: {
      'test/out/calc.css': 'test/fixtures/calc.css'
    },
    spacing: {
      default: {
        none: 0,
        xl: '40px',
        lg: '30px',
        md: '25px',
        sm: '20px',
        xs: '10px'
      }
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'calc.css');
    t.end();
  });
});
