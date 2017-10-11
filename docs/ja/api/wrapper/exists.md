# exists()

`Wrapper`か`WrapperArray`が存在したときに検証します。

`Wrapper`か`WrapperArray`が空だった場合はfalseを返します。

- **戻り値:** `{boolean}`

- **例:**

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
