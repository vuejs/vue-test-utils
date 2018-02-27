# trigger(eventName {, options}])

Aciona um evento do elemento do wrapper.

O método `trigger` usa o objeto opicional `options`, essas opções serão adicionadas ao evento.

- **Argumentos:**
  - `{String} eventName`
  - `{Object} options`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
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

expect(clickHandler.called).toBe(true)
```
