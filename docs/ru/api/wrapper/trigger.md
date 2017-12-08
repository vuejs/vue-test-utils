# trigger(eventName)

Вызывает событие на `Wrapper` DOM узле.

В `trigger` также можно передать опциональный объект `options`. Свойства объекта `options` будут добавлены к Event.

Вы можете вызвать `preventDefault` на событие передав `preventDefault: true` в `options`.

- **Принимает:**
  - `{string} eventName`
  - `{Object} options`
    - `{boolean} preventDefault`

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

wrapper.trigger('click', {
  preventDefault: true
})

expect(clickHandler.called).toBe(true)
```
