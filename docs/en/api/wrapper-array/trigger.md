# `trigger(eventName)`

Triggers an event on every `Wrapper` in the `WrapperArray` DOM node.

**Note every `Wrapper` must contain a Vue instance.**

- **Arguments:**
  - `{string} eventName`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

const divArray = wrapper.findAll('div')
divArray.trigger('click')
expect(clickHandler.called).toBe(true)
```
