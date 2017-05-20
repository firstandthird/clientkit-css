'use strict';

const RunKitTask = require('runkit-task');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssimport = require('postcss-import');
const cssnext = require('postcss-cssnext');
const cssmixins = require('postcss-mixins');
const mqpacker = require('css-mqpacker');
const cssfonts = require('postcss-font-magician');
const inlinesvg = require('postcss-inline-svg');
const triangle = require('postcss-triangle');
const svgo = require('postcss-svgo');
const cssnano = require('cssnano');
const pathExists = require('path-exists');
const mdcss = require('mdcss');
const mdcssTheme = require('mdcss-theme-clientkit');
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

class CSSTask extends RunKitTask {
  init() {
    this.setup();
  }

  get description() {
    return 'compiles and minify source-mapped stylesheets for your project, and generates a handy design guide to help visualize it';
  }

  // returns the module to load when running in a separate process:
  get classModule() {
    return path.join(__dirname, 'css.js');
  }

  get defaultOptions() {
    return {
      multithread: true,
    };
  }

  updateOptions(newOptions) {
    super.updateOptions(newOptions);
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
    if (config.easing) {
      Object.keys(config.easing).forEach(prop => {
        this.cssVars[`easing-${prop}`] = config.easing[prop];
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
        const constraint = config.mobileFirst ? 'min' : 'max';
        const width = breakpointObj[constraint];
        const mediaquery = `(${constraint}-width: ${width})`;
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
    let globalMixins;
    try {
      globalMixins = require('require-all')({
        dirname: path.join(config.globalMixins),
        resolve: m => m(config, postcss)
      });
    } catch (e) {
      this.log(e);
    }
    if (pathExists.sync(path.join(config.assetPath, 'mixins'))) {
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
      inlinesvg(),
      svgo(),
      triangle(),
      cssnext({
        warnForDuplicates: false,
        features: {
          customProperties: {
            variables: this.cssVars
          },
          customMedia: {
            extensions: this.customMedia
          },
          autoprefixer: this.options.autoprefixer
        }
      }),
      mqpacker({
        sort: (a, b) => {
          const reg = /\((max|min)-width: (\d+)(px|vw)\)/i;
          const aVal = a.match(reg);
          const bVal = b.match(reg);
          const av = aVal ? ~~aVal[2] : 0;
          const bv = bVal ? ~~bVal[2] : 0;

          let ret = bv - av;

          if (this.options.mobileFirst) {
            ret *= -1;
          }

          return ret;
        }
      })
    ];
    // Only run fonts against default.css to avoid duplicates
    if (input.match(this.options.fontParsingWhitelist)) {
      processes.push(cssfonts({
        foundries: ['custom', 'hosted', 'google']
      }));
    }

    if (this.options.docs && this.options.docs.enabled && input.match(this.options.docs.input)) {
      processes.push(mdcss({
        theme: mdcssTheme({
          title: this.options.docs.title,
          logo: '',
          colors: this.options.color,
          variables: this.cssVars,
          css: [
            'style.css',
            path.join(this.options, 'clientkit.css')
          ],
          examples: {
            css: this.options.docs.css
          },
          info: {
            clientkitVersion: this.options.clientkitVersion
          },
          sectionOrder: this.options.docs.sectionOrder
        }),
        destination: path.join(this.options.dist.replace(process.cwd(), ''), 'styleguide')
      }));
    }

    // minify if specified in config files:
    if (this.options.minify) {
      processes.push(cssnano({ zindex: false }));
    }
    async.autoInject({
      contents: (done) => {
        fs.readFile(input, done);
      },
      postcss: (contents, done) => {
        postcss(processes).process(contents, { from: input, to: outputFilename, map: { inline: false } })
        .then(result => {
          done(null, result);
        });
      },
      messages: (postcss, done) => {
        if (postcss.messages) {
          postcss.messages.forEach(message => {
            if (message.text) {
              this.log([message.type], `${message.text} [${message.plugin}]`);
            }
          });
        }
        done();
      },
      sourcemaps: (postcss, done) => {
        // write the source map if indicated:
        if (postcss.map && this.options.sourcemap !== false) {
          this.write(`${outputFilename}.map`, JSON.stringify(postcss.map), done);
        } else {
          return done();
        }
      },
      write: (sourcemaps, postcss, done) => {
        this.write(outputFilename, postcss.css, done);
      }
    }, callback);
  }
}
module.exports = CSSTask;
