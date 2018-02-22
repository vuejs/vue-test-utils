# trigger(eventName)

`Wrapper` DOM ノードのイベントを発火します。

Triggerは `options` オブジェクト形式で行います。`options` オブジェクトのプロパティがイベントに追加されます。

- **引数:**
  - `{string} eventName`
  - `{Object} options`

- **例:**

```js
import { mount } from '@vue/test-utils'
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

expect(clickHandler.called).toBe(true)
```

- **イベントターゲットの設定:**

`trigger` は `Event` オブジェクトを生成して、Wrapper.element にイベントを送ります。  
`Event` オブジェクトの `target` 値を編集できません。つまり、 `target` を オプションオブジェクトにセットすることはできません。  
`target` の属性を追加するには、 `trigger` を実行する前に Wrapper.element の属性にその値をセットする必要があります。  

```js
const input = wrapper.find('input')
input.element.value = 100
input.trigger('click')
```
