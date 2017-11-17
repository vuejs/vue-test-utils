# name()

Retorna o nome do componente se o embrulho for uma instância do Vue, ou então o nome da tag se o embrulho for um elemento do DOM e não for uma instância do Vue.

- **Retorna:** `{string}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
