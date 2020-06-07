## enableAutoDestroy(hook)

- **参数：**

  - `{Function} hook`

- **用法：**

`enableAutoDestroy` 将会使用被传入的该钩子函数 (例如 [`afterEach`](https://jestjs.io/docs/en/api#aftereachfn-timeout)) 销毁所有被创建的 `Wrapper` 实例。在调用这个方法之后，你可以通过调用 `resetAutoDestroyState` 方法恢复到默认行为。

```js
import { enableAutoDestroy, mount } from '@vue/test-utils'
import Foo from './Foo.vue'

// 将会在每个测试之后运行 `wrapper.destroy()`
enableAutoDestroy(afterEach)

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
    // 不需要在此运行 `wrapper.destroy()`
  })
})
```
