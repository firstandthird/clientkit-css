'use strict';

module.exports = function (config, postcss) {
  return function (mixin, size) {
    return {
      'height': size,
      'width': size
    };
  };
};
