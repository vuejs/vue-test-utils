# 用 Jest 测试单文件组件

> 我们在 [GitHub](https://github.com/vuejs/vue-test-utils-jest-example) 上放有一个关于这些设置的示例工程。

Jest 是一个由 Facebook 开发的测试运行器，致力于提供一个“bettery-included”单元测试解决方案。你可以在其[官方文档](https://facebook.github.io/jest/)学习到更多 Jest 的知识。

## 安装 Jest

我们假定你在一开始已经安装并配置好了 webpack、vue-loader 和 Babel——例如通过 `vue-cli` 创建了 `webpack-simple` 模板脚手架。

我们要做的第一件事就是安装 Jest 和 Vue Test Utils：

```bash
$ npm install --save-dev jest @vue/test-utils
```

然后我们需要在 `package.json` 中定义一个单元测试的脚本。

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

## 在 Jest 中处理单文件组件

为了告诉 Jest 如何处理 `*.vue` 文件，我们需要安装和配置 `vue-jest` 预处理器：

``` bash
npm install --save-dev vue-jest
```

接下来在 `package.json` 中创建一个 `jest` 块：

``` json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // 告诉 Jest 处理 `*.vue` 文件
      "vue"
    ],
    "transform": {
      // 用 `vue-jest` 处理 `*.vue` 文件
      ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
    },
    "mapCoverage": true
  }
}
```

> **注意：**`vue-jest` 目前并不支持 `vue-loader` 所有的功能，比如自定义块和样式加载。额外的，诸如代码分隔等 webpack 特有的功能也是不支持的。如果要使用它们，请阅读教程里的[用 Mocha + webpack 测试单文件组件](./testing-SFCs-with-mocha-webpack.md)。

## 处理 webpack 别名

如果你在 webpack 中配置了别名解析，比如把 `@` 设置为 `/src` 的别名，那么你也需要用 `moduleNameMapper` 选项为 Jest 增加一个匹配配置：

``` json
{
  // ...
  "jest": {
    // ...
    // 支持源代码中相同的 `@` -> `src` 别名
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

## 为 Jest 配置 Babel

尽管最新版本的 Node 已经支持绝大多数的 ES2015 特性，你可能仍然想要在你的测试中使用 ES modules 语法和 stage-x 的特性。为此我们需要安装 `babel-jest`：

``` bash
npm install --save-dev babel-jest
```

接下来，我们需要在 `package.json` 的 `jest.transform` 里添加一个入口，来告诉 Jest 用 `babel-jest` 处理 JavaScript 测试文件：

``` json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // 用 `babel-jest` 处理 js
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> 默认情况下，`babel-jest` 会在其安装完毕后自动进行配置。尽管如此，因为我们已经显性的添加了对 `*.vue` 文件的转换，所以现在我们也需要显性的配置 `babel-jest`。

我们假设 webpack 使用了 `babel-preset-env`，这时默认的 Babel 配置会关闭 ES modules 的转译，因为 webpack 已经可以处理 ES modules 了。然而，我们还是需要为我们的测试而开启它，因为 Jest 的测试用例会直接运行在 Node 上。

同样的，我们可以告诉 `babel-preset-env` 面向我们使用的 Node 版本。这样做会跳过转译不必要的特性使得测试启动更快。

为了仅在测试时应用这些选项，可以把它们放到一个独立的 `env.test` 配置项中 (这会被 `babel-jest` 自动获取)。

`.babelrc` 文件示例：

``` json
{
  "presets": [
    ["env", { "modules": false }]
  ],
  "env": {
    "test": {
      "presets": [
        ["env", { "targets": { "node": "current" }}]
      ]
    }
  }
}
```

## 测试快照

你可以使用 [`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer) 将组件渲染为一个字符串，这样它就可以为 [Jest 快照测试](https://facebook.github.io/jest/docs/en/snapshot-testing.html) 保存一个快照。

`vue-server-renderer` 的渲染结果包含了一些服务端渲染特有的特性，且忽略空格，也不易于检索变更。我们可以通过一个自定义的序列化程序来改进被保存的快照：

``` bash
npm install --save-dev jest-serializer-vue
```

然后在 `package.json` 中配置它：

``` json
{
  // ...
  "jest": {
    // ...
    // 快照的序列化程序
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ]
  }
}
```

## 放置测试文件

默认情况下，Jest 将会递归的找到整个工程里所有 `.spec.js` 或 `.test.js` 扩展名的文件。如果这不符合你的需求，你也可以在 `package.json` 里的配置段落中[改变它的 `testRegex`](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string)。

Jest 推荐你在被测试代码的所在目录下创建一个 `__tests__` 目录，但你也可以为你的测试文件随意设计自己习惯的文件结构。不过要当心 Jest 会为快照测试在临近测试文件的地方创建一个 `__snapshots__` 目录。

## 测试覆盖率

Jest 可以被用来生成多种格式的测试覆盖率报告。以下是一个简单的起步的例子：

扩展你的 `jest` 配置 (通常在 `package.json` 或 `jest.config.js` 中) 的 [`collectCoverage`](https://facebook.github.io/jest/docs/en/configuration.html#collectcoverage-boolean) 选项，然后添加 [`collectCoverageFrom`](https://facebook.github.io/jest/docs/en/configuration.html#collectcoveragefrom-array) 数组来定义需要收集测试覆盖率信息的文件。你还需要设置 [`mapCoverage`](https://facebook.github.io/jest/docs/en/configuration.html#mapcoverage-boolean) 为 `true`，以确保测试覆盖率数据的精准。

```json
{
  "jest": {
    // ...
    "collectCoverage": true,
    "collectCoverageFrom": [
      "**/*.{js,vue}",
      "!**/node_modules/**"
    ],
    "mapCoverage": true
  }
}
```

这样就会开启[默认格式的测试覆盖率报告](https://facebook.github.io/jest/docs/en/configuration.html#coveragereporters-array-string)。你可以通过 `coverageReporters` 选项来定制它们。

```json
{
  "jest": {
    // ...
    "coverageReporters": ["html", "text-summary"]
  }
}
```

更多文档内容请移步至 [Jest 配置文档](https://facebook.github.io/jest/docs/en/configuration.html#collectcoverage-boolean)，在那里你可以找到覆盖率阀值、目标输出目录等选项。

## 测试规范示例

如果你已经熟悉了 Jasmine，你应该很适应 Jest 的[断言 API](https://facebook.github.io/jest/docs/en/expect.html#content)：

```js
import { mount } from '@vue/test-utils'
import Component from './component'

describe('Component', () => {
  test('是一个 Vue 实例', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
```

## 相关资料

- [该设置的示例工程](https://github.com/vuejs/vue-test-utils-jest-example)
- [Vue Conf 2017 中的示例和幻灯片](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
