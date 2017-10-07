# isVueInstance()
 
- **戻り値:** `{boolean}`

- **使い方:**

`Wrapper`がVueのinstanceかアサートします

 ```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).to.equal(true)
 ```