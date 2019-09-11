## emittedByOrder

Return an Array containing custom events emitted by the `Wrapper` `vm`.

- **Returns:** `Array<{ name: string, args: Array<any> }>`

- **Example:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar', 123)

/*
wrapper.emittedByOrder() returns the following Array:
[
  { name: 'foo', args: [] },
  { name: 'bar', args: [123] }
]
*/

// assert event emit order
expect(wrapper.emittedByOrder().map(e => e.name)).toEqual(['foo', 'bar'])
```
