# isVueInstance()

`Wrapper`がVueのinstanceか検証します。
 
- **戻り値:** `{boolean}`

- **例:**

 ```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).to.equal(true)
 ```
 