## 起步

### 安装

快速尝鲜 Vue Test Utils 的办法就是克隆我们的 demo 仓库再加上基本的设置和依赖安装。

```bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

你会发现该工程包含了一个简单的组件 `counter.js`：

```js
// counter.js

export default {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

  data() {
    return {
      count: 0
    }
  },

  methods: {
    increment() {
      this.count++
    }
  }
}
```

### 挂载组件

Vue Test Utils 通过将它们隔离挂载，然后模拟必要的输入 (prop、注入和用户事件) 和对输出 (渲染结果、触发的自定义事件) 的断言来测试 Vue 组件。

被挂载的组件会返回到一个[包裹器](../api/wrapper/)内，而包裹器会暴露很多封装、遍历和查询其内部的 Vue 组件实例的便捷的方法。

你可以通过 `mount` 方法来创建包裹器。让我们创建一个名叫 `test.js` 的文件：

```js
// test.js

// 从测试实用工具集中导入 `mount()` 方法
// 同时导入你要测试的组件
import { mount } from '@vue/test-utils'
import Counter from './counter'

// 现在挂载组件，你便得到了这个包裹器
const wrapper = mount(Counter)

// 你可以通过 `wrapper.vm` 访问实际的 Vue 实例
const vm = wrapper.vm

// 在控制台将其记录下来即可深度审阅包裹器
// 我们对 Vue Test Utils 的探索也由此开始
console.log(wrapper)
```

### 测试组件渲染出来的 HTML

现在我们已经有了这个包裹器，我们能做的第一件事就是认证该组件渲染出来的 HTML 符合预期。

```js
import { mount } from '@vue/test-utils'
import Counter from './counter'

describe('Counter', () => {
  // 现在挂载组件，你便得到了这个包裹器
  const wrapper = mount(Counter)

  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // 也便于检查已存在的元素
  it('has a button', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

现在运行 `npm test` 进行测试。你应该看得到测试通过。

### 模拟用户交互

当用户点击按钮的时候，我们的计数器应该递增。为了模拟这一行为，我们首先需要通过 `wrapper.find()` 定位该按钮，此方法返回一个**该按钮元素的包裹器**。然后我们能够通过对该按钮包裹器调用 `.trigger()` 来模拟点击。

```js
it('button click should increment the count', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

为了测试计数器中的文本是否已经更新，我们需要了解 `nextTick`。

### 使用 `nextTick`

Vue 会异步的将未生效的 DOM 批量更新，避免因数据反复变化而导致不必要的渲染。

_你可以阅读[Vue 文档](https://vuejs.org/v2/guide/reactivity.html#Async-Update-Queue)了解更多关于异步指更新的信息。_

更新会引发 DOM 变化的属性后，我们需要使用 `Vue.nextTick()` 等待 Vue 完成 DOM 更新。

在编写测试代码时，我们可以在异步函数里使用`await` `Vue.nextTick()`：

```js
it('button click should increment the count text', async () => {
  expect(wrapper.text()).toContain('0')
  const button = wrapper.find('button')
  button.trigger('click')
  await Vue.nextTick()
  expect(wrapper.text()).toContain('1')
})
```

当你在测试代码中使用 `nextTick` 时，请注意任何在其内部被抛出的错误可能都不会被测试运行器捕获，因为其内部使用了 Promise。关于这个问题有两个建议：要么你可以在测试的一开始将 Vue 的全局错误处理器设置为 `done` 回调，要么你可以在调用 `nextTick` 时不带参数让其作为一个 Promise 返回：

```js
// 这不会被捕获
it('will time out', done => {
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

// 接下来的三项测试都会如预期工作
it('will catch the error using done', done => {
  Vue.config.errorHandler = done
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

it('will catch the error using a promise', () => {
  return Vue.nextTick().then(function() {
    expect(true).toBe(false)
  })
})

it('will catch the error using async/await', async () => {
  await Vue.nextTick()
  expect(true).toBe(false)
})
```

### 下一步是什么

- [选择一个测试运行器](./choosing-a-test-runner.md)以把 Vue Test Utils 集成到你的工程里。
- 移步[撰写测试的常见技巧](./common-tips.md)以学习更多。
