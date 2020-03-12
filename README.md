# batch2

[![Travis](https://img.shields.io/travis/com/ovhemert/batch2.svg?branch=master&logo=travis)](https://travis-ci.com/ovhemert/batch2)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/706df16ae6124bb782e7e4a78a0bcfc3)](https://www.codacy.com/app/ovhemert/batch2?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ovhemert/batch2&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/npm/batch2/badge.svg)](https://snyk.io/test/npm/batch2)
[![Coverage Status](https://coveralls.io/repos/github/ovhemert/batch2/badge.svg?branch=master)](https://coveralls.io/github/ovhemert/batch2?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

A transform stream that collects chunks and passes them on as batches.

## Example

Let's say you want to stream documents from a MongoDB collection to ElasticSearch. For every document in the collection, the write stream will emit an event that you use to call ElasticSearch index function. That means that 100.000 documents will result in 100.000 API calls.

The ElasticSearch library has a function to [bulk](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-bulk) index, but since the stream emits a write for each document, we cannot group multiple index operations together.

The batch2 transform stream can help by buffering the chunks/docs and passing them on as batches. For example, we can now create batches of 500 docs each and reduce the number of API calls to ElasticSearch from 100.000 to 200, which will improve speed.

```js
  mongoReadStream()
  .pipe(batch2({ size: 5 }) // transforms multiple chunks (mongo docs) to [chunk, chunk, chunk, chunk, chunk]
  .pipe(transformToElasticBulkOperation())
  .pipe(elasticWriteStream())
```

## Installation

```bash
$ npm install batch2
```

## API

<b><code>batch2(\[options\], \[transformFunction\])</code></b>

Consult the **[stream.Transform](http://nodejs.org/docs/latest/api/stream.html#stream_class_stream_transform)** documentation for the exact rules of the `transformFunction` (i.e. `this._transform`) and the optional `flushFunction` (i.e. `this._flush`).

### options

The options argument is optional and is passed straight through to `stream.Transform`. So you can use `objectMode:true` if you are processing non-binary streams (or just use `batch2.obj()`).

### transformFunction

The `transformFunction` must have the following signature: `function (chunk, encoding, callback) {}`. A minimal implementation should call the `callback` function to indicate that the transformation is done, even if that transformation means discarding the chunk.

To queue a new chunk, call `this.push(chunk)`&mdash;this can be called as many times as required before the `callback()` if you have multiple pieces to send on.

Alternatively, you may use `callback(err, chunk)` as shorthand for emitting a single chunk or an error.

If you **do not provide a `transformFunction`** then you will get a simple pass-through stream.

## Maintainers

Osmond van Hemert
[![Github](https://img.shields.io/badge/-website.svg?style=social&logoColor=333&logo=github)](https://github.com/ovhemert)
[![Web](https://img.shields.io/badge/-website.svg?style=social&logoColor=333&logo=nextdoor)](https://ovhemert.dev)

## Contributing

If you would like to help out with some code, check the [details](./docs/CONTRIBUTING.md).

Not a coder, but still want to support? Have a look at the options available to [donate](https://ovhemert.dev/donate).

## License

Licensed under [MIT](./LICENSE).
