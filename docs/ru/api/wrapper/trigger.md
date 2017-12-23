# trigger(eventName)

Вызывает событие на `Wrapper` DOM узле.

В `trigger` также можно передать опциональный объект `options`. Свойства объекта `options` будут добавлены к Event.

- **Принимает:**
  - `{string} eventName`
  - `{Object} options`

- **Пример:**

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

expect(clickHandler.called).toBe(true)
```
