# setProps(props)

- **Arguments:**
  - `{Object} props`

- **Usage:**

Sets `Wrapper` `vm` props and forces update.

**Note the Wrapper must contain a Vue instance.**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.props().foo).to.equal('bar')
```