## trigger

在该 `Wrapper` DOM 节点上异步触发一个事件。

`trigger` 带有一个可选的 `options` 对象。`options` 对象内的属性会被添加到事件上。`trigger` 会返回一个 Promise，当这个 Promise 被解决时，会确保组件已经被更新。

- **参数：**

  - `{string} eventType` **必填**
  - `{Object} options` **可选**

- **示例：**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo'

test('trigger demo', async () => {
  const clickHandler = sinon.stub()
  const wrapper = mount(Foo, {
    propsData: { clickHandler }
  })

  await wrapper.trigger('click')

  await wrapper.trigger('click', {
    button: 0
  })

  await wrapper.trigger('click', {
    ctrlKey: true // 用于测试 @click.ctrl 处理函数
  })

  expect(clickHandler.called).toBe(true)
})
```

- **设置事件目标：**

在这背后，`trigger` 创建了一个 `Event` 对象并分发到其包裹器的元素上。

我们没有机会编辑 `Event` 对象的 `target` 值，所以你无法在选项对象中设置 `target`。

如果想在 `target` 中添加一个特性，你需要在调用 `trigger` 之前设置包裹器元素的那个值。你可以通过 `element` 属性做到这件事。

```js
const input = wrapper.find('input')
input.element.value = 100
input.trigger('click')
```
