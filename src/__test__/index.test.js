import fs from 'fs'
import path from 'path'
import * as babel from 'babel-core'

const plugin = require.resolve('../')
test('it works', () => {
  compare({
    input: 'markdown`# hi ${1+1}`',
    output: '"<h1>hi 2</h1>\\n";'
  })
})

test('it only transforms markdown', () => {
  compare({
    input: 'const a = markdown`# hi`; const b = md`# bye`',
    output: 'const a = "<h1>hi</h1>\\n";const b = md`# bye`;'
  })
})

test('markdown-it options', () => {
  compare({
    input: fixture('opts.js').trim(),
    output: fixture('opts.output.js').trim(),
    pluginOptions: {
      options: {
        highlight() {
          return 'hahah'
        }
      }
    }
  })
})

function compare({ input, output, pluginOptions }) {
  const { code } = babel.transform(input, {
    babelrc: false,
    plugins: [[plugin, pluginOptions]]
  })
  expect(code).toBe(output)
}

function fixture(...args) {
  return fs.readFileSync(path.join(__dirname, '__fixtures__', ...args), 'utf8')
}
