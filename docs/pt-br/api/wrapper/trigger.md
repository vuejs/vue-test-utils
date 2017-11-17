# trigger(nomeDoEvento {, opcoes}])

Aciona um evento do elemento do embrulho.

O método `trigger` usa o objeto opicional `opcoes`, essas opções serão adicionadas ao evento.

Você pode rodar o preventDefault em um evento passando `preventDefault: true` no objeto de `opcoes`.

- **Argumentos:**
  - `{string} nomeDoEvento`
  - `{Object} opcoes`
    - `{boolean} preventDefault`

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
