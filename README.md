# ibl-client

> Client library written in Node.js for the iPlayer Business Layer (iBL)

## Installation

```
npm install @ibl/client
```

## Usage

```javascript
const client = require('@ibl/client').createClient({
  stats: require('@ibl/stats'),
  logger: require('@ibl/logger'),
});

client.getEpisodes()
  .then(console.log)
  .catch(console.error);

client.getEpisodes((err, episodes) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(episodes)
});
```

## API

#### `.createClient`

Creates a new client.

##### Parameters

* `opts` - An options object

##### Options

`createClient` supports all of the options supported by [ibl-rest-client](https://github.com/bbc/ibl-rest-client).

#### `.createCustomClient`

Creates a new client with a pre-configured http client.

##### Parameters

* delegate - pre-configured http client

### Programmes

#### `client.getProgrammes(programmePids, opts, cb) -> Promise`
##### Parameters

* `programmePids` - An Programme PID or an array of Programme PIDs
* `opts` - _optional_ - An object containing request parameters
  * rights
  * availability
  * initial_child_count
* cb - _optional_ - A function that is called with an error object and an array of programmes

##### Returns
* If the Promise fulfills, the fulfillment value is an array of Programmes

### Programme Episodes

#### `client.getProgrammeEpisodes(programmePid, opts, cb) -> Promise`
##### Parameters

* `programmePid` - A Programme PID
* `opts` - _optional_ - An object containing request parameters
* cb - _optional_ - A function that is called with an error object and programme_episodes object

##### Returns
* If the Promise fulfills, the fulfillment value is the programme_episodes object

#### `client.getEpisodeRecommendations(episodePid, opts, cb) -> Promise`
##### Parameters

* `episodePid` - A Episode PID
* `opts` - _optional_ - An object containing request parameters

##### Returns
* If the Promise fulfills, the fulfillment value is the episode_recommendations object
* cb - _optional_ - A function that is called with an error object and episode_recommendations object

### Episodes

#### `client.getEpisodes(episodePids, opts, cb) -> Promise`
##### Parameters

* `episodesPids` - An Episode PID or an array of Episode PIDs
* `opts` - _optional_ - An object containing request parameters
  * rights
  * availability
* cb - _optional_ - A function that is called with an error object and an array of episodes


##### Returns
* If the Promise fulfills, the fulfillment value is an array of episodes

### Category Programmes

#### `client.categoryProgrammes(category, opts, cb) -> Promise`
##### Parameters

* `category` - ibl category
* `opts` - _optional_ - An object containing request parameters
  * rights
  * availability
  * sort
  * sort_direction
  * initial_child_count
  * page
  * per_page
* cb - _optional_ - A function that is called with an error object and a category_programmes object


##### Returns
* If the Promise fulfills, the fulfillment value is a category_programmes object

### Group Episodes

#### `client.getGroupEpisodes(groupPid, opts, cb) -> Promise`
##### Parameters

* `groupPid` - A Group PID
* `opts` - _optional_ - An object containing request parameters
  * rights
  * page
  * per_page
* cb - _optional_ - A function that is called with an error object and a group_episodes object

##### Returns
* If the Promise fulfills, the fulfillment value is the group_episodes object

### Popular Episodes

#### `client.getPopularEpisodes(groupPid, opts, cb) -> Promise`
##### Parameters

* `opts` - _optional_ - An object containing request parameters
  * rights
  * page
  * per_page
* cb - _optional_ - A function that is called with an error object and a group_episodes object

##### Returns
* If the Promise fulfills, the fulfillment value is the group_episodes object

### Category Highlights

#### `client.getCategoryHighlights(categoryId, opts, cb) -> Promise`
##### Parameters

* `categoryId` - An iBL category
* `opts` - _optional_ - An object containing request parameters
  * rights
  * mixin
* cb - _optional_ - A function that is called with an error object and a category_highlights object

##### Returns
* If the Promise fulfills, the fulfillment value is the category_highlights object

### Channel Highlights

#### `client.getChannelHighlights(channelId, opts, cb) -> Promise`
##### Parameters

* `channelId` - An iBL category
* `opts` - _optional_ - An object containing request parameters
  * rights
  * mixin
  * isLive
* cb - _optional_ - A function that is called with an error object and a channel_highlights object

##### Returns
* If the Promise fulfills, the fulfillment value is the channel_highlights object

### Home Highlights

#### `client.getHomeHighlights(opts, cb) -> Promise`
##### Parameters

* `opts` - _optional_ - An object containing request parameters
  * rights
  * mixin
* cb - _optional_ - A function that is called with an error object and a home_highlights object

##### Returns
* If the Promise fulfills, the fulfillment value is the home_highlights object

### Categories

#### `client.getCategories(id, opts, cb) -> Promise`
##### Parameters

* `categoryId` - An iBL category id
* cb - _optional_ - A function that is called with an error object and a list of categories or a
  category object

##### Returns
* If the Promise fulfills, the fulfillment value is the list of channels or a
  channel object

### Channels

#### `client.getChannels(id, opts, cb) -> Promise`
##### Parameters

* `channelId` - An iBL channel id
* cb - _optional_ - A function that is called with an error object and a list of channels or a
  channel object

##### Returns
* If the Promise fulfills, the fulfillment value is the list of channels or a
  channel object

### Channel Broadcasts

#### `client.getChannelBroadcasts(id, opts, cb) -> Promise`
##### Parameters

* `channelId` - An iBL channel id
* `opts` - _optional_ - An object containing request parameters
  * rights
  * page
  * per_page
* cb - _optional_ - A function that is called with an error object and a broadcast object

##### Returns
* If the Promise fulfills, the fulfillment value is a broadcast object

## Test

```
npm test
```

To generate a test coverage report:

```
npm run coverage
```
