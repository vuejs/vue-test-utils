# 起步

## 安装

快速尝鲜 Vue Test Utils 的办法就是克隆我们的 demo 仓库再加上基本的设置和依赖安装。

``` bash
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
```

### 挂载组件

Vue Test Utils 通过将它们隔离挂载，然后模拟必要的输入 (prop、注入和用户事件) 和对输出 (渲染结果、触发的自定义事件) 的断言来测试 Vue 组件。

被挂载的组件会返回到一个[包裹器](./api/wrapper.md)内，而包裹器会暴露很多封装、遍历和查询其内部的 Vue 组件实例的便捷的方法。

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

describe('计数器', () => {
  // 现在挂载组件，你便得到了这个包裹器
  const wrapper = mount(Counter)

  it('渲染正确的标记', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // 也便于检查已存在的元素
  it('是一个按钮', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

现在运行 `npm test` 进行测试。你应该看得到测试通过。

### 模拟用户交互

当用户点击按钮的时候，我们的计数器应该递增。为了模拟这一行为，我们首先需要通过 `wrapper.find()` 定位该按钮，此方法返回一个**该按钮元素的包裹器**。然后我们能够通过对该按钮包裹器调用 `.trigger()` 来模拟点击。

```js
it('点击按钮应该使得计数递增', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

### 关于 `nextTick` 怎么办？

Vue 会异步的将未生效的 DOM 更新批量应用，以避免因数据反复突变而导致的无谓的重渲染。这也是为什么在实践过程中我们经常在触发状态改变后用 `Vue.nextTick` 来等待 Vue 把实际的 DOM 更新做完的原因。

为了简化用法，Vue Test Utils 同步应用了所有的更新，所以你不需要在测试中使用 `Vue.nextTick` 来等待 DOM 更新。

*注意：当你需要为诸如异步回调或 Promise 解析等操作显性改进为事件循环的时候，`nextTick` 仍然是必要的。*

如果你仍然需要在自己的测试文件中使用 `nextTick`，注意任何在其内部被抛出的错误可能都不会被测试运行器捕获，因为其内部使用了 Promise。关于这个问题有两个建议：要么你可以在测试的一开始将 Vue 的全局错误处理器设置为 `done` 回调，要么你可以在调用 `nextTick` 时不带参数让其作为一个 Promise 返回：

```js
// 这不会被捕获
it('will time out', (done) => {
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

// 接下来的两项测试都会如预期工作
it('will catch the error using done', (done) => {
  Vue.config.errorHandler = done
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

it('will catch the error using a promise', () => {
  return Vue.nextTick()
    .then(function () {
      expect(true).toBe(false)
    })
})
```

## 下一步是什么

- [选择一个测试运行器](./choosing-a-test-runner.md)以把 Vue Test Utils 集成到你的工程里。
- 移步[撰写测试的常见技巧](./common-tips.md)以学习更多。
