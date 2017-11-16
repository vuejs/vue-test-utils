# trigger(eventName)

Triggers an event on the `Wrapper` DOM node.

Trigger takes an optional `options` object. The properties in the `options` object are added to the Event.

You can run preventDefault on the event by passing `preventDefault: true` in `options`.

- **Arguments:**
  - `{string} eventName`
  - `{Object} options`
    - `{boolean} preventDefault`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

wrapper.trigger('click')

wrapper.trigger('click', {
  button: 0
})

wrapper.trigger('click', {
  preventDefault: true
})

expect(clickHandler.called).toBe(true)
```
