# contains(selector)

Verifica se o wrapper contém um elemento ou componente com o [seletor](../selectors.md) informado.

- **Argumentos:**
  - `{String|Component} selector`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).toBe(true)
expect(wrapper.contains(Bar)).toBe(true)
```

- **Veja também:** [seletores](../selectors.md)
