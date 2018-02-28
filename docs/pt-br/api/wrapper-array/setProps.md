# setProps(props)

Define as `propriedades` do componente e força sua atualização para cada wrapper no Array.

**Nota: cada wrapper deve ser uma instância do Vue.**

- **Argumentos:**
  - `{Object} propriedades`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setProps({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
