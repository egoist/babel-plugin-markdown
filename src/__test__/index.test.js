import fs from 'fs'
import path from 'path'
import * as babel from 'babel-core'
import plugin from '../'

test('it works', () => {
  compare({
    input: 'markdown`# hi ${1+1}`'
  })
})

test('it only transforms markdown', () => {
  compare({
    input: 'const a = markdown`# hi`; const b = md`# bye`'
  })
})

test('markdown-it options', () => {
  compare({
    input: fixture('opts.js').trim(),
    pluginOptions: {
      highlight() {
        return 'hahah'
      },
      plugins: ['task-lists']
    },
    babelOptions: {
      filename: __filename
    }
  })
})

function compare({ input, pluginOptions, babelOptions }) {
  const { code } = babel.transform(input, {
    babelrc: false,
    plugins: [[plugin, pluginOptions]],
    ...babelOptions
  })
  expect(code).toMatchSnapshot()
}

function fixture(...args) {
  return fs.readFileSync(path.join(__dirname, '__fixtures__', ...args), 'utf8')
}
