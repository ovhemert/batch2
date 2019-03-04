const { WritableMock } = require('stream-mock')
const { Readable } = require('readable-stream')

const test = require('tap').test

const batch2 = require('../src/batch2')

test('stream small string', t => {
  t.plan(1)

  const data = '12345'

  const readStream = new Readable()
  data.split('').forEach(d => readStream.push(d)); readStream.push(null)
  const transformStream = batch2().on('error', (err) => {
    t.fail(err.message)
  })
  const writeStream = new WritableMock({ objectMode: false }).on('finish', () => {
    const res = writeStream.data.toString()
    t.ok(res === data)
  })

  readStream.pipe(transformStream).pipe(writeStream)
})

test('stream large string', t => {
  t.plan(1)

  const data = '12345'.repeat(1000)

  const readStream = new Readable()
  data.split('').forEach(d => readStream.push(d)); readStream.push(null)
  const transformStream = batch2().on('error', (err) => {
    t.fail(err.message)
  })
  const writeStream = new WritableMock({ objectMode: false }).on('finish', () => {
    const res = writeStream.data.toString()
    t.ok(res === data)
  })

  readStream.pipe(transformStream).pipe(writeStream)
})

test('stream few objects', t => {
  t.plan(2)

  const data = '12345'

  const readStream = new Readable({ objectMode: true })
  data.split('').forEach(d => readStream.push({ x: d })); readStream.push(null)
  const transformStream = batch2.obj().on('error', (err) => {
    t.fail(err.message)
  })
  const writeStream = new WritableMock({ objectMode: true }).on('finish', () => {
    t.ok(writeStream.data.length === 1)
    const res = writeStream.data.reduce((prev, curr) => { return prev.concat(curr.map(c => c.x).join('')) }, '')
    t.ok(res === data)
  })

  readStream.pipe(transformStream).pipe(writeStream)
})

test('stream many objects', t => {
  t.plan(2)

  const data = '12345'.repeat(1000)

  const readStream = new Readable({ objectMode: true })
  data.split('').forEach(d => readStream.push({ x: d })); readStream.push(null)
  const transformStream = batch2.obj().on('error', (err) => {
    t.fail(err.message)
  })
  const writeStream = new WritableMock({ objectMode: true }).on('finish', () => {
    t.ok(writeStream.data.length === 500)
    const res = writeStream.data.reduce((prev, curr) => { return prev.concat(curr.map(c => c.x).join('')) }, '')
    t.ok(res === data)
  })

  readStream.pipe(transformStream).pipe(writeStream)
})

test('stream object with default constructor', t => {
  t.plan(2)

  const data = { x: 1 }

  const readStream = new Readable({ objectMode: true })
  readStream.push(data); readStream.push(null)
  const transformStream = batch2({ objectMode: true }).on('error', (err) => {
    t.fail(err.message)
  })
  const writeStream = new WritableMock({ objectMode: true }).on('finish', () => {
    t.ok(writeStream.data.length === 1)
    const res = writeStream.data[0][0]
    t.ok(res.x === data.x)
  })

  readStream.pipe(transformStream).pipe(writeStream)
})

test('stream objects with custom transform', t => {
  t.plan(2)

  const data = '1234'

  const readStream = new Readable({ objectMode: true })
  data.split('').forEach(d => readStream.push(d)); readStream.push(null)
  const transformStream = batch2.obj(function (chunk, enc, callback) {
    callback(null, chunk * 2)
  }).on('error', (err) => {
    t.fail(err.message)
  })
  const writeStream = new WritableMock({ objectMode: true }).on('finish', () => {
    t.ok(writeStream.data.length === 1)
    const res = writeStream.data.reduce((prev, curr) => { return prev.concat(curr.join('')) }, '')
    t.ok(res === '2468')
  })

  readStream.pipe(transformStream).pipe(writeStream)
})

test('fail on objects with error in custom transform', t => {
  t.plan(1)

  const data = '1234'

  const readStream = new Readable({ objectMode: true })
  readStream.push(data); readStream.push(null)
  const transformStream = batch2.obj(function (chunk, enc, callback) {
    callback(new Error('Something went wrong.'))
  }).on('error', (err) => {
    t.ok(err.message === 'Something went wrong.')
  })
  const writeStream = new WritableMock({ objectMode: true }).on('finish', () => {
    t.fail()
  })
  readStream.pipe(transformStream).pipe(writeStream)
})

// test('stream objects with custom flush', t => {
//   t.plan(2)

//   const data = '12345'

//   const readStream = new Readable({ objectMode: true })
//   data.split('').forEach(d => readStream.push(d)); readStream.push(null)
//   const transformStream = batch2.obj(function (chunk, enc, callback) {
//     callback(null, chunk)
//   }).on('error', (err) => {
//     t.fail(err.message)
//   })
//   const writeStream = new WritableMock({ objectMode: true }).on('finish', () => {
//     t.ok(writeStream.data.length === 1)
//     const res = writeStream.data.reduce((prev, curr) => { return prev.concat(curr.join('')) }, '')
//     t.ok(res === '12345')
//   })

//   readStream.pipe(transformStream).pipe(writeStream)
// })
