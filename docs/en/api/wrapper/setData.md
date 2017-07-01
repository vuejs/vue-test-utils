# setData(data)

- **Arguments:**
  - `{Object} data`

- **Usage:**

Sets `Wrapper` `vm` data and forces update.

**Note the Wrapper must contain a Vue instance.**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.data().foo).to.equal('bar')
```