## createLocalVue()

- **参数：**

  - `{Object} options`
    - `{Function} errorHandler`

- **返回值：**

  - `{Component}`

- **用法：**

`createLocalVue` 返回一个 Vue 的类供你添加组件、混入和安装插件而不会污染全局的 Vue 类。

在组件渲染功能和观察者期间，[`errorHandler`](https://cn.vuejs.org/v2/api/index.html#errorHandler)选项可用于处理未捕获的错误。

可通过 `options.localVue` 来使用：

**Without options:**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import MyPlugin from 'my-plugin'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(MyPlugin)
const wrapper = shallowMount(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallowMount(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

**使用[`errorHandler`](https://cn.vuejs.org/v2/api/index.html#errorHandler)选项:**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const errorHandler = (err, vm, info) => {
  expect(err).toBeInstanceOf(Error)
}

const localVue = createLocalVue({
  errorHandler
})

// Foo在生命周期挂钩中引发错误
const wrapper = shallowMount(Foo, {
  localVue
})
```

- **延伸阅读：**[常用技巧](../guides/common-tips.md#applying-global-plugins-and-mixins)
