# trigger(eventName)

- **Arguments:**
  - `{string} eventName`

- **Usage:**

Triggers an event on the `Wrapper` DOM node.

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

expect(clickHandler.called).to.equal(true)
```