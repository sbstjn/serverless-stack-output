const fs = require('fs')

const formats = {
  TYPE_YAML: 'yaml',
  TYPE_TOML: 'toml',
  TYPE_JSON: 'json'
}

class File {
  constructor (path) {
    this.path = path
  }

  type () {
    const ext = this.path.split('.').pop()

    switch (ext.toUpperCase()) {
      case 'YAML':
      case 'YML':
        return formats.TYPE_YAML
      case 'TOML':
        return formats.TYPE_TOML
      case 'JSON':
        return formats.TYPE_JSON
      default:
        throw new Error('No formatter found for `' + ext + '` extension')
    }
  }

  format (data) {
    const formatter = require('./formats/' + this.type()).format

    return formatter(data)
  }

  save (data, options) {
    const content = this.format(data, options)

    try {
      fs.writeFileSync(this.path, content)
    } catch (e) {
      throw new Error('Cannot write to file: ' + this.path)
    }
  }
}

module.exports = File
