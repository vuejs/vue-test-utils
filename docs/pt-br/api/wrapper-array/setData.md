# setData(data)

Define os dados e força a atualização de cada wrapper presente no Array.

**Nota: cada wrapper deve ser uma instância do Vue.**

- **Argumentos:**
  - `{Object} data`

- **Exemplho:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setData({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
