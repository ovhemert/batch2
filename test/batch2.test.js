'use strict'

const test = require('tap').test

const batch2 = require('../src/batch2')

test('stream single string', t => {
  t.plan(1)

  const data = '12345'
  const b2 = batch2().on('data', data => {
    const res = data.toString('ascii')
    t.equal(res, '12345')
  }).on('error', err => {
    t.fail(err.message)
  })
  b2.write(data)
  b2.end()
})

test('stream multiple strings', t => {
  t.plan(5)

  const data = '12345'.repeat(10)
  const b2 = batch2().on('data', data => {
    const res = data.toString('ascii')
    t.equal(res, '1234512345')
  }).on('error', err => {
    t.fail(err.message)
  })
  data.split('').forEach(c => b2.write(c))
  b2.end()
})

test('stream single object', t => {
  t.plan(2)

  const data = { x: '12345' }
  const b2 = batch2.obj().on('data', data => {
    t.equal(data.length, 1)
    t.deepEqual(data[0], { x: '12345' })
  }).on('error', err => {
    t.fail(err.message)
  })
  b2.write(data)
  b2.end()
})

test('stream multiple objects', t => {
  t.plan(10)

  const data = '11111'.repeat(10)
  const b2 = batch2.obj().on('data', data => {
    t.equal(data.length, 10)
    const res = '1'.repeat(10).split('').map(c => { return { x: c } })
    t.deepEqual(data, res)
  }).on('error', err => {
    t.fail(err.message)
  })
  data.split('').forEach(c => b2.write({ x: c }))
  b2.end()
})

test('stream multiple objects with transform', t => {
  t.plan(10)

  const data = '11111'.repeat(10)
  const b2 = batch2.obj(function (chunk, enc, callback) {
    const y = (chunk.x * 2).toString()
    callback(null, { y })
  }).on('data', data => {
    t.equal(data.length, 10)
    const res = '2'.repeat(10).split('').map(c => { return { y: c } })
    t.deepEqual(data, res)
  }).on('error', err => {
    t.fail(err.message)
  })
  data.split('').forEach(c => b2.write({ x: c }))
  b2.end()
})

test('fail on transform', t => {
  t.plan(1)

  const data = 'Something went wrong.'
  const b2 = batch2(function (chunk, enc, callback) {
    callback(new Error(data))
  }).on('data', data => {
    t.fail('Should not emit data.')
  }).on('error', err => {
    t.equal(err.message, data)
  })
  b2.write('test')
  b2.end()
})

test('stream single object with default constructor', t => {
  t.plan(2)

  const data = { x: '12345' }
  const b2 = batch2({ objectMode: true }).on('data', data => {
    t.equal(data.length, 1)
    t.deepEqual(data[0], { x: '12345' })
  }).on('error', err => {
    t.fail(err.message)
  })
  b2.write(data)
  b2.end()
})
