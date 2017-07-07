import path from 'path'
import Markdown from 'markdown-it'
import importFrom from 'import-from'

export default function({ types: t }) {
  return {
    visitor: {
      TaggedTemplateExpression(path, { opts, file }) {
        if (
          t.isIdentifier(path.node.tag, {
            name: 'markdown'
          })
        ) {
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
          } else if (typeof opts.use === 'object') {
            for (const plugin in opts.use) {
              const pluginOptions = opts.use[plugin]
              md.use(plugin, pluginOptions)
            }
          }

          const string = path.get('quasi').evaluate().value
          const html = md.render(string)
          path.replaceWith(t.StringLiteral(html))
        }
      }
    }
  }
}

function importPlugin(name, file) {
  if (typeof name === 'string') {
    const cwd = file === 'unknown' ? process.cwd() : path.dirname(file)
    return importFrom(cwd, `markdown-it-${name}`)
  }
  return name
}
