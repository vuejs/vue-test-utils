# `setMethods(methods)`

为 `WrapperArray` 的每个 `Wrapper` `vm` 都设置方法并强行更新。

**注意：该包裹器必须包含一个 Vue 示例。**

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
