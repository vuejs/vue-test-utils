# update()

- **Usage:**

Force root Vue component to re-render. 

If called on a `Wrapper` containing a `vm`, it will force the `Wrapper` `vm` to re-render.

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.vm.bar).to.equal('bar')
wrapper.vm.bar = 'new value'
wrapper.update()
expect(wrapper.vm.bar).to.equal('new value')
```