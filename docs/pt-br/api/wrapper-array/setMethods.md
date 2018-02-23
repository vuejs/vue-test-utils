# setMethods(methods)

Define os métodos do componente e força sua atualização para cada wrapper no Array.

**Nota: cada wrapper deve ser uma instância do Vue.**

- **Argumentos:**
  - `{Object} methods`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
const mockClique = sinon.stub()

barArray.setMethods({ methodoClique: mockClique })
barArray.at(0).trigger('click')
expect(mockClique.called).toBe(true)
```
