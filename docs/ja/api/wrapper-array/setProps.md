# setProps(props)

`WrapperArray`の`Wrapper`ごとに`Wrapper` `vm` プロパティをセットし、強制的に更新します。

**すべての`Wrapper`はVueインスタンスを含んでいなければならないことに注意してください。**

- **引数:**
  - `{Object} props`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
barArray.setProps({ foo: 'bar' })
expect(barArray.at(0).vm.foo).to.equal('bar')
```
