# trigger(eventName, process)

- **Arguments:**
  - `{string} eventName`
  - `{Function} process` - optional callback allowing to modify event object

- **Usage:**

Triggers an event on the `Wrapper` DOM node.

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo'

const keydownHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { keydownHandler }
})

const input = wrapper.find('input')

// fails
input.trigger('keydown')
// passes
input.trigger('keydown', (e) => {
  e.key = 'Escape'
})

expect(keydownHandler.calledOnce).to.equal(true)
```