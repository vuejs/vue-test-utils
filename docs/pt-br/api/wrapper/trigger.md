# trigger(eventName {, options}])

Aciona um evento do elemento do wrapper.

O método `trigger` usa o objeto opicional `options`, essas opções serão adicionadas ao evento.

Você pode rodar o preventDefault em um evento passando `preventDefault: true` no objeto de `options`.

- **Argumentos:**
  - `{String} eventName`
  - `{Object} options`
    - `{Boolean} preventDefault`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo'

const eventoClique = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { eventoClique }
})

wrapper.trigger('click')

wrapper.trigger('click', {
  botao: 0
})

wrapper.trigger('click', {
  preventDefault: true
})

expect(clickHandler.called).toBe(true)
```
