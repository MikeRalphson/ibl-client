'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

function toRequestOptions(opts) {
  const copy = _.cloneDeep(opts);

  return {
    qs: copy
  };
}

class Request {
  constructor(delegate, baseUrl) {
    this.baseUrl = baseUrl;
    this.client = Promise.promisifyAll(delegate);
  }

  createUrl(path) {
    path = path.replace('/', '');
    return [this.baseUrl, path].join('/');
  }

  autoPaginate(path, responseProperty, opts, results) {
    return this.getWithPropertyFilter(path, responseProperty, opts)
      .then((res) => {
        results.push(res);

        if (res.count > res.page * res.per_page) {
          opts.page += 1;
          return this.autoPaginate(path, responseProperty, opts, results);
        }

        return Promise.resolve(results);
      });
  }

  get(path, opts) {
    return this.client.getAsync(this.createUrl(path), toRequestOptions(opts));
  }

  getWithPropertyFilter(path, responseProperty, opts) {
    return this.get(path, opts)
      .then((res) => {
        return res[responseProperty];
      });
  }

  getWithAutoPagination(path, responseProperty, opts) {
    opts = _.omit(opts, 'autoPaginate');
    _.defaults(opts, {
      page: 1,
      per_page: 20
    });

    return Promise.all(this.autoPaginate(path, responseProperty, opts, []));
  }
}

module.exports.create = (httpClient, baseUrl) => {
  return new Request(httpClient, baseUrl);
};
