import using from 'jasmine-data-provider'
import util from 'util'

import File from '../src/file'

describe('File', () => {
  describe('Constructor', () => {
    it('pass path', () => {
      const f = new File(__dirname)
      expect(f.path).toBe(__dirname)
    })
  })

  describe('Format', () => {
    using(
      [
        {file: 'test.yaml', valid: true, type: 'yaml', data: `foo: bar\n`},
        {file: 'test.yml', valid: true, type: 'yaml', data: `foo: bar\n`},
        {file: 'test.json', valid: true, type: 'json', data: `{\n  "foo": "bar"\n}`},
        {file: 'test.toml', valid: true, type: 'toml', data: 'foo = "bar"'},
        {file: 'test.zip', valid: false}
      ],
      (data) => {
        const name = util.format(
          'detects %s %s',
          data.valid ? 'valid' : 'invalid',
          data.file
        )

        it(name, () => {
          const f = new File(data.file)
          const output = { foo: 'bar' }

          if (data.valid) {
            expect(f.format(output)).toBe(data.data)
          } else {
            expect(() => f.format(output)).toThrow()
          }
        })
      }
    )
  })
})
