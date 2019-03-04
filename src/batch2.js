'use strict'

const through2 = require('through2')

function batch2 (options, transform, flush) {
  const batchSize = options.batchSize || 10
  let _buffer = []

  function _flush (callback) {
    // push remaining buffer
    const batch = _buffer.splice(0, _buffer.length)
    if (batch.length > 0) {
      if (options.objectMode) {
        this.push(batch)
      } else {
        const batchString = batch.reduce((prev, curr) => { return prev.concat(curr.toString()) }, '')
        this.push(batchString)
      }
    }
    // and flush
    flush.call(this, callback)
  }

  function _transform (chunk, enc, callback) {
    transform.call(this, chunk, enc, function (err, data) {
      if (err) { return callback(err) }
      // add to buffer
      _buffer.push(data)
      // still buffering
      if (_buffer.length < batchSize) { return callback() }
      // push buffer
      const batch = _buffer.splice(0, batchSize)
      if (options.objectMode) { return callback(null, batch) }
      const batchString = batch.reduce((prev, curr) => { return prev.concat(curr.toString()) }, '')
      return callback(null, batchString)
    })
  }

  return through2(options, _transform, _flush)
}

function fixParams (options, transform, flush, obj) {
  // fix params
  if (typeof options !== 'object') { flush = transform; transform = options; options = {} }
  if (typeof transform !== 'function') { transform = function (chunk, enc, callback) { callback(null, chunk) } }
  flush = function (callback) { callback() } // if (typeof flush !== 'function') { flush = function (callback) { callback() } }
  const objectMode = obj || (options && options.objectMode) || false
  const _options = { highWaterMark: 16, ...options, objectMode }
  return { options: _options, transform, flush }
}

module.exports = function (options, transform, flush) {
  const params = fixParams(options, transform, flush, false)
  return batch2(params.options, params.transform, params.flush)
}

module.exports.obj = function (options, transform, flush) {
  const params = fixParams(options, transform, flush, true)
  return batch2(params.options, params.transform, params.flush)
}
