# trigger(eventName, process)

- **Arguments:**
  - `{string} eventName`
  - `{string} process` - optional callback allowing to modify event object

- **Usage:**

Triggers an event on every `Wrapper` in the `WrapperArray` DOM node.

**Note every `Wrapper` must contain a Vue instance.**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo.vue'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

const divArray = wrapper.findAll('div')
divArray.trigger('click')
expect(clickHandler.called).to.equal(true)
```