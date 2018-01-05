'use strict';

module.exports = function (config, postcss) {
  return function (mixin, bg) {
    return {
      'background-color': bg
    };
  };
};
