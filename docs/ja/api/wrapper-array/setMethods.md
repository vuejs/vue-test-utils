
# setMethods(methods)

- **引数:**
  - `{Object} methods`

- **使い方:**
`WrapperArray`の`Wrapper`ごとに`Wrapper` `vm` メソッドをセットし、強制的に更新します。

**すべての`Wrapper`はVueインスタンスを含んでいなければならないことに注意してください。**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
const clickMethodStub = sinon.stub()

barArray.setMethods({ clickMethod: clickMethodStub })
barArray.at(0).trigger('click')
expect(clickMethodStub.called).to.equal(true)
```
