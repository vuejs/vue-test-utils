
# setMethods(methods)

- **Usage:**

Sets `Wrapper` `vm` methods and forces update on each `Wrapper` in `WrapperArray`.

**Note every `Wrapper` must contain a Vue instance.**

- **Arguments:**
  - `{Object} methods`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
const clickMethodStub = sinon.stub()

barArray.setMethods({ clickMethod: clickMethodStub })
barArray.at(0).trigger('click')
expect(clickMethodStub.called).to.equal(true)
```
