# trigger(eventName)

`Wrapper` DOM 노드의 이벤트를 트리거합니다.

트리거는 선택적으로 `options` 객체를 가질 수 있습니다. `options` 객체의 속성이 이벤트에 추가됩니다.

- **전달인자:**
  - `{string} eventName`
  - `{Object} options`

- **예제:**

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
