## get

::: warning Deprecation warning
Using `get` to search for a Component is deprecated and will be removed. Use [`getComponent`](./getComponent.md) instead.
:::

Works just like [find](./find.md) but will throw an error if nothing matching
the given selector is found. You should use `find` when searching for an element
that may not exist. You should use this method when getting an element that should
exist and it will provide a nice error message if that is not the case.

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Foo)

// similar to `wrapper.find`.
// `get` will throw an error if an element is not found. `find` will do nothing.
expect(wrapper.get('.does-exist'))

expect(() => wrapper.get('.does-not-exist'))
  .to.throw()
  .with.property(
    'message',
    'Unable to find .does-not-exist within: <div>the actual DOM here...</div>'
  )
```
