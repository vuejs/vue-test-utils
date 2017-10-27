# emittedByOrder()

Return an Array containing custom events emitted by the `Wrapper` `vm`.

- **Возвращает:** `Array<{ name: string, args: Array<any> }>`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'

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
