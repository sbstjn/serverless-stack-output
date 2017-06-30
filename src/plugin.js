'use strict'

const util = require('util')
const assert = require('assert')

const File = require('./file.js')

class Plugin {
  constructor (serverless, options) {
    this.options = options
    this.serverless = serverless

    this.hooks = {
      'after:deploy:deploy': () => this.process()
    }
  }

  get file () {
    return this.getConfig('file')
  }

  get handler () {
    return this.getConfig('handler')
  }

  get stackName () {
    return this.serverless.service.service + '-' + this.options.stage
  }

  hasConfig (key) {
    return !!this.serverless.service.custom.output && !!this.serverless.service.custom.output[key]
  }

  hasHandler () {
    return this.hasConfig('handler')
  }

  hasFile () {
    return this.hasConfig('file')
  }

  getConfig (key) {
    return this.serverless.config.servicePath + '/' + this.serverless.service.custom.output[key]
  }

  callHandler (data) {
    const splits = this.handler.split('.')
    const func = splits.pop()

    return new Promise(resolve => {
      require(splits.join('.'))[func](data)

      resolve()
    })
  }

  saveFile (data) {
    const f = new File(this.file)

    return new Promise(resolve => {
      f.save(data)

      resolve()
    })
  }

  fetch () {
    return this.serverless.getProvider('aws').request(
      'CloudFormation',
      'describeStacks',
      {
        StackName: this.stackName
      },
      this.options.stage,
      this.options.region
    )
  }

  beautify (data) {
    return data.Stacks.pop().Outputs.reduce(
      (obj, item) => Object.assign(obj, {[item.OutputKey]: item.OutputValue}),
      {}
    )
  }

  handle (data) {
    let promises = []

    if (this.hasHandler()) {
      promises.push(
        this.callHandler(data).then(
          () => this.serverless.cli.log(
            util.format('Stack Output processed with handler: %s', this.serverless.service.custom.output.handler)
          )
        )
      )
    }

    if (this.hasFile()) {
      promises.push(
        this.saveFile(data).then(
          () => this.serverless.cli.log(
            util.format('Stack Output saved to file: %s', this.serverless.service.custom.output.file)
          )
        )
      )
    }

    return Promise.all(promises)
  }

  validate () {
    assert(this.serverless, 'Invalid serverless configuration')
    assert(this.serverless.service, 'Invalid serverless configuration')
    assert(this.serverless.service.provider, 'Invalid serverless configuration')
    assert(this.serverless.service.provider.name, 'Invalid serverless configuration')
    assert(this.serverless.service.provider.name === 'aws', 'Only supported for AWS provider')

    assert(this.options && !this.options.noDeploy, 'Skipping deployment with --noDeploy flag')
  }

  process () {
    return Promise.resolve().then(
      () => this.validate()
    ).then(
      () => this.fetch()
    ).then(
      res => this.beautify(res)
    ).then(
      res => this.handle(res)
    ).catch(
      err => this.serverless.cli.log(util.format('Cannot process Stack Output: %s!', err.message))
    )
  }
}

module.exports = Plugin
