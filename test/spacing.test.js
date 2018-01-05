const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('spacing vars', (t) => {
  const css = new ClientKitCss('spacing', {
    spacing: {
      default: {
        xl: '40px',
        lg: '30px',
        md: '25px',
        sm: '20px',
        xs: '10px'
      },
      mobile: {
        xl: '41px',
        lg: '31px',
        md: '25px',
        sm: '21px',
        xs: '11px'
      }
    }
  });
  t.deepEqual(css.cssVars, {
    'spacing-xl': '40px',
    'spacing-lg': '30px',
    'spacing-md': '25px',
    'spacing-sm': '20px',
    'spacing-xs': '10px'
  });
  t.end();
});

tap.test('spacing vars in css', (t) => {
  const css = new ClientKitCss('spacing', {
    files: {
      'test/out/spacing.css': 'test/fixtures/spacing.css'
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
    utils.checkOutput(t, 'spacing.css');
    t.end();
  });
});
