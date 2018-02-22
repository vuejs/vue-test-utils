# trigger(eventName)

Генерирует событие на каждом `Wrapper` в `WrapperArray` DOM узле.

**Обратите внимание, что каждый `Wrapper` должен содержать экземпляр Vue.**

- **Принимает:**
  - `{string} eventName`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

const divArray = wrapper.findAll('div')
divArray.trigger('click')
expect(clickHandler.called).toBe(true)
```
