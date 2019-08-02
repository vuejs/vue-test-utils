## clearEmitted

Clears emitted events `Wrapper` `vm`.

Helpful when you want to test triggered events on the same wrapper without the need to keep the count.

- **Example:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar')
wrapper.vm.$emit('foobar')

// all events are registered
expect(wrapper.emitted().foo).toBeTruthy()
expect(wrapper.emitted().bar).toBeTruthy()
expect(wrapper.emitted().foobar).toBeTruthy()

// clear events
wrapper.clearEmitted()

// all events are cleared
expect(wrapper.emitted().foo).to.be.empty
expect(wrapper.emitted().bar).to.be.empty
expect(wrapper.emitted().foobar).to.be.empty
expect(wrapper.emittedByOrder().length).to.eql(0)
```

To clear a specific event:

```js
// clear a specific event
wrapper.clearEmitted('bar')

// 'bar' events are no longer registered
expect(wrapper.emitted().foo).toBeTruthy()
expect(wrapper.emitted().bar).to.be.empty
```
