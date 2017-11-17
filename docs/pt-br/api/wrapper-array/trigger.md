# trigger(nomeDoEvento)

Aciona um evento no elemeto do DOM de cada wrapper no Array.

**Nota: cada wrapper deve ser uma instância do Vue.**

- **Argumentos:**
  - `{string} nomeDoEvento`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Foo from './Foo.vue'

const mockDoClique = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { mockDoClique }
})

const divArray = wrapper.findAll('div')
divArray.trigger('click')

expect(mockDoClique.called).toBe(true)
```
