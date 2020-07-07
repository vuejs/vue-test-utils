## 不经过构建而使用

在我们习惯于使用工具，诸如 [webpack](https://webpack.js.org/) 打包 Vue 应用、Vue Loader 处理单文件组件、[Jest](https://jestjs.io/) 转写富于表现力测试的同时，使用 Vue Test Utils 其实不需要引入这么多。除了本库之外，使用 Vue Test Utils 最低要求是：

- Vue
- vue-template-compiler
- DOM (可以是 Node 环境下的 [jsdom](https://github.com/jsdom/jsdom) 或真实浏览器)

在这个示例中，我们会展示如何仅使用上述最小化的依赖撰写一个简单的测试。最终的代码可以在[这里](https://github.com/lmiller1990/vue-test-utils-node-basic)找到。

## 安装依赖

我们需要安装一些依赖，如上所述：`npm install vue vue-template-compiler jsdom jsdom-global @vue/test-utils`。该示例不需要测试运行器或打包工具。

## 引入库

现在我们需要引入这些库。这里有一些轻微的注意事项并解释在了如下代码片段的注释中。

```js
// `jsdom-global` 必须在 `@vue/test-utils` 之前被引入，
// 因为 `@vue/test-utils` 需要一个已经存在的 DOM 环境 (真实的 DOM 或 JSDOM)
require('jsdom-global')()

const assert = require('assert')

const Vue = require('vue')
const VueTestUtils = require('@vue/test-utils')
```

如注释中所述，`jsdom-global` 必须优先于 `@vue/test-utils` 被引入。因为 Vue Test Utils 需要一个 DOM 环境来渲染 Vue 组件。如果你在一个真实的浏览器中运行测试，你就完全不需要 `jsdom` 了。`Vue` 也必须在 `@vue/test-utils` 之前被引入，原因很明显——Vue Test Utils 也需要可以正常工作。我们还从 Node 标准库中引入了 `assert`。一般我们会使用测试运行器提供的方法，通常形如 `expect(...).toEqual(...)`，但在这个示例中 `assert` 就可以用来做这件事。

## 撰写一个测试

现在万事俱备，我们需要一个待测试的组件。为了保持简介，我们之渲染一些文本并断言该组件的渲染结果。

```js
const App = Vue.component('app', {
  data() {
    return {
      msg: 'Hello Vue Test Utils'
    }
  },

  template: `
    <div>{{ msg }}</div>
  `
})

const wrapper = VueTestUtils.shallowMount(App)

assert.strictEqual('Hello Vue Test Utils', wrapper.text())
```

如你所见的一样简单。不过因为我们没有构建步骤，我们无法使用单文件组件。但没有什么可以阻止我们通过 `<script>` 标签从 CDN 引入并以同样的方式使用 Vue。
