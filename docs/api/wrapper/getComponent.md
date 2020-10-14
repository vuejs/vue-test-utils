## getComponent

Works just like [findComponent](./findComponent.md) but will throw an error if nothing matching
the given selector is found. You should use `findComponent` when searching for an element
that may not exist. You should use this method when getting an element that should
exist and it will provide a nice error message if that is not the case.

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

// similar to `wrapper.findComponent`.
// `getComponent` will throw an error if an element is not found. `findComponent` will do nothing.
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
