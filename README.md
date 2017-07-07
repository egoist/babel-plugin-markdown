# babel-plugin-markdown

[![NPM version](https://img.shields.io/npm/v/babel-plugin-markdown.svg?style=flat)](https://npmjs.com/package/babel-plugin-markdown) [![NPM downloads](https://img.shields.io/npm/dm/babel-plugin-markdown.svg?style=flat)](https://npmjs.com/package/babel-plugin-markdown) [![CircleCI](https://circleci.com/gh/egoist/babel-plugin-markdown/tree/master.svg?style=shield)](https://circleci.com/gh/egoist/babel-plugin-markdown/tree/master)  [![codecov](https://codecov.io/gh/egoist/babel-plugin-markdown/branch/master/graph/badge.svg)](https://codecov.io/gh/egoist/babel-plugin-markdown)
 [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

## Install

```bash
yarn add babel-plugin-markdown --dev
```

## Usage

In `.babelrc`:

```js
{
  "plugins": ["markdown"]
}
```

Then you can write:

```js
const html = markdown`
# hello

**This is markdown**
`
```

And you will get:

```js
const html = "<h1>hello</h1><p><strong>This is markdown</strong></p>"
```

### Use with options

```js
{
  "plugins": [
    ["markdown", {
      // All markdown-it options
      "html": false,
      // Plus "plugins":
      "plugins": [
        // It loads "markdown-it-task-lists"
        "task-lists"
      ]
    }]
  ]
}
```

If you want to pass options to a markdown-it plugin, do:

```js
{
  "plugins": [
    ["pluginName", { anyOptions: true }]
  ]
}
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**babel-plugin-markdown** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/babel-plugin-markdown/contributors)).

> [egoistian.com](https://egoistian.com) · GitHub [@egoist](https://github.com/egoist) · Twitter [@rem_rin_rin](https://twitter.com/rem_rin_rin)
