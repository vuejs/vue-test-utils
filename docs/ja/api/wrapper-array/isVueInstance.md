# isVueInstance()

- **Returns:** `{boolean}`

- **Usage:**

Assert every `Wrapper` in `WrapperArray` is Vue instance.

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).to.equal(true)
```