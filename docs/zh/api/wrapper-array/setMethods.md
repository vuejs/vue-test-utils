## setMethods

::: warning 废弃警告
`setMethods` 已经被废弃并会在未来的发布中被移除。

这里没有明确的路径替换 `setMethods`，因为这取决于你之前的用法。这很容易导致依赖实现细节的琐碎的测试，而这是[不推荐的](https://github.com/vuejs/rfcs/blob/668866fa71d70322f6a7689e88554ab27d349f9c/active-rfcs/0000-vtu-api.md#setmethods)。

我们建议重新考虑那些测试。

如果是为了存根一个复杂方法，可将其从组件中提取出来并单独测试。如果是为了断言一个方法被调用，可使用你的测试运行器窥探它。
:::

为 `WrapperArray` 的每个 `Wrapper` `vm` 都设置方法并强行更新。

**注意：该包裹器必须包含一个 Vue 实例。**

- **参数：**

  - `{Object} methods`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
const clickMethodStub = sinon.stub()

barArray.setMethods({ clickMethod: clickMethodStub })
barArray.at(0).trigger('click')
expect(clickMethodStub.called).toBe(true)
```
