# trigger(eventName)

- **引数:**
  - `{string} eventName

- **使い方:**

Triggers an event on every `Wrapper` in the `WrapperArray` DOM node.
`WrapperArray` のDOMノードのすべての `Wrapper` でイベントを発火します。

**すべての`Wrapper`はVueインスタンスを含んでいなければならないことに注意してください。**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo.vue'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

const divArray = wrapper.findAll('div')
divArray.trigger('click')
expect(clickHandler.called).to.equal(true)
```