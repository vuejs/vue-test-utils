# setData(dados)

Define os dados e força a atualização de cada wrapper presente no array.

**Nota: cada wrapper deve ser uma instância do Vue.**

- **Argumentos:**
  - `{Object} dados`

- **Exemplho:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setData({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
