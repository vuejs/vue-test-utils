## isVueInstance

::: warning 废弃警告
`isVueInstance` 已经被废弃并会在未来的发布中被移除。

依赖 `isVueInstance` 断言的测试并没有特别大的意义，我们建议将与之相关的断言替换为更有目的性的断言。

为了保留这些测试，一个替换 `isVueInstance()` 的可行方式是对 `wrapper.find(...).vm` 的 truthy 断言。
:::

断言 `Wrapper` 是 Vue 实例。

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
```
