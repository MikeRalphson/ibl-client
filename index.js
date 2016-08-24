'use strict';

const Catbox = require('catbox').Client;
const flashheart = require('flashheart');
const Redis = require('catbox-redis');

const Client = require('./lib/client');

function createDefaultClient(opts) {
  if (opts.cacheHost && opts.cachePort) {
    opts.cache = new Catbox(new Redis({
      host: opts.cacheHost,
      port: opts.cachePort,
      partition: opts.partition || 'ibl-client'
    }));
  }

  return new Client(flashheart.createClient(opts));
}

module.exports.createClient = (opts) => {
  return createDefaultClient(opts || {});
};

module.exports.createCustomClient = (delegate) => {
  return new Client(delegate);
};
