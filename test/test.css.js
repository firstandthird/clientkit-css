'use strict';
const tap = require('tap');
const CssTask = require('../css.js');
const fs = require('fs');
tap.test('can compile css file with PostCss', (t) => {
  const task = new CssTask('css', {
    logColor: 'green',
    importPaths: [`${__dirname}/styles`],
    mixinPath: `${__dirname}/styles/mixins/*.css`,
    globalMixins: `${__dirname}/styles/globals`,
    minify: false,
    files: {
      'output.css': 'test.css'
    }
  }, {});
  task.execute(() => {

    t.end();
  });
});
