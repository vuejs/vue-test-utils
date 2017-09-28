# emitted()

Return an object containing custom events emitted by the `Wrapper` `vm`.

- **Returns:** `{ [name: string]: Array<Array<any>> }`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'

const wrapper = mount(Foo)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() returns the following object:
{
  foo: [[], [123]]
}
*/

// assert event has been emitted
expect(wrapper.emitted().foo).to.exist

// assert event count
expect(wrapper.emitted().foo.length).to.equal(2)

// assert event payload
expect(wrapper.emitted().foo[1]).to.eql([123])
```
