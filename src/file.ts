import * as fs from 'fs'

export default class StackOutputFile {
  constructor(
    public path: string
  ) { }

  public format(data: object) {
    const ext = this.path.split('.').pop() || ''

    switch (ext.toUpperCase()) {
      case 'JSON':
        return JSON.stringify(data, null, 2)
      case 'TOML':
        return require('tomlify-j0.4')(data, null, 0)
      case 'YAML':
      case 'YML':
        return require('yamljs').stringify(data)
      case 'ENV':
        return Object.keys(data).map((key) => `${key}=${data[key]}`).join('\n')
      default:
        throw new Error('No formatter found for `' + ext + '` extension')
    }
  }

  public save(data: object) {
    const content = this.format(data)

    try {
      fs.writeFileSync(this.path, content)
    } catch (e) {
      throw new Error('Cannot write to file: ' + this.path)
    }

    return Promise.resolve()
  }
}
