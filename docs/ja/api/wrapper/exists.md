# exists()

- **戻り値:** `{boolean}`

- **使い方:**

`Wrapper`か`WrapperArray`が存在したときにアサートします。

`Wrapper`か`WrapperArray`が空だった場合はfalseを返します。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.exists()).to.equal(true)
expect(wrapper.find('does-not-exist').exists()).to.equal(false)
expect(wrapper.findAll('div').exists()).to.equal(true)
expect(wrapper.findAll('does-not-exist').exists()).to.equal(false)
```