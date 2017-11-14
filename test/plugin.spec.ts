import sinon from 'sinon'

import Plugin from '../src/plugin'

describe('Plugin', () => {
  let providerMock = null
  let getProvider = null
  const provider = {
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
        cli: { log: () => null },
        config: {
          servicePath: ''
        },
        getProvider,
        region: 'us-east-1',
        service: {
          custom: {
            output: {
              handler: 'foo/bar.baz'
            }
          },
          provider: {
            name: 'aws'
          }
        }
      }

      const test = new Plugin(config, { serverless: true }, { options: true })

      expect(test.hasHandler()).toBe(true)
      expect(test.hasFile()).toBe(false)

      expect(test.handler).toContain('foo/bar.baz')
    })
  })

  describe('Configuration', () => {
    it('hasFile', () => {
      const config = {
        cli: { log: () => null },
        config: {
          servicePath: ''
        },
        getProvider,
        region: 'us-east-1',
        service: {
          custom: {
            output: {
              file: 'foo/bar.toml'
            }
          },
          provider: {
            name: 'aws'
          }
        }
      }

      const test = new Plugin(config)

      expect(test.hasHandler()).toBe(false)
      expect(test.hasFile()).toBe(true)

      expect(test.file).toContain('foo/bar.toml')
    })
  })
})
