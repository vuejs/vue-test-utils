# name()

Retorna o nome do componente se o wrapper for uma instância do Vue, ou então o nome da tag se o wrapper for um elemento do DOM e não for uma instância do Vue.

- **Retorna:** `{String}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
