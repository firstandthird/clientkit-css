'use strict';

module.exports = function () {
  return function (mixin, bg) {
    const styles = {
      'background-color': bg
    };

    return styles;
  };
};
