# trigger(eventName)

`Wrapper`のDOMノードのイベントを発火します。

Triggerは`options`オブジェクト形式で行います。`options`オブジェクトのプロパティがイベントに追加されます。

オプションで` preventDefault：true`とすることで、イベントに対してpreventDefaultを実行することができます。

- **引数:**
  - `{string} eventName`
  - `{Object} options` 
    - `{boolean} preventDefault`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

wrapper.trigger('click')

wrapper.trigger('click', {
  button: 0
})

wrapper.trigger('click', {
  preventDefault: true
})

expect(clickHandler.called).to.equal(true)
```