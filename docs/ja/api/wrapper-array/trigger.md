## trigger(eventName [, options])

`WrapperArray` の DOM ノードのすべての `Wrapper` でイベントを発火します。

**すべての `Wrapper` は Vue インスタンスを含んでいなければならないことに注意してください。**

- **引数:**
   - `{string} eventName` **必須**
   - `{Object} options` **オプション**

- **例:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

test('trigger demo', async () => {
  const clickHandler = sinon.stub()
  const wrapper = mount(Foo, {
    propsData: { clickHandler }
  })

  const divArray = wrapper.findAll('div')
  await divArray.trigger('click')
  expect(clickHandler.called).toBe(true)
})
```
