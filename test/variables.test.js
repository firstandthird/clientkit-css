const tap = require('tap');
const ClientKitCss = require('../');
const utils = require('./utils');

tap.test('variables', (t) => {
  const css = new ClientKitCss('vars', {
    vars: {
      'line-height': 1
    }
  });
  t.deepEqual(css.cssVars, {
    'line-height': 1
  });
  t.end();
});

tap.test('nested variables', (t) => {
  const css = new ClientKitCss('vars', {
    vars: {
      font: {
        primary: 'Arial',
        secondary: 'Helvetica'
      }
    }
  });
  t.deepEqual(css.cssVars, {
    'font-primary': 'Arial',
    'font-secondary': 'Helvetica'
  });
  t.end();
});

tap.test('variables in css', (t) => {
  const css = new ClientKitCss('vars', {
    files: {
      'test/out/variables.css': 'test/fixtures/variables.css'
    },
    vars: {
      'line-height': 1,
      'h2-line-height': 1.2,
      font: {
        primary: 'Arial',
        secondary: 'Helvetica'
      }
    }
  });
  css.execute((err, results) => {
    t.equal(err, null);
    utils.checkOutput(t, 'variables.css');
    t.end();
  });
});
