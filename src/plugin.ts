import * as assert from 'assert'
import * as util from 'util'

import StackOutputFile from './file'

export default class StackOutputPlugin {
  public hooks: {}
  private output: OutputConfig

  constructor (
    private serverless: Serverless,
    private options: Serverless.Options
  ) {
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
    return util.format('%s-%s',
      this.serverless.service.getServiceName(),
      this.serverless.getProvider('aws').getStage()
    )
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
    return util.format('%s/%s',
      this.serverless.config.servicePath,
      this.output[key]
    )
  }

  private callHandler (data: object) {
    const splits = this.handler.split('.')
    const func = splits.pop() || ''
    const file = splits.join('.')

    require(file)[func](
      data,
      this.serverless,
      this.options
    )

    return Promise.resolve()
  }

  private saveFile (data: object) {
    const f = new StackOutputFile(this.file)

    return f.save(data)
  }

  private fetch (): Promise<StackDescriptionList> {
    return this.serverless.getProvider('aws').request(
      'CloudFormation',
      'describeStacks',
      { StackName: this.stackName },
      this.serverless.getProvider('aws').getStage(),
      this.serverless.getProvider('aws').getRegion()
    )
  }

  private beautify (data: {Stacks: Array<{ Outputs: StackOutputPair[] }>}) {
    const stack = data.Stacks.pop() || { Outputs: [] }
    const output = stack.Outputs || []

    return output.reduce(
      (obj, item: StackOutputPair) => (
        Object.assign(obj, { [item.OutputKey]: item.OutputValue })
      ), {}
    )
  }

  private handle (data: object) {
    return Promise.all(
      [
        this.handleHandler(data),
        this.handleFile(data)
      ]
    )
  }

  private handleHandler(data: object) {
    return this.hasHandler() ? (
      this.callHandler(
        data
      ).then(
        () => this.serverless.cli.log(
          util.format('Stack Output processed with handler: %s', this.output.handler)
        )
      )
    ) : Promise.resolve()
  }

  private handleFile(data: object) {
    return this.hasFile() ? (
      this.saveFile(
        data
      ).then(
        () => this.serverless.cli.log(
          util.format('Stack Output saved to file: %s', this.output.file)
        )
      )
    ) : Promise.resolve()
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
    Promise.resolve()
    .then(
      () => this.validate()
    ).then(
      () => this.fetch()
    ).then(
      (res) => this.beautify(res)
    ).then(
      (res) => this.handle(res)
    ).catch(
      (err) => this.serverless.cli.log(
        util.format('Cannot process Stack Output: %s!', err.message)
      )
    )
  }
}
