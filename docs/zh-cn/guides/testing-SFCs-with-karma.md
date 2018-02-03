# 用 Karma 测试单文件组件

> 我们在 [GitHub](https://github.com/eddyerburgh/vue-test-utils-karma-example) 上放有一个该设置的示例工程。

Karma 是一个启动浏览器运行测试并生成报告的测试运行器。我们会使用 Mocha 框架撰写测试，同时使用 chai 作为断言库。

## 设置 Mocha

我们会假设你一开始已经正确配置好了 webpack、vue-loader 和 Babel——例如通过 `vue-cli` 的 `webpack-simple` 模板搭建起来。

第一件要做的事是安装测试依赖：

``` bash
npm install --save-dev @vue/test-utils karma karma-chrome-launcher karma-mocha karma-sourcemap-loader karma-spec-reporter karma-webpack mocha
```

接下来我们需要在 `package.json` 定义一个测试脚本。

```json
// package.json
{
  "scripts": {
    "test": "karma start --single-run"
  }
}
```

- `--single-run` 标识告诉了 Karma 一次性运行该测试套件。

### Karma 配置

在项目的主目录创建一个 `karma.conf.js` 文件：

```js
// karma.conf.js

var webpackConfig = require('./webpack.config.js')

module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'test/**/*.spec.js'
    ],

    preprocessors: {
      '**/*.spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    reporters: ['spec'],

    browsers: ['Chrome']
  })
}
```

这个文件用来配置 Karma。

我们需要用 webpack 预处理文件。为此，我们将 webpack 添加为预处理器，并引入我们的 webpack 配置。我们可以在项目基础中使用该 webpack 配置文件而无需任何修改。

在我们的配置中，我们在 Chrome 中运行测试。如果想添加其它浏览器，可查阅[Karma 文档的浏览器章节](http://karma-runner.github.io/2.0/config/browsers.html)。

### 选用一个断言库

[Chai](http://chaijs.com/) 是一个流行的常配合 Mocha 使用的断言库。你也可以选用 [Sinon](http://sinonjs.org/) 来创建监视和存根。

我们可以安装 `karma-chai` 插件以在我们的测试中使用 `chai`。

``` bash
npm install --save-dev karma-chai
```

### 添加一个测试

在 `src` 中创建一个名为 `Counter.vue` 的文件：

``` html
<template>
  <div>
    {{ count }}
    <button @click="increment">Increment</button>
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

然后添加一个名为 `test/Coutner.spec.js` 的测试文件，并写入如下代码：

```js
import { expect } from 'chai'
import { shallow } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).contains('1')
  })
})
```

接下来我们可以运行测试：

```
npm run test
```

Woohoo，我们的测试跑起来了！

### 覆盖率

我们可以使用 `karma-coverage` 插件来设置 Karma 的代码覆盖率。

默认情况下，`karma-coverage` 不会使用 source map 来对照覆盖率报告。所以我们需要使用 `babel-plugin-istanbul` 来确认正确匹配的覆盖率。

安装 `karma-coverage`、`babel-plugin-istanbul` 和 `cross-env`：

```
npm install --save-dev karma-coverage cross-env
```

我们会使用 `cross-env` 来设置一个 `BABEL_ENV` 环境变量。这样我们就可以在编译测试的时候使用 `babel-plugin-istanbul`——因为我们不想在生产环境下引入 `babel-plugin-istnabul`：

```
npm install --save-dev babel-plugin-istanbul
```

更新你的 `.babelrc` 文件，在因测试设置了 `BABEL_ENV` 时使用 `babel-plugin-istanbul`：

```json
{
  "presets": [
    ["env", { "modules": false }],
    "stage-3"
  ],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  }
}
```

现在更新 `karma.conf.js` 文件来进行覆盖率测试。添加 `coverage` 到 `reporters` 数组，并添加一个 `coverageReporter` 字段：

```js
// karma.conf.js

module.exports = function (config) {
  config.set({
  // ...

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
```

然后更新 `test` 脚本来设置 `BABEL_ENV`：

```json
// package.json
{
  "scripts": {
    "test": "cross-env BABEL_ENV=test karma start --single-run"
  }
}
```

### 相关资料

- [该设置的示例工程](https://github.com/eddyerburgh/vue-test-utils-karma-example)
- [Karma](http://karma-runner.github.io/)
- [Mocha](https://mochajs.org/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
