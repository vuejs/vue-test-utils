# trigger(eventName)

Triggers an event on each wrapper in the wrapper array

### Arguments

event (`String`): type of event (e.g. click).

## Example

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
