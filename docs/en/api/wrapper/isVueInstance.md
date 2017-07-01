# isVueInstance()
 
- **Returns:** `{boolean}`

- **Usage:**

Assert `Wrapper` is Vue instance.

 ```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).to.equal(true)
 ```