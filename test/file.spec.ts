'use strict'

import * as using from 'jasmine-data-provider'
import OutputFile from '../src/OutputFile'

describe('File', () => {
  describe('Constructor', () => {
    it('pass path', () => {
      const f = new OutputFile(__dirname)
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
        it('detects' + (data.valid ? ' valid ' : ' invalid ') + data.file, () => {
          const f = new OutputFile(data.file)

          if (data.valid) {
            expect(f.format({ foo: 'bar' })).toBe(data.data)
          } else {
            expect(() => f.format()).toThrow()
          }
        })
      }
    )
  })
})
