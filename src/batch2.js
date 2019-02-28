'use strict'

const through2 = require('through2')

function batchStream (options = {}, transform, flush) {
  const batchFlush = (typeof flush === 'function') ? flush : function (cb) { cb() }
  const batchSize = options.batchSize || 10
  let _buffer = []
  let _enc = null

  function _flush (callback) {
    let self = this

    // buffer is empty
    if (_buffer.length <= 0) { return batchFlush.call(self, callback) }

    // custom transform
    if (transform) {
      return transform.call(self, _buffer, _enc, function (err) {
        _buffer = []
        if (err) { callback(err) } else { batchFlush.call(self, callback) }
      })
    }

    // process clear buffer
    callback(null, _buffer)
    _buffer = []
    batchFlush.call(self, callback)
  }

  function _transform (message, enc, callback) {
    let self = this
    _enc = enc
    _buffer.push(message)

    // still buffering
    if (_buffer.length < batchSize) { return callback() }
    // custom transform
    if (transform) { return transform.call(self, _buffer, enc, function (err, data) { _buffer = []; callback(err, data) }) }
    // process and clear buffer
    callback(null, _buffer); _buffer = []
  }

  return through2(options, _transform, _flush)
}

module.exports = batchStream

module.exports.obj = function (options = {}, transform, flush) {
  const _options = { highWaterMark: 16, ...options, objectMode: true }
  return module.exports(_options, transform, flush)
}
