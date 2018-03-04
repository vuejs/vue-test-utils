# 用 Mocha 和 webpack 测试单文件组件

> 我们在 [GitHub](https://github.com/https://github.com/vuejs/vue-test-utils-mocha-webpack-example) 上放有一个关于这些设置的示例工程。

另一个测试单文件组件的策略是通过 webpack 编译所有的测试文件然后在测试运行器中运行。这样做的好处是可以完全支持所有 webpack 和 `vue-loader` 的功能，所以我们不必对我们的源代码做任何妥协。

从技术的角度讲，你可以使用任何喜欢的测试运行器并把所有的东西都手动串联起来，但是我们已经找到了 [`mocha-webpack`](https://github.com/zinserjan/mocha-webpack) 能够为这项特殊任务提供非常流畅的体验。

## 设置 `mocha-webpack`

我们假定你在一开始已经安装并配置好了 webpack、vue-loader 和 Babel——例如通过 `vue-cli` 创建了 `webpack-simple` 模板脚手架。

首先要做的是安装测试依赖：

``` bash
npm install --save-dev @vue/test-utils mocha mocha-webpack
```

接下来我们需要在 `package.json` 中定义一个测试脚本。

```json
// package.json
{
  "scripts": {
    "test": "mocha-webpack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

这里有一些注意事项：

- `--webpack-config` 标识指定了该测试使用的 webpack 配置文件。在大多数情况下该配置会在其实际项目的配置文件基础上做一些小的调整。我们晚些时候会再聊到这一点。

- `--require` 标识确保了文件 `test/setup.js` 会在任何测试之前运行，这样我们可以在该文件中设置测试所需的全局环境。

- 最后一个参数是该测试包所涵盖的所有测试文件的聚合。

### 提取 webpack 配置

#### 暴露 NPM 依赖

在测试中我们很可能会导入一些 NPM 依赖——这里面的有些模块可能没有针对浏览器的场景编写，也不适合被 webpack 打包。另一个考虑是为了尽可能的将依赖外置以提升测试的启动速度。我们可以通过 `webpack-node-externals` 外置所有的 NPM 依赖：

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  // ...
  externals: [nodeExternals()]
}
```

#### 源码表

源码表在 `mocha-webpack` 中需要通过内联的方式获取。推荐配置为：

``` js
module.exports = {
  // ...
  devtool: 'inline-cheap-module-source-map'
}
```

如果是在 IDE 中调试，我们推荐添加以下配置：

``` js
module.exports = {
  // ...
  output: {
    // ...
    // 在源码表中使用绝对路径 (对于在 IDE 中调试时很重要)
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
```

### 设置浏览器环境

Vue Test Utils 需要在浏览器环境中运行。我们可以在 Node 中使用 `jsdom-global` 进行模拟：

```bash
npm install --save-dev jsdom jsdom-global
```

然后在 `test/setup.js` 中写入：

``` js
require('jsdom-global')()
```

这行代码会在 Node 中添加一个浏览器环境，这样 Vue Test Utils 就可以正确运行了。

### 选用一个断言库

[Chai](http://chaijs.com/) 是一个流行的断言库，经常和 Mocha 配合使用。你可能也想把 [Sinon](http://sinonjs.org/) 用于创建间谍和存根。

另外你也可以使用 `expect`，它现在是 Jest 的一部分，且在 Jest 文档里暴露了[完全相同的 API](http://facebook.github.io/jest/docs/en/expect.html#content)。

这里我们将使用 `expect` 且令其全局可用，这样我们就不需要在每个测试文件里导入它了：

``` bash
npm install --save-dev expect
```

然后在 `test/setup.js` 中编写：

``` js
require('jsdom-global')()

global.expect = require('expect')
```

### 为测试优化 Babel

注意我们使用了 `babel-loader` 来处理 JavaScript。如果你在你的应用中通过 `.babelrc` 文件使用了 Babel，那么你就已经算是把它配置好了。这里 `babel-loader` 将会自动使用相同的配置文件。

有一件事值得注意，如果你使用了 Node 6+，它已经支持了主要的 ES2015 特性，那么你可以配置一个独立的 Babel [环境选项](https://babeljs.io/docs/usage/babelrc/#env-option)，只转译该 Node 版本中不支持的特性 (比如 `stage-2` 或 flow 语法支持等)。

### 添加一个测试

在 `src` 目录中创建一个名为 `Counter.vue` 的文件：

``` html
<template>
	<div>
	  {{ count }}
	  <button @click="increment">自增</button>
	</div>
</template>

<script>
export default {
  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}
</script>
```

然后创建一个名为 `test/Counter.spec.js` 的测试文件并写入如下代码：

```js
import { shallow } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('计数器在点击按钮时自增', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toMatch('1')
  })
})
```

现在我们运行测试：

```
npm run test
```

喔，我们的测试运行起来了！

### 测试覆盖率

如果想设置 `mocha-webpack` 的测试覆盖率，请参照 [`mocha-webpack` 测试覆盖率指南](https://github.com/zinserjan/mocha-webpack/blob/master/docs/guides/code-coverage.md)。

### 相关资料

- [该设置的示例工程](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Mocha](https://mochajs.org/)
- [mocha-webpack](http://zinserjan.github.io/mocha-webpack/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
- [jest/expect](http://facebook.github.io/jest/docs/en/expect.html#content)
