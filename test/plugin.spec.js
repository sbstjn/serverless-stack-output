'use strict'

const Plugin = require('../')

it('Works', () => {
  expect(new Plugin({})).toHaveProperty('serverless')
})
