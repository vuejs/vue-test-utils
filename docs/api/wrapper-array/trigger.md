## trigger

Triggers an [event](../../guides/dom-events.md#trigger-events) on every `Wrapper` in the `WrapperArray` DOM node.

**Note every `Wrapper` must contain a Vue instance.**

- **Arguments:**

  - `{string} eventType` **required**
  - `{Object} options` **optional**

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
