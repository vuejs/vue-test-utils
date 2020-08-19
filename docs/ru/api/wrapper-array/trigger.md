## trigger(eventType [, options ])

Генерирует событие на каждом `Wrapper` в `WrapperArray` DOM-узле.

**Обратите внимание, что каждый `Wrapper` должен содержать экземпляр Vue.**

- **Принимает:**

  - `{string} eventType` **обязательный**
  - `{Object} options` **опциональный**

- **Пример:**

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
