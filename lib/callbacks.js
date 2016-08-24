'use strict';

module.exports = (promise, opts, cb) => {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  return promise.asCallback(cb);
};
