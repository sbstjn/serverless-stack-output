import * as  assert from 'assert'
import * as  util from 'util'

import StackOutputFile from './file'

class StackOutputPlugin {
  public hooks: {}
  private output: OutputConfig

  constructor (private serverless: Serverless, private options: Serverless.Options) {
    this.hooks = {
      'after:deploy:deploy': this.process.bind(this)
    }

    this.output = this.serverless.service.custom.output
  }

  get file () {
    return this.getConfig('file')
  }

  get handler () {
    return this.getConfig('handler')
  }

  get stackName () {
    return this.serverless.service.getServiceName() + '-' + this.serverless.getProvider('aws').getStage()
  }

  private hasConfig (key: string) {
    return !!this.output && !!this.output[key]
  }

  private hasHandler () {
    return this.hasConfig('handler')
  }

  private hasFile () {
    return this.hasConfig('file')
  }

  private getConfig (key: string) {
    return this.serverless.config.servicePath + '/' + this.output[key]
  }

  private callHandler (data: {}) {
    const splits = this.handler.split('.')
    const func = splits.pop() || ''
    const file = splits.join('.')

    return new Promise(resolve => {
      require(file)[func](
        data,
        this.serverless,
        this.options
      )

      resolve()
    })
  }

  private saveFile (data: {}) {
    const f = new StackOutputFile(this.file)

    return new Promise((resolve) => {
      f.save(data)

      resolve()
    })
  }

  private fetch (): Promise<StackDescriptionList> {
    return this.serverless.getProvider('aws').request(
      'CloudFormation',
      'describeStacks',
      {
        StackName: this.stackName
      },
      this.serverless.getProvider('aws').getStage(),
      this.serverless.getProvider('aws').getRegion()
    )
  }

  private beautify (data: {Stacks: Array<{ Outputs: Array<{}> }>}) {
    const stack = data.Stacks.pop() || { Outputs: [] }
    const output = stack.Outputs || []

    return output.reduce(
      (obj: {}, item: StackOutputPair) => Object.assign(obj, {[item.OutputKey]: item.OutputValue}),
      {}
    )
  }

  private handle (data: {}) {
    const promises = []

    if (this.hasHandler()) {
      promises.push(
        this.callHandler(data).then(
          () => this.serverless.cli.log(
            util.format('Stack Output processed with handler: %s', this.output.handler)
          )
        )
      )
    }

    if (this.hasFile()) {
      promises.push(
        this.saveFile(data).then(
          () => this.serverless.cli.log(
            util.format('Stack Output saved to file: %s', this.output.file)
          )
        )
      )
    }

    return Promise.all(promises)
  }

  private validate () {
    assert(this.serverless, 'Invalid serverless configuration')
    assert(this.serverless.service, 'Invalid serverless configuration')
    assert(this.serverless.service.provider, 'Invalid serverless configuration')
    assert(this.serverless.service.provider.name, 'Invalid serverless configuration')
    assert(this.serverless.service.provider.name === 'aws', 'Only supported for AWS provider')

    assert(this.options && !this.options.noDeploy, 'Skipping deployment with --noDeploy flag')
  }

  private process () {
    console.log('running stack-output-plugin')

    return Promise.resolve().then(
      () => this.validate()
    ).then(
      () => this.fetch()
    ).then(
      (res: StackDescriptionList) => this.beautify(res)
    ).then(
      (res) => this.handle(res)
    ).catch(
      (err) => this.serverless.cli.log(util.format('Cannot process Stack Output: %s!', err.message))
    )
  }
}

module.exports = StackOutputPlugin
