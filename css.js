'use strict';

const TaskKitTask = require('taskkit-task');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const csseasings = require('postcss-easings');
const cssimport = require('postcss-import');
const cssnext = require('postcss-cssnext');
const cssmixins = require('postcss-mixins');
const cssnested = require('postcss-nested');
const mqpacker = require('css-mqpacker');
const cssfonts = require('postcss-font-magician');
const inlinesvg = require('postcss-inline-svg');
const triangle = require('postcss-triangle');
const svgo = require('postcss-svgo');
const cssnano = require('cssnano');
const pathExists = require('path-exists');
const async = require('async');

const addVarObject = (curVarName, curVarValue, curObject) => {
  if (typeof curVarValue === 'object') {
    // for each key in the object, set object recursively:
    Object.keys(curVarValue).forEach((nextVarName) => {
      addVarObject(`${curVarName}-${nextVarName}`, curVarValue[nextVarName], curObject);
    });
    return;
  }
  curObject[curVarName] = curVarValue;
};

class CSSTask extends TaskKitTask {
  init() {
    this.setup();
  }

  get description() {
    // istanbul ignore next
    return 'compiles and minify source-mapped stylesheets for your project, and generates a handy design guide to help visualize it';
  }

  // returns the module to load when running in a separate process:
  get classModule() {
    // istanbul ignore next
    return path.join(__dirname, 'css.js');
  }

  updateOptions (newOptions) {
    /* istanbul ignore next */
    super.updateOptions(newOptions);
    /* istanbul ignore next */
    this.setup();
  }

  setup() {
    const config = this.options;
    this.cssVars = {};
    this.customMedia = {};
    // load css variables:
    if (config.color) {
      Object.keys(config.color).forEach(color => {
        this.cssVars[`color-${color}`] = config.color[color];
      });
    }
    if (typeof config.spacing === 'object' && config.spacing.default) {
      Object.keys(config.spacing.default).forEach(spacing => {
        this.cssVars[`spacing-${spacing}`] = config.spacing.default[spacing];
      });
    }
    if (config.grid) {
      Object.keys(config.grid).forEach(prop => {
        this.cssVars[`grid-${prop}`] = config.grid[prop];
      });
    }
    if (config.vars) {
      Object.keys(config.vars).forEach(varName => {
        addVarObject(varName, config.vars[varName], this.cssVars);
      });
    }
    // load spacing variables:
    if (config.breakpoints) {
      Object.keys(config.breakpoints).forEach((breakpoint, i, bps) => {
        const breakpointObj = {
          min: config.breakpoints[breakpoint]['min-width'],
          max: config.breakpoints[breakpoint]['max-width'],
        };
        const width = config.breakpoints[breakpoint]['max-width'];
        const mediaquery = `(max-width: ${width})`;
        let mediaqueryOnly;

        if (i === 0) {
          mediaqueryOnly = `(min-width: ${breakpointObj.min})`;
        } else {
          mediaqueryOnly = `(max-width: ${breakpointObj.max}) and (min-width: ${breakpointObj.min})`;
        }

        // Last one should be mobile, so no down
        if (i !== bps.length < 1) {
          this.customMedia[`${breakpoint}-down`] = `(max-width: ${breakpointObj.max})`;
        }

        // First one should be wide desktop so no up
        if (i !== 0) {
          this.customMedia[`${breakpoint}-up`] = `(min-width: ${breakpointObj.min})`;
        }

        this.cssVars[`breakpoint-${breakpoint}`] = width;
        this.customMedia[breakpoint] = mediaquery;
        this.customMedia[`${breakpoint}-only`] = mediaqueryOnly;
      });
    }

    // load mixins:
    let globalMixins = {};
    if (config.globalMixins) {
      try {
        globalMixins = require('require-all')({
          dirname: path.join(config.globalMixins),
          resolve: m => m(config, postcss)
        });
      } catch (e) {
        // istanbul ignore next
        this.log(e);
      }
    }
    if (config.assetPath && pathExists.sync(path.join(config.assetPath, 'mixins'))) {
      const localMixins = require('require-all')({
        dirname: path.join(config.assetPath, 'mixins'),
        resolve: m => m(config, postcss)
      });
      Object.assign(globalMixins, localMixins);
    }

    this.mixins = globalMixins;
  }

  process(input, outputFilename, callback) {
    const processes = [
      cssimport({
        path: this.options.importPaths
      }),
      cssmixins({
        mixins: this.mixins,
        mixinsFiles: this.options.mixinPath
      }),
      csseasings(),
      inlinesvg(),
      svgo(),
      triangle(),
      cssnested(),
      cssnext({
        warnForDuplicates: false,
        features: {
          customProperties: {
            variables: this.cssVars,
            strict: false
          },
          customMedia: {
            extensions: this.customMedia
          },
          autoprefixer: this.options.autoprefixer,
          nesting: false
        }
      }),
      mqpacker({
        sort: (a, b) => {
          const reg = /\((max|min)-width: (\d+)(px|vw)\)/i;
          const aVal = a.match(reg);
          const bVal = b.match(reg);
          const av = aVal ? ~~aVal[2] : 0;
          const bv = bVal ? ~~bVal[2] : 0;

          return bv - av;
        }
      })
    ];
    // Only run fonts against default.css to avoid duplicates
    if (input.match(this.options.fontParsingWhitelist)) {
      processes.push(cssfonts({
        foundries: ['custom', 'hosted', 'google']
      }));
    }

    // minify if specified in config files:
    if (this.options.minify) {
      const options = this.options.minifyOptions || {
        zindex: false,
        reduceIdents: false
      };

      processes.push(cssnano(options));
    }
    async.autoInject({
      contents: (done) => {
        fs.readFile(input, done);
      },
      pcss: (contents, done) => {
        let map = {
          inline: false
        };

        if (this.options.sourcemap === false) {
          map = false;
        }

        postcss(processes)
          .process(contents, { from: input, to: outputFilename, map })
          .then(result => { done(null, result); });
      },
      messages: (pcss, done) => {
        // istanbul ignore next
        if (pcss.messages) {
          pcss.messages.forEach(message => {
            if (message.text) {
              this.log([message.type], `${message.text} [${message.plugin}]`);
            }
          });
        }
        done();
      },
      sourcemaps: (pcss, done) => {
        // write the source map if indicated:
        if (pcss.map && this.options.sourcemap !== false) {
          this.write(`${outputFilename}.map`, JSON.stringify(pcss.map), done);
        } else {
          return done();
        }
      },
      write: (sourcemaps, pcss, done) => {
        this.write(outputFilename, pcss.css, done);
      }
    }, callback);
  }
}
module.exports = CSSTask;
