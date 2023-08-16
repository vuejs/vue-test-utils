## O método destroy

Destrói uma instância de componente de Vue.

- **Example:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

const spy = sinon.stub()
mount({
  render: null,
  destroyed() {
    spy()
  }
}).destroy()
expect(spy.calledOnce).toBe(true)
```

Se tanto a opção `attachTo` ou `attachToDocument` forem a causa do componente montar no documento, o componente de elementos do DOM também será removido do documento.

Para componentes funcionais, o `destroy` apenas remove os elementos do DOM renderizados do documento.
