const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('breakpoints', (t) => {
  const css = new ClientKitCss('breakpoints', {
    breakpoints: {
      'desktop-wide': {
        'max-width': '100vw',
        'min-width': '1400px'
      },
      desktop: {
        'max-width': '1339px',
        'min-width': '1024px'
      }
    }
  });
  t.deepEqual(css.cssVars, {
    'breakpoint-desktop-wide': '100vw',
    'breakpoint-desktop': '1339px'
  });
  t.deepEqual(css.customMedia, {
    'desktop-wide-down': '(max-width: 100vw)',
    'desktop-wide': '(max-width: 100vw)',
    'desktop-wide-only': '(min-width: 1400px)',
    'desktop-down': '(max-width: 1339px)',
    'desktop-up': '(min-width: 1024px)',
    desktop: '(max-width: 1339px)',
    'desktop-only': '(max-width: 1339px) and (min-width: 1024px)'
  });
  t.end();
});

tap.test('breakpoints in css', (t) => {
  const css = new ClientKitCss('breakpoints', {
    files: {
      'test/out/breakpoints.css': 'test/fixtures/breakpoints.css'
    },
    breakpoints: {
      'breakpoint-desktop': '1339px',
      'breakpoint-desktop-wide': '100vw',
      'desktop-wide': {
        'max-width': '100vw',
        'min-width': '1440px'
      },
      desktop: {
        'max-width': '1439px',
        'min-width': '1024px'
      },
      tablet: {
        'max-width': '1023px',
        'min-width': '768px'
      },
      mobile: {
        'max-width': '767px',
        'min-width': '320px'
      }
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'breakpoints.css');
    t.end();
  });
});
