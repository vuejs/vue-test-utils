# setProps(props)

Sets `Wrapper` `vm` props and forces update.

**Note the Wrapper must contain a Vue instance.**

- **Arguments:**
  - `{Object} props`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.props().foo).to.equal('bar')
```
