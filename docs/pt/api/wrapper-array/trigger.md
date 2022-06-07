## O método trigger

Aciona um [evento](../../guides/dom-events.md#trigger-events) em todo `Wrapper` (envolvedor) dentro do `WrapperArray` de nó do DOM.

**Note que todo `Wrapper` deve conter uma instância de Vue.**

- **Argumentos:**

  - `{string} eventType` **obrigatório**
  - `{Object} options` **opcional**

- **Exemplo:**

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
