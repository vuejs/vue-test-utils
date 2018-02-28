# `setMethods(methods)`

设置 `Wrapper` `vm` 的方法并强制更新。

**注意：该包裹器必须包含一个 Vue 示例。**

- **参数：**
  - `{Object} methods`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const clickMethodStub = sinon.stub()

wrapper.setMethods({ clickMethod: clickMethodStub })
wrapper.find('button').trigger('click')
expect(clickMethodStub.called).toBe(true)
```
