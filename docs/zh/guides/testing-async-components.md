## 测试异步行为

为了让测试变得简单，`@vue/test-utils` *同步*应用 DOM 更新。不过当测试一个带有回调或 Promise 等异步行为的组件时，你需要留意一些技巧。

API 调用和 Vuex action 都是最常见的异步行为之一。下列例子展示了如何测试一个会调用到 API 的方法。这个例子使用 Jest 运行测试用例同时模拟了 HTTP 库 `axios`。更多关于 Jest 的手动模拟的介绍可移步[这里](https://jestjs.io/docs/zh-Hans/manual-mocks)。

`axios` 的模拟实现大概是这个样子的：

```js
export default {
  get: () => Promise.resolve({ data: 'value' })
}
```

下面的组件在按钮被点击的时候会调用一个 API，然后将响应的值赋给 `value`。

```html
<template>
  <button @click="fetchResults" />
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        value: null
      }
    },

    methods: {
      async fetchResults() {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
  }
</script>
```

测试用例可以写成像这样：

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  expect(wrapper.vm.value).toBe('value')
})
```

现在这则测试用例会失败，因为断言在 `fetchResults` 中的 Promise 完成之前就被调用了。大多数单元测试库都提供一个回调来使得运行期知道测试用例的完成时机。Jest 和 Mocha 都是用了 `done`。我们可以和 `$nextTick` 或 `setTimeout` 结合使用 `done` 来确保任何 Promise 都会在断言之前完成。

```js
it('fetches async when a button is clicked', done => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  wrapper.vm.$nextTick(() => {
    expect(wrapper.vm.value).toBe('value')
    done()
  })
})
```

`setTimeout` 允许测试通过的原因是 Promise 回调的 microtask 队列会在处理 `setTimeout` 的回调的任务队列之前先被处理。也就是说在 `setTimeout` 的回调运行的时候，任何 microtask 队列上的 Promise 回调都已经执行过了。另一方面 `$nextTick` 会安排一个 microtask，但是因为 microtask 队列的处理方式是先进先出，所以也会保证回调在作出断言时已经被执行。更多的解释请移步[这里](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)。

另一个解决方案是使用一个 `async` 函数配合 npm 包 `flush-promises`。`flush-promises` 会清除所有等待完成的 Promise 具柄。你可以 `await` 该 `flushPromises` 调用，以此清除等待中的 Promise 并改进你的测试用例的可读性。

更新后的测试看起来像这样：

```js
import { shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', async () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.vm.value).toBe('value')
})
```

相同的技巧可以被运用在同样默认返回一个 Promise 的 Vuex action 中。
