'use strict';

const _ = require('lodash');
const Request = require('./request');
const registerCallback = require('./callbacks');

const defaultHostBaseUrl = 'http://ibl.api.bbci.co.uk/ibl/v1';

const groupEpisodes = 'group_episodes';
const programmeEpisodes = 'programme_episodes';
const episodeRecommendations = 'episode_recommendations';
const categoryProgrammes = 'category_programmes';
const categoryHighlights = 'category_highlights';
const channelHighlights = 'channel_highlights';
const channelBroadcasts = 'broadcasts';
const homeHighlights = 'home_highlights';
const categories = 'categories';
const channels = 'channels';

function isValidId(id) {
  return id && (typeof id === 'string');
}

function isSingleEpisode(pids) {
  return !_.isArray(pids);
}

function createMultiPidPath(pids, path) {
  if (isSingleEpisode(pids)) {
    pids = [pids];
  }
  return `/${path}/` + pids.join(',');
}

class Client {
  constructor(delegate, baseUrl) {
    this.request = Request.create(delegate, baseUrl || defaultHostBaseUrl);
  }

  getStaticList(args) {
    let path = args.path;
    const id = args.id;
    const responseProperty = args.responseProperty;
    const cb = args.callback;

    if (isValidId(id)) {
      path = path + `/${id}`;
      return registerCallback(this.request.get(path), cb);
    }

    const response = this.request.getWithPropertyFilter(path, responseProperty);
    return registerCallback(response, id, cb);
  }

  get(args) {
    const path = args.path;
    const opts = args.requestOptions;
    const responseProperty = args.responseProperty;
    const cb = args.callback;

    const auto = opts && opts.autoPaginate;
    let response;
    if (auto) {
      response = this.request.getWithAutoPagination(path, responseProperty, opts);
    } else {
      response = this.request.getWithPropertyFilter(path, responseProperty, opts);
    }

    return registerCallback(response, opts, cb);
  }

  getEpisodes(pids, opts, cb) {
    const pathBase = 'episodes';

    return this.get({
      path: createMultiPidPath(pids, pathBase),
      requestOptions: opts,
      responseProperty: 'episodes',
      callback: cb
    });
  }

  getGroupEpisodes(groupId, opts, cb) {
    return this.get({
      path: `/groups/${groupId}/episodes`,
      requestOptions: opts,
      responseProperty: groupEpisodes,
      callback: cb
    });
  }

  getPopularEpisodes(opts, cb) {
    return this.getGroupEpisodes('popular', opts, cb);
  }

  getEpisodeRecommendations(episodeId, opts, cb) {
    return this.get({
      path: `/episodes/${episodeId}/recommendations`,
      requestOptions: opts,
      responseProperty: episodeRecommendations,
      callback: cb
    });
  }

  getProgrammeEpisodes(programmeId, opts, cb) {
    return this.get({
      path: `/programmes/${programmeId}/episodes`,
      requestOptions: opts,
      responseProperty: programmeEpisodes,
      callback: cb
    });
  }

  getProgrammes(pids, opts, cb) {
    const pathBase = 'programmes';

    return this.get({
      path: createMultiPidPath(pids, pathBase),
      requestOptions: opts,
      responseProperty: 'programmes',
      callback: cb
    });
  }

  getCategoryProgrammes(category, opts, cb) {
    return this.get({
      path: `/categories/${category}/programmes`,
      requestOptions: opts,
      responseProperty: categoryProgrammes,
      callback: cb
    });
  }

  getCategoryHighlights(categoryId, opts, cb) {
    return this.get({
      path: `/categories/${categoryId}/highlights`,
      requestOptions: opts,
      responseProperty: categoryHighlights,
      callback: cb
    });
  }

  getChannelHighlights(channelId, opts, cb) {
    return this.get({
      path: `/channels/${channelId}/highlights`,
      requestOptions: opts,
      responseProperty: channelHighlights,
      callback: cb
    });
  }

  getHomeHighlights(opts, cb) {
    return this.get({
      path: '/home/highlights',
      requestOptions: opts,
      responseProperty: homeHighlights,
      callback: cb
    });
  }

  getChannelBroadcasts(channelId, opts, cb) {
    return this.get({
      path: `/channels/${channelId}/broadcasts`,
      requestOptions: opts,
      responseProperty: channelBroadcasts,
      callback: cb
    });
  }

  getCategories(id, cb) {
    return this.getStaticList({
      path: '/categories',
      responseProperty: categories,
      id: id,
      callback: cb
    });
  }

  getChannels(id, cb) {
    return this.getStaticList({
      path: '/channels',
      responseProperty: channels,
      id: id,
      callback: cb
    });
  }
}

module.exports = Client;
