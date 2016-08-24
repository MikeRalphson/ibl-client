'use strict';

const _ = require('lodash');
const assert = require('assert');
const nock = require('nock');

const Client = require('../index');
const baseUrl = 'http://ibl.api.bbci.co.uk/ibl/v1';

function assertResponse(response, expected) {
  return response
    .catch(assert.ifError)
    .then((actual) => {
      assert.deepEqual(actual, expected);
    });
}

describe('iPlayer Business Layer Client', () => {
  let client;

  beforeEach(() => {
    nock.disableNetConnect();
    nock.cleanAll();

    client = Client.createClient({
      retries: 0
    });
  });

  describe('.getEpisodes(episodes, opts)', () => {
    const episodesResponse = require('./fixtures/episodes');
    const requestPids = ['p03c0hx5', 'p03bm6zg'];

    beforeEach(() => {
      nock(baseUrl).get('/episodes/p03c0hx5,p03bm6zg').reply(200, episodesResponse);
    });

    it('returns an array of Episodes', () => {
      const response = client.getEpisodes(requestPids);
      return assertResponse(response, episodesResponse.episodes);
    });

    it('returns an array containing a single episode', () => {
      nock(baseUrl).get('/episodes/p03c0hx5').reply(200, episodesResponse);

      const response = client.getEpisodes('p03c0hx5');
      return assertResponse(response, episodesResponse.episodes);
    });

    it('supports getting episodes using callbacks', (done) => {
      client.getEpisodes(requestPids, (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, episodesResponse.episodes);
        done();
      });
    });

    it('makes a request using the availability query parameter', () => {
      nock(baseUrl)
        .get('/episodes/p03c0hx6,p04bm6zg?availability=available')
        .reply(200, episodesResponse);

      const response = client.getEpisodes(['p03c0hx6', 'p04bm6zg'], {
        availability: 'available'
      });
      return assertResponse(response, episodesResponse.episodes);
    });

    it('makes a request using the rights query parameter', () => {
      nock(baseUrl)
        .get('/episodes/p03c0hx7,p04bm6z7?availability=available&rights=mobile')
        .reply(200, episodesResponse);

      const response = client.getEpisodes(['p03c0hx7', 'p04bm6z7'], {
        availability: 'available',
        rights: 'mobile'
      });
      return assertResponse(response, episodesResponse.episodes);
    });

    it('makes a request for request for a single episode', () => {
      const expectedResponse = require('./fixtures/singleEpisode');
      nock(baseUrl).get('/episodes/p03c0hx5').reply(200, expectedResponse);

      const response = client.getEpisodes('p03c0hx5');
      return assertResponse(response, expectedResponse.episodes);
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/episodes/pid1,pid2').reply(500);

      return client.getEpisodes(['pid1', 'pid2'])
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getProgrammes(programmes, opts)', () => {
    const programmesResponse = require('./fixtures/programmes/programme.json');
    const requestPids = ['p022ktzy', 'b006wz6r'];

    beforeEach(() => {
      nock(baseUrl).get('/programmes/p022ktzy,b006wz6r').reply(200, programmesResponse);
    });

    it('returns an array of Programmes', () => {
      const response = client.getProgrammes(requestPids);
      return assertResponse(response, programmesResponse.programmes);
    });

    it('supports getting programmes using callbacks', (done) => {
      client.getProgrammes(requestPids, (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, programmesResponse.programmes);
        done();
      });
    });

    it('makes a request using the availability query parameter', () => {
      const expectedResponse = require('./fixtures/programmes/programmesAvailable');

      nock(baseUrl)
        .get('/programmes/p022ktzy2,b006wz6r2?availability=available')
        .reply(200, expectedResponse);

      const response = client.getProgrammes(['p022ktzy2', 'b006wz6r2'], {
        availability: 'available'
      });
      return assertResponse(response, expectedResponse.programmes);
    });

    it('makes a request using the rigths query parameter', () => {
      nock(baseUrl)
        .get('/programmes/p022ktzy3,b006wz6r3?availability=available&rights=tv')
        .reply(200, programmesResponse);

      const response = client.getProgrammes(['p022ktzy3', 'b006wz6r3'], {
        availability: 'available',
        rights: 'tv'
      });
      return assertResponse(response, programmesResponse.programmes);
    });

    it('makes a request using the initial_child_count query parameter');

    it('makes a request for request for a single Programme', () => {
      const expectedResponse = require('./fixtures/programmes/singleProgramme');
      nock(baseUrl).get('/programmes/p022ktzy4').reply(200, expectedResponse);

      const response = client.getProgrammes('p022ktzy4');
      return assertResponse(response, expectedResponse.programmes);
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/programmes/pid1,pid2').reply(500);

      return client.getProgrammes(['pid1', 'pid2'])
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getProgrammeEpisodes(pid, opts)', () => {
    const programmeEpisodesResponse = require('./fixtures/programmeEpisodes');

    beforeEach(() => {
      nock(baseUrl).get('/programmes/pid1/episodes').reply(200, programmeEpisodesResponse);
    });

    it('requests the programme episodes feed with correct pid', () => {
      nock(baseUrl).get('/programmes/pid1/episodes').reply(200, programmeEpisodesResponse);
      return client.getProgrammeEpisodes('pid1');
    });

    it('returns the programme_episodes object', () => {
      const response = client.getProgrammeEpisodes('pid1');
      return assertResponse(response, programmeEpisodesResponse.programme_episodes);
    });

    it('supports getting programme episodes using callbacks', (done) => {
      client.getProgrammeEpisodes('pid1', (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, programmeEpisodesResponse.programme_episodes);
        done();
      });
    });

    it('passes the correct query string parameters', () => {
      nock(baseUrl).get('/programmes/pid1/episodes?per_page=10&rights=web').reply(200, programmeEpisodesResponse);
      return client.getProgrammeEpisodes('pid1', {
        per_page: 10,
        rights: 'web'
      });
    });

    it('returns an error if the API errors', () => {
      nock(baseUrl).get('/programmes/pid1/episodes').reply(500);
      return client.getProgrammeEpisodes('pid1')
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getEpisodeRecommendations(pid, opts)', () => {
    const episodeRecommendaitonsResponse = require('./fixtures/episodeRecommendations');

    beforeEach(() => {
      nock(baseUrl).get('/episodes/pid1/recommendations').reply(200, episodeRecommendaitonsResponse);
    });

    it('requests the episode recomendations feed with correct pid', () => {
      nock(baseUrl).get('/episodes/pid1/recommendations').reply(200, episodeRecommendaitonsResponse);
      return client.getEpisodeRecommendations('pid1');
    });

    it('returns the episode_recommendations object', () => {
      const response = client.getEpisodeRecommendations('pid1');
      return assertResponse(response, episodeRecommendaitonsResponse.episode_recommendations);
    });

    it('passes the correct query string parameters', () => {
      nock(baseUrl).get('/episodes/pid1/recommendations?per_page=10&rights=web').reply(200, episodeRecommendaitonsResponse);
      return client.getEpisodeRecommendations('pid1', {
        per_page: 10,
        rights: 'web'
      });
    });

    it('supports getting episode recommendations using callbacks', (done) => {
      client.getEpisodeRecommendations('pid1', (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, episodeRecommendaitonsResponse.episode_recommendations);
        done();
      });
    });

    it('returns an error if the API errors', () => {
      nock(baseUrl).get('/episodes/pid1/recommendations').reply(500);
      return client.getEpisodeRecommendations('pid1')
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getCatagoryProgrammes', () => {
    const programmesResponse = require('./fixtures/programmes/wales.json');

    beforeEach(() => {
      nock(baseUrl).get('/categories/wales/programmes').reply(200, programmesResponse);
    });

    it('returns a categories programmes object', () => {
      const response = client.getCategoryProgrammes('wales');
      return assertResponse(response, programmesResponse.category_programmes);
    });

    it('supports getting category programmes using callbacks', (done) => {
      client.getCategoryProgrammes('wales', (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, programmesResponse.category_programmes);
        done();
      });
    });

    it('makes a request using the rigths query parameter', () => {
      nock(baseUrl)
        .get('/categories/wales/programmes?rights=tv')
        .reply(200, programmesResponse);

      const response = client.getCategoryProgrammes('wales', {
        rights: 'tv'
      });
      return assertResponse(response, programmesResponse.category_programmes);
    });

    it('makes a request using the sort query parameter', () => {
      nock(baseUrl)
        .get('/categories/wales/programmes?sort=recent')
        .reply(200, programmesResponse);

      return client.getCategoryProgrammes('wales', {
        sort: 'recent'
      });
    });

    it('makes a request using the sort_direction query parameter', () => {
      nock(baseUrl)
        .get('/categories/wales/programmes?sort_direction=desc')
        .reply(200, programmesResponse);

      return client.getCategoryProgrammes('wales', {
        sort_direction: 'desc'
      });
    });

    it('makes a request using the page query parameter', () => {
      nock(baseUrl)
        .get('/categories/wales/programmes?page=10')
        .reply(200, programmesResponse);

      return client.getCategoryProgrammes('wales', {
        page: 10
      });
    });

    it('makes a request using the per_page query parameter', () => {
      nock(baseUrl)
        .get('/categories/wales/programmes?per_page=5')
        .reply(200, programmesResponse);

      return client.getCategoryProgrammes('wales', {
        per_page: 5
      });
    });

    it('makes a request using the initial_child_count query parameter', () => {
      nock(baseUrl)
        .get('/categories/wales/programmes?initial_child_count=2')
        .reply(200, programmesResponse);

      return client.getCategoryProgrammes('wales', {
        initial_child_count: 2
      });
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/categories/wales/programmes').reply(500);

      return client.getCategoryProgrammes('wales')
        .catch((e) => {
          assert.ok(e);
        });
    });

    describe('autoPaginate', () => {
      it('automatically paginates all pages', () => {
        // end range boundary exclusive i.e actually 1, 2, 3
        _.range(1, 4).forEach((i) => {
          nock(baseUrl)
            .get(`/categories/wales/programmes?per_page=2&page=${i}`)
            .reply(200, require(`./fixtures/programmes/autoPage${i}.json`));
        });

        const response = client.getCategoryProgrammes('wales', {
          autoPaginate: true,
          per_page: 2
        });

        return response.then((allPages) => {
          assert.equal(allPages.length, 3);
        });
      });

      it('uses a default pagination values', () => {
        nock(baseUrl)
          .get('/categories/wales/programmes?page=1&per_page=20')
          .reply(200, require('./fixtures/programmes/autoDefaults'));

        return client.getCategoryProgrammes('wales', {
          autoPaginate: true
        });
      });
    });
  });

  describe('.getGroupEpisodes(pid, opts)', () => {
    const groupEpisodesResponse = require('./fixtures/groupEpisodes');

    beforeEach(() => {
      nock(baseUrl).get('/groups/pid1/episodes').reply(200, groupEpisodesResponse);
    });

    it('requests the group episodes feed with correct pid', () => {
      nock(baseUrl).get('/groups/pid1/episodes').reply(200, groupEpisodesResponse);
      return client.getGroupEpisodes('pid1');
    });

    it('returns the group_episodes object', () => {
      const response = client.getGroupEpisodes('pid1');
      return assertResponse(response, groupEpisodesResponse.group_episodes);
    });

    it('supports getting group episodes using callbacks', (done) => {
      client.getGroupEpisodes('pid1', (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, groupEpisodesResponse.group_episodes);
        done();
      });
    });

    it('passes the correct query string parameters', () => {
      nock(baseUrl).get('/groups/pid1/episodes?per_page=10&rights=web').reply(200, groupEpisodesResponse);
      return client.getGroupEpisodes('pid1', {
        per_page: 10,
        rights: 'web'
      });
    });

    it('returns an error if the API errors', () => {
      nock(baseUrl).get('/groups/pid1/episodes').reply(500);
      return client.getGroupEpisodes('pid1')
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getPopularEpisodes(opts)', () => {
    const popularEpisodesResponse = require('./fixtures/popularEpisodes');

    beforeEach(() => {
      nock(baseUrl).get('/groups/popular/episodes').reply(200, popularEpisodesResponse);
    });

    it('requests the group episodes feed with correct pid', () => {
      nock(baseUrl).get('/groups/popular/episodes').reply(200, popularEpisodesResponse);
      return client.getPopularEpisodes();
    });

    it('returns the group_episodes object', () => {
      const response = client.getPopularEpisodes();
      return assertResponse(response, popularEpisodesResponse.group_episodes);
    });

    it('supports getting group episodes using callbacks', (done) => {
      client.getPopularEpisodes((err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, popularEpisodesResponse.group_episodes);
        done();
      });
    });

    it('passes the correct query string parameters', () => {
      nock(baseUrl).get('/groups/popular/episodes?per_page=10&rights=web').reply(200, popularEpisodesResponse);
      return client.getPopularEpisodes({
        per_page: 10,
        rights: 'web'
      });
    });

    it('returns an error if the API errors', () => {
      nock(baseUrl).get('/groups/popular/episodes').reply(500);
      return client.getPopularEpisodes()
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getCategoryHighlights', () => {
    const categoryHighlightsResponse = require('./fixtures/highlights/walesCategory');
    const categoryId = 'wales';

    beforeEach(() => {
      nock(baseUrl).get(`/categories/${categoryId}/highlights`).reply(200, categoryHighlightsResponse);
    });

    it('returns category_highlights object', () => {
      const response = client.getCategoryHighlights(categoryId);
      return assertResponse(response, categoryHighlightsResponse.category_highlights);
    });

    it('supports getting category_highlights using callbacks', (done) => {
      client.getCategoryHighlights(categoryId, (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, categoryHighlightsResponse.category_highlights);
        done();
      });
    });

    it('makes a request using the rigths query parameter', () => {
      nock(baseUrl)
        .get('/categories/wales/highlights?rights=tv')
        .reply(200, categoryHighlightsResponse);

      const response = client.getCategoryHighlights('wales', {
        rights: 'tv'
      });
      return assertResponse(response, categoryHighlightsResponse.category_highlights);
    });

    it('makes a request using the mixin query parameter', () => {
      nock(baseUrl)
        .get('/categories/wales/highlights?mixin=promotions')
        .reply(200, categoryHighlightsResponse);

      const response = client.getCategoryHighlights('wales', {
        mixin: 'promotions'
      });
      return assertResponse(response, categoryHighlightsResponse.category_highlights);
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/categories/wales/highlights?rights=mobile').reply(500);

      return client.getProgrammes('wales', {
          rights: 'mobile'
        })
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getChannelHighlights', () => {
    const channelHighlightsResponse = require('./fixtures/highlights/cbbcChannel');
    const channelId = 'cbbc';

    beforeEach(() => {
      nock(baseUrl).get(`/channels/${channelId}/highlights`).reply(200, channelHighlightsResponse);
    });

    it('returns channel_highlights object', () => {
      const response = client.getChannelHighlights(channelId);
      return assertResponse(response, channelHighlightsResponse.channel_highlights);
    });

    it('supports getting channel_highlights using callbacks', (done) => {
      client.getChannelHighlights(channelId, (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, channelHighlightsResponse.channel_highlights);
        done();
      });
    });

    it('makes a request using the rigths query parameter', () => {
      nock(baseUrl)
        .get('/channels/cbbc/highlights?rights=tv')
        .reply(200, channelHighlightsResponse);

      const response = client.getChannelHighlights('cbbc', {
        rights: 'tv'
      });
      return assertResponse(response, channelHighlightsResponse.channel_highlights);
    });

    it('makes a request using the mixin query parameter', () => {
      nock(baseUrl)
        .get('/channels/cbbc/highlights?mixin=promotions')
        .reply(200, channelHighlightsResponse);

      const response = client.getChannelHighlights('cbbc', {
        mixin: 'promotions'
      });
      return assertResponse(response, channelHighlightsResponse.channel_highlights);
    });

    it('makes a request using the isLive query parameter', () => {
      nock(baseUrl)
        .get('/channels/cbbc/highlights?isLive=true')
        .reply(200, channelHighlightsResponse);

      const response = client.getChannelHighlights('cbbc', {
        isLive: true
      });
      return assertResponse(response, channelHighlightsResponse.channel_highlights);
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/channels/cbbc/highlights?rights=mobile').reply(500);

      return client.getProgrammes('cbbc', {
          rights: 'mobile'
        })
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getHomeHighlights', () => {
    const homeHighlightsResponse = require('./fixtures/highlights/home');

    beforeEach(() => {
      nock(baseUrl).get(`/home/highlights`).reply(200, homeHighlightsResponse);
    });

    it('returns channel_highlights object', () => {
      const response = client.getHomeHighlights();
      return assertResponse(response, homeHighlightsResponse.home_highlights);
    });

    it('supports getting home_highlights using callbacks', (done) => {
      client.getHomeHighlights((err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, homeHighlightsResponse.home_highlights);
        done();
      });
    });

    it('makes a request using the rigths query parameter', () => {
      nock(baseUrl)
        .get('/home/highlights?rights=tv')
        .reply(200, homeHighlightsResponse);

      const response = client.getHomeHighlights({
        rights: 'tv'
      });
      return assertResponse(response, homeHighlightsResponse.home_highlights);
    });

    it('makes a request using the mixin query parameter', () => {
      nock(baseUrl)
        .get('/home/highlights?mixin=promotions')
        .reply(200, homeHighlightsResponse);

      const response = client.getHomeHighlights({
        mixin: 'promotions'
      });
      return assertResponse(response, homeHighlightsResponse.home_highlights);
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/home/highlights?rights=mobile').reply(500);

      return client.getHomeHighlights({
          rights: 'mobile'
        })
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getCategories', () => {
    const categories = require('./fixtures/categories.json');
    const comedy = categories.categories[3];

    beforeEach(() => {
      nock(baseUrl).get('/categories/comedy').reply(200, comedy);
      nock(baseUrl).get('/categories').reply(200, categories);
    });

    it('returns a list of all categories', () => {
      const response = client.getCategories();
      return assertResponse(response, categories.categories);
    });

    it('returns a category for a given id', () => {
      const response = client.getCategories('comedy');
      return assertResponse(response, comedy);
    });

    it('supports getting a category using callbacks', (done) => {
      client.getCategories('comedy', (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, comedy);
        done();
      });
    });

    it('supports getting categories using callbacks', (done) => {
      client.getCategories((err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, categories.categories);
        done();
      });
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/categories').reply(500);

      return client.getCategories()
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getChannels', () => {
    const channels = require('./fixtures/channels.json');
    const bbcThree = channels.channels[3];

    beforeEach(() => {
      nock(baseUrl).get('/channels').reply(200, channels);
    });

    it('returns a list of all channels', () => {
      const response = client.getChannels();
      return assertResponse(response, channels.channels);
    });

    it('returns a channel for a given id', () => {
      nock(baseUrl).get('/channels/bbc_three').reply(200, bbcThree);

      const response = client.getChannels('bbc_three');
      return assertResponse(response, bbcThree);
    });

    it('supports getting a channel using callbacks', (done) => {
      client.getChannels((err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, channels.channels);
        done();
      });
    });

    it('supports getting channels using callbacks', (done) => {
      client.getChannels((err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, channels.channels);
        done();
      });
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/channels').reply(500);

      return client.getCategories()
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

  describe('.getChannelBroacasts', () => {
    const channelBroadcastsResponse = require('./fixtures/channelBroadcasts');
    const channelId = 'cbbc';

    beforeEach(() => {
      nock(baseUrl).get(`/channels/${channelId}/broadcasts`).reply(200, channelBroadcastsResponse);
    });

    it('returns broadcasts object', () => {
      const response = client.getChannelBroadcasts(channelId);
      return assertResponse(response, channelBroadcastsResponse.broadcasts);
    });

    it('supports getting broadcasts using callbacks', (done) => {
      client.getChannelBroadcasts(channelId, (err, response) => {
        assert.ifError(err);
        assert.deepEqual(response, channelBroadcastsResponse.broadcasts);
        done();
      });
    });

    it('makes a request using the rigths query parameter', () => {
      nock(baseUrl)
        .get('/channels/cbbc/broadcasts?rights=tv')
        .reply(200, channelBroadcastsResponse);

      const response = client.getChannelBroadcasts('cbbc', {
        rights: 'tv'
      });
      return assertResponse(response, channelBroadcastsResponse.broadcasts);
    });

    it('makes a request using the mixin query parameter', () => {
      nock(baseUrl)
        .get('/channels/cbbc/broadcasts?mixin=promotions')
        .reply(200, channelBroadcastsResponse);

      const response = client.getChannelBroadcasts('cbbc', {
        mixin: 'promotions'
      });
      return assertResponse(response, channelBroadcastsResponse.broadcasts);
    });

    it('makes a request using the from query parameter', () => {
      nock(baseUrl)
        .get('/channels/cbbc/broadcasts?from=2014-09-01')
        .reply(200, channelBroadcastsResponse);

      const response = client.getChannelBroadcasts('cbbc', {
        from: '2014-09-01'
      });
      return assertResponse(response, channelBroadcastsResponse.broadcasts);
    });

    it('makes a request using the from_date query parameter', () => {
      nock(baseUrl)
        .get('/channels/cbbc/broadcasts?from_date=2014-09-01')
        .reply(200, channelBroadcastsResponse);

      const response = client.getChannelBroadcasts('cbbc', {
        from_date: '2014-09-01'
      });
      return assertResponse(response, channelBroadcastsResponse.broadcasts);
    });

    it('returns an error when the API returns a 500', () => {
      nock(baseUrl).get('/channels/cbbc/broadcasts?rights=mobile').reply(500);

      return client.getProgrammes('cbbc', {
          rights: 'mobile'
        })
        .catch((e) => {
          assert.ok(e);
        });
    });
  });

});
