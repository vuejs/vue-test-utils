## trigger

为 `WrapperArray` 的每个 `Wrapper` DOM 节点都触发一个事件。

**注意：该包裹器必须包含一个 Vue 实例。**

- **参数：**

  - `{string} eventType` **必填**
  - `{Object} options` **可选**

- **示例：**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

const divArray = wrapper.findAll('div')
divArray.trigger('click')
expect(clickHandler.called).toBe(true)
```
