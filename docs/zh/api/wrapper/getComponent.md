## getComponent

和 [findComponent](./findComponent.md) 工作起来一样，但是如果未匹配到给定的选择器时会抛出错误。当搜索一个可能不存在的元素时你应该使用 `findComponent`。当获取一个应该存在的元素时你应该使用这个方法，并且如果没有找到的话它会提供一则友好的错误信息。

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

// 和 `wrapper.findComponent` 相似。
// 如果 `getComponent` 没有找到任何元素将会抛出一个而错误。`findComponent` 则不会做任何事。
expect(wrapper.getComponent(Bar)) // => gets Bar by component instance
expect(wrapper.getComponent({ name: 'bar' })) // => gets Bar by `name`
expect(wrapper.getComponent({ ref: 'bar' })) // => gets Bar by `ref`

expect(() => wrapper.getComponent({ name: 'does-not-exist' }))
  .to.throw()
  .with.property(
    'message',
    "Unable to get a component named 'does-not-exist' within: <div>the actual DOM here...</div>"
  )
```
