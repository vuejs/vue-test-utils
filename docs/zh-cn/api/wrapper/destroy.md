# `destroy()`

销毁一个 Vue 组件实例。

- **示例：**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

const spy = sinon.stub()
mount({
  render: null,
  destroyed () {
    spy()
  }
}).destroy()
expect(spy.calledOnce).toBe(true)
```
