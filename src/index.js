import Markdown from 'markdown-it'

export default function({ types: t }) {
  return {
    visitor: {
      TaggedTemplateExpression(path, { opts: { options, plugins } }) {
        if (
          t.isIdentifier(path.node.tag, {
            name: 'markdown'
          })
        ) {
          const md = new Markdown({
            html: true,
            linkify: true,
            typographer: true,
            ...options
          })
          if (typeof plugins === 'function') {
            plugins(md)
          }

          const string = path.get('quasi').evaluate().value
          const html = md.render(string)
          path.replaceWith(t.StringLiteral(html))
        }
      }
    }
  }
}
