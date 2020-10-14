## get

::: warning 废弃警告
使用 `get` 搜索组件的方式已经被废弃并会被移除。请换用 [`getComponent`](./getComponent.md)。
:::

和 [find](./find.md) 工作起来一样，但是如果未匹配到给定的选择器时会抛出错误。当搜索一个可能不存在的元素时你应该使用 `find`。当获取一个应该存在的元素时你应该使用这个方法，并且如果没有找到的话它会提供一则友好的错误信息。

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Foo)

// 和 `wrapper.find` 相似。
// 如果 `get` 没有找到任何元素将会抛出一个而错误。`find` 则不会做任何事。
expect(wrapper.get('.does-exist'))

expect(() => wrapper.get('.does-not-exist'))
  .to.throw()
  .with.property(
    'message',
    'Unable to find .does-not-exist within: <div>the actual DOM here...</div>'
  )
```
