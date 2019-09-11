## emitted

Return an object containing custom events emitted by the `Wrapper` `vm`.

- **Returns:** `{ [name: string]: Array<Array<any>> }`

- **Example:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() returns the following object:
{
  foo: [[], [123]]
}
*/

// assert event has been emitted
expect(wrapper.emitted().foo).toBeTruthy()

// assert event count
expect(wrapper.emitted().foo.length).toBe(2)

// assert event payload
expect(wrapper.emitted().foo[1]).toEqual([123])
```

You can also write the above as follows:

```js
// assert event has been emitted
expect(wrapper.emitted('foo')).toBeTruthy()

// assert event count
expect(wrapper.emitted('foo').length).toBe(2)

// assert event payload
expect(wrapper.emitted('foo')[1]).toEqual([123])
```

The `.emitted()` method returns the same object every time it is called, not a new one, and so the object will update when new events are fired:

```js
const emitted = wrapper.emitted()

expect(emitted.foo.length).toBe(1)

// do something to make `wrapper` emit the "foo" event

expect(emitted.foo.length).toBe(2)
```
