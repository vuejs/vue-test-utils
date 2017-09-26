# setMethods(methods)

- **Usage:**

Sets `Wrapper` `vm` methods and forces update.

**Note the Wrapper must contain a Vue instance.**

- **Arguments:**
  - `{Object} methods`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const clickMethodStub = sinon.stub()

wrapper.setMethods({ clickMethod: clickMethodStub })
wrapper.find('button').trigger('click')
expect(clickMethodStub.called).to.equal(true)
```
