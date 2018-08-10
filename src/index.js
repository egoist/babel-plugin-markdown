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
      ExportNamedDeclaration(path, state) {
        handleESM(path, state, t, 'isExport')
      },
      ImportDeclaration(path, state) {
        handleESM(path, state, t, 'isImport')
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

function handleESM(path, state, t, key) {
  const { source, specifiers } = path.node

  if (!source || !source.value || !specifiers || !specifiers.length) {
    return
  }

  if (source.value.slice(-3) === '.md') {
    const absolutePath = p.join(
      p.dirname(state.file.opts.filename),
      source.value
    )
    const string = fs.readFileSync(absolutePath, 'utf8')
    path.replaceWith(toAST(string, t, {
      ...state,
      [key]: true,
      id: key === 'isExport' ? specifiers[0].exported : specifiers[0].local,
    }))
  }
}

function toAST(string, t, { opts, file, isImport, isExport, id }) {
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
  const literal = t.StringLiteral(html)

  if (isImport) {
    return t.variableDeclaration('const', [t.variableDeclarator(id, literal)])
  }

  if (isExport) {
    return t.exportNamedDeclaration(t.variableDeclaration('const', [
      t.variableDeclarator(id, literal)
    ]), [], null)
  }

  return literal
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
