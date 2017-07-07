import p from 'path'
import fs from 'fs'
import Markdown from 'markdown-it'
import importFrom from 'import-from'

export default function({ types: t }) {
  return {
    visitor: {
      TaggedTemplateExpression(path, state) {
        const isMarkdown = path.node.tag.name === 'markdown'
        if (isMarkdown) {
          const string = path.get('quasi').evaluate().value
          path.replaceWith(toAST(string, t, state))
        }
      },
      CallExpression(path, state) {
        const isMarkdownRequire = looksLike(path, {
          node: {
            callee: {
              type: 'MemberExpression',
              object: { name: 'markdown' },
              property: { name: 'require' }
            }
          }
        })
        if (isMarkdownRequire) {
          const [source] = path.get('arguments')
          const absolutePath = p.join(
            p.dirname(state.file.opts.filename),
            source.node.value
          )
          const string = fs.readFileSync(absolutePath, 'utf8')
          path.replaceWith(toAST(string, t, state))
        }
      }
    }
  }
}

function toAST(string, t, { opts, file }) {
  const md = new Markdown({
    html: true,
    linkify: true,
    typographer: true,
    ...opts
  })
  if (typeof opts.plugins === 'function') {
    opts.plugins(md)
  } else if (Array.isArray(opts.plugins)) {
    for (const plugin of opts.plugins) {
      if (Array.isArray(plugin)) {
        md.use(importPlugin(plugin[0], file.opts.filename), plugin[1])
      } else {
        md.use(importPlugin(plugin, file.opts.filename))
      }
    }
  } else if (typeof opts.plugins === 'object') {
    for (const plugin in opts.plugins) {
      const pluginOptions = opts.plugins[plugin]
      md.use(plugin, pluginOptions)
    }
  }

  const html = md.render(string)
  return t.StringLiteral(html)
}

function importPlugin(name, file) {
  if (typeof name === 'string') {
    const cwd = file === 'unknown' ? process.cwd() : p.dirname(file)
    return importFrom(cwd, `markdown-it-${name}`)
  }
  return name
}

function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every(bKey => {
      const bVal = b[bKey]
      const aVal = a[bKey]
      if (typeof bVal === 'function') {
        return bVal(aVal)
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal)
    })
  )
}

function isPrimitive(val) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  return val == null || /^[sbn]/.test(typeof val)
}
