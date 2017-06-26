# scopedVue

scopedVue returns a Vue instance for you to install plugins without polluting the global Vue instance.

Use it with `options.instance`

### Returns

A scoped Vue instance

### Example

```js
import { scopedVue, shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const instance = scopedVue()
const wrapper = shallow(Foo, {
  instance,
  intercept: { foo: true }
})
expect(wrapper.vm.foo).to.equal(true)

const freshWrapper = shallow(Foo)
expect(freshWrapper.vm.foo).to.equal(false)
```
