## destroy

销毁一个 Vue 组件实例。

- **示例：**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

const spy = sinon.stub()
mount({
  render: null,
  destroyed() {
    spy()
  }
}).destroy()
expect(spy.calledOnce).toBe(true)
```

如果挂载时 `attachToDocument` 被设为 `true`，则组件的 DOM 元素也将会从文档中被移除。

对于函数式组件来说，`destroy` 只会从文档中移除渲染出来的 DOM 元素。
