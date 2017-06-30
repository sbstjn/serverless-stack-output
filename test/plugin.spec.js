'use strict'

const sinon = require('sinon')
const Plugin = require('../')

describe('Plugin', () => {
  let providerMock = null
  let getProvider = null
  let provider = {
    request: () => true,
    sdk: {
      VERSION: '2.21.0'
    }
  }

  beforeEach(() => {
    providerMock = sinon.mock(provider)
    getProvider = sinon.stub().returns(provider)
  })

  afterEach(() => {
    providerMock.restore()
  })

  describe('Configuration', () => {
    it('hasHandler', () => {
      const config = {
        cli: { log: () => {} },
        region: 'us-east-1',
        service: {
          provider: {
            name: 'aws'
          },
          custom: {
            output: {
              handler: 'foo/bar.baz'
            }
          }
        },
        getProvider
      }

      const test = new Plugin(config)

      expect(test.hasHandler()).toBe(true)
      expect(test.hasFile()).toBe(false)
    })
  })

  describe('Configuration', () => {
    it('hasFile', () => {
      const config = {
        cli: { log: () => {} },
        region: 'us-east-1',
        service: {
          provider: {
            name: 'aws'
          },
          custom: {
            output: {
              file: './foo/bar.toml'
            }
          }
        },
        getProvider
      }

      const test = new Plugin(config)

      expect(test.hasHandler()).toBe(false)
      expect(test.hasFile()).toBe(true)
    })
  })
})
