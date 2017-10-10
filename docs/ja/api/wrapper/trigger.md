# trigger(eventName)

`Wrapper` DOM ノードのイベントを発火します。

Triggerは `options` オブジェクト形式で行います。`options` オブジェクトのプロパティがイベントに追加されます。

`options` で `preventDefault: true` とすることで、イベントに対して preventDefault を実行することができます。

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

expect(clickHandler.called).toBe(true)
```
