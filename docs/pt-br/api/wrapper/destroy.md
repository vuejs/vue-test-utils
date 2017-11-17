# destroy()

Destrói a instância do componente Vue.

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import sinon from 'sinon'

const spy = sinon.stub()

mount({
  render: null,
  destroyed () {
    spy()
  }
}).destroy()

expect(spy.calledOnce).to.equal(true)
```
