# `trigger(eventName)`

在该 `Wrapper` DOM 节点上触发一个事件。

`trigger` 带有一个可选的 `options` 对象。`options` 对象内的属性会被添加到事件上。

- **参数：**
  - `{string} eventName`
  - `{Object} options`

- **示例：**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

wrapper.trigger('click')

wrapper.trigger('click', {
  button: 0
})

expect(clickHandler.called).toBe(true)
```
