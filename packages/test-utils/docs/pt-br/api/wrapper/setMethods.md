# setMethods(methods)

Define os métodos do `vm` do wrapper e força sua atualização.

**Nota: o wrapper deve ser uma instância do Vue.**

- **Argumentos:**
  - `{Object} methods`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const mockClique = sinon.stub()

wrapper.setMethods({ metodoClique: mockClique })
wrapper.find('button').trigger('click')
expect(mockClique.called).toBe(true)
```
