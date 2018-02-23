# `createLocalVue()`

- **返回值：**
  - `{Component}`

- **用法：**

`createLocalVue` 返回一个 Vue 的类供你添加组件、混入和安装插件而不会污染全局的 Vue 类。

可通过 `options.localVue` 来使用：

```js
import { createLocalVue, shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallow(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallow(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

- **延伸阅读：**[常用技巧](../guides/common-tips.md#applying-global-plugins-and-mixins)
